import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { checkRateLimit } from '@/lib/limiter';

const API_KEY = process.env.CHOOSE_PDF_API_KEY || process.env.NEXT_PUBLIC_CHOOSE_PDF_API_KEY || "";
const PDF_TO_QRCODE_URL = process.env.CHOOSE_PDF_PDF_TO_QRCODE_URL || process.env.NEXT_PUBLIC_CHOOSE_PDF_PDF_TO_QRCODE_URL || "https://api.pdf.co/v1/barcode/generate";

// ── Helper: upload decoration image to Supabase ──────────────────────────────
async function uploadToSupabase(file: File) {
  const arrayBuffer = await file.arrayBuffer();
  const fileBuffer = Buffer.from(arrayBuffer);

  const timestamp = Date.now();
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const filePath = `uploads/${timestamp}-${sanitizedName}`;

  const { data, error } = await supabase
    .storage
    .from('server')
    .upload(filePath, fileBuffer, {
      contentType: file.type,
      upsert: false,
    });

  if (error) {
    throw new Error(error.message);
  }

  const { data: publicUrlData } = supabase
    .storage
    .from('server')
    .getPublicUrl(data.path);

  return publicUrlData.publicUrl;
}

// ── Helper: sleep ────────────────────────────────────────────────────────────
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/pdftoqrcode
//
// Processes barcode generation with Redis-based rate limiting.
// Waits for a rate-limit slot (up to ~5s) before calling PDF.co.
// Returns the result directly — no polling needed.
// ─────────────────────────────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || '';

    let name: string | undefined;
    let type: string | undefined;
    let value: string | undefined;
    let inline: boolean | undefined;
    let asyncFlag: boolean | undefined;
    let profiles: string | undefined;
    let decorationImage: string | undefined;

    // Support both JSON and multipart/form-data
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();

      name = (formData.get('name') as string) || undefined;
      type = (formData.get('type') as string) || undefined;
      value = (formData.get('value') as string) || undefined;
      profiles = (formData.get('profiles') as string) || undefined;

      const inlineRaw = formData.get('inline') as string;
      const asyncRaw = formData.get('async') as string;
      inline = inlineRaw === 'true' ? true : inlineRaw === 'false' ? false : undefined;
      asyncFlag = asyncRaw === 'true' ? true : asyncRaw === 'false' ? false : undefined;

      const logoFile = formData.get('decorationImageFile');
      const decorationImageRaw = formData.get('decorationImage') as string;

      // If a file is provided, upload it to Supabase and use its public URL
      if (logoFile && logoFile instanceof File && logoFile.size > 0) {
        decorationImage = await uploadToSupabase(logoFile);
      } else if (decorationImageRaw) {
        decorationImage = decorationImageRaw;
      }
    } else {
      const body = await request.json();
      name = body?.name;
      type = body?.type;
      value = body?.value;
      inline = body?.inline;
      asyncFlag = body?.async;
      profiles = body?.profiles;
      decorationImage = body?.decorationImage;
    }

    // ── Validation ─────────────────────────────────────────────────────────
    if (!value) {
      return NextResponse.json(
        { error: true, message: 'Value is required' },
        { status: 400 }
      );
    }

    if (!type) {
      return NextResponse.json(
        { error: true, message: 'Barcode type is required' },
        { status: 400 }
      );
    }

    if (!API_KEY) {
      return NextResponse.json(
        { error: true, message: 'ChoosePDF API not configured' },
        { status: 500 }
      );
    }

    // ── Rate Limiting: wait for a slot (up to ~5 seconds) ──────────────────
    let allowed = false;
    for (let attempt = 0; attempt < 10; attempt++) {
      allowed = await checkRateLimit();
      if (allowed) break;
      console.log(`[pdftoqrcode] Rate limited, waiting 500ms (attempt ${attempt + 1}/10)`);
      await sleep(500);
    }

    if (!allowed) {
      return NextResponse.json(
        {
          error: true,
          message: 'Rate limit exceeded. Please try again in a moment.',
          retryAfter: 1,
        },
        {
          status: 429,
          headers: {
            'Retry-After': '1',
          },
        }
      );
    }

    // ── Build payload ──────────────────────────────────────────────────────
    const payload: Record<string, any> = {
      name: name || "barcode.png",
      type: type,
      value: value,
      inline: inline !== undefined ? inline : true,
      async: asyncFlag !== undefined ? asyncFlag : false,
      profiles: profiles || JSON.stringify({
        Angle: 0,
        NarrowBarWidth: 30,
        ForeColor: "#000000",
        BackColor: "#ffffff",
      }),
    };

    if (decorationImage) {
      payload.decorationImage = decorationImage;
    }

    // ── Call PDF.co API ────────────────────────────────────────────────────
    const res = await fetch(PDF_TO_QRCODE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": API_KEY,
      },
      body: JSON.stringify(payload),
    });

    // Parse response
    let data;
    try {
      const ct = res.headers.get('content-type');
      if (ct && ct.includes('application/json')) {
        data = await res.json();
      } else {
        const text = await res.text();
        return NextResponse.json(
          { error: true, message: text || 'Barcode generation failed' },
          { status: res.status }
        );
      }
    } catch (parseError) {
      return NextResponse.json(
        { error: true, message: 'Failed to parse response from barcode generation service' },
        { status: 500 }
      );
    }

    console.log('[pdftoqrcode] PDF.co response:', data);

    // Handle error response
    if (!res.ok || data.error === true) {
      const errorMessage = data?.message || data?.error || data?.body?.error || 'Barcode generation failed';
      console.error('[pdftoqrcode] API error:', {
        status: res.status,
        error: data?.error,
        message: data?.message,
      });
      return NextResponse.json(
        { error: true, message: errorMessage },
        { status: res.ok ? 400 : res.status }
      );
    }

    // Handle success response
    if (data.error === false && data.url) {
      return NextResponse.json({
        error: false,
        url: data.url,
        name: data.name || name || "qrcode.png",
        status: data.status || 200,
        remainingCredits: data.remainingCredits || 0,
      });
    }

    // Fallback error
    return NextResponse.json(
      { error: true, message: data?.message || 'Barcode generation failed' },
      { status: 400 }
    );
  } catch (error) {
    console.error('[pdftoqrcode] Error:', error);
    return NextResponse.json(
      { error: true, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
