import { NextRequest, NextResponse } from 'next/server';
import { ratelimit, waitForSlot, releaseSlot, waitForPdfcoSlot } from '@/lib/queueSystem';
import { generateId } from '@/utils/uuid';

const API_KEY = process.env.CHOOSE_PDF_API_KEY || process.env.NEXT_PUBLIC_CHOOSE_PDF_API_KEY || "";
const PDF_TO_QRCODE_URL = process.env.CHOOSE_PDF_PDF_TO_QRCODE_URL || process.env.NEXT_PUBLIC_CHOOSE_PDF_PDF_TO_QRCODE_URL || "https://api.pdf.co/v1/barcode/generate";

export async function POST(request: NextRequest) {
  const t0 = Date.now();
  const ip = request.headers.get('x-forwarded-for') ?? 'anonymous';
  const jobId = generateId();

  // ── Rate Limit + Slot — run in parallel ──────────────────────────────────
  const [{ success: allowed }, gotSlot] = await Promise.all([
    ratelimit.limit(ip),
    waitForSlot(jobId),
  ]);
  console.log(`[pdftoqrcode] rateLimit+slot: ${Date.now() - t0}ms`);

  if (!allowed) {
    if (gotSlot) await releaseSlot(jobId);
    return NextResponse.json(
      { error: true, message: 'Too many requests', retryAfter: '1 minute' },
      { status: 429 }
    );
  }

  if (!gotSlot) {
    return NextResponse.json(
      { error: true, message: 'Server busy, please try again shortly' },
      { status: 503 }
    );
  }

  try {
    const contentType = request.headers.get('content-type') || '';

    let name: string | undefined;
    let type: string | undefined;
    let value: string | undefined;
    let inline: boolean | undefined;
    let asyncFlag: boolean | undefined;
    let profiles: string | undefined;
    let decorationImage: string | undefined;
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

      if (logoFile && logoFile instanceof File && logoFile.size > 0) {
        // decoration image file handling removed (Supabase upload removed)
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

    // ── PDF.co global rate limit (max 2/sec) ──────────────────────────────
    const t1 = Date.now();
    const pdfcoReady = await waitForPdfcoSlot();
    console.log(`[pdftoqrcode] pdfcoSlot: ${Date.now() - t1}ms`);
    if (!pdfcoReady) {
      return NextResponse.json(
        { error: true, message: 'Server busy, please try again shortly' },
        { status: 503 }
      );
    }

    // ── Call PDF.co API ────────────────────────────────────────────────────
    const t2 = Date.now();
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

    console.log(`[pdftoqrcode] PDF.co call: ${Date.now() - t2}ms`);
    console.log(`[pdftoqrcode] total so far: ${Date.now() - t0}ms`);
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
  } finally {
    await releaseSlot(jobId);
  }
}
