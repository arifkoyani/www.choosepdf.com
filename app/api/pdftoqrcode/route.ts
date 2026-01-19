import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

const API_KEY = process.env.CHOOSE_PDF_API_KEY || process.env.NEXT_PUBLIC_CHOOSE_PDF_API_KEY || "";
const PDF_TO_QRCODE_URL = process.env.CHOOSE_PDF_PDF_TO_QRCODE_URL || process.env.NEXT_PUBLIC_CHOOSE_PDF_PDF_TO_QRCODE_URL || "https://api.pdf.co/v1/barcode/generate";

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

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || '';

    let name: string | undefined;
    let type: string | undefined;
    let value: string | undefined;
    let inline: boolean | undefined;
    let async: boolean | undefined;
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
      async = asyncRaw === 'true' ? true : asyncRaw === 'false' ? false : undefined;

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
      async = body?.async;
      profiles = body?.profiles;
      decorationImage = body?.decorationImage;
    }

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
        { error: true, message: 'ChoosePDF API error configured' },
        { status: 500 }
      );
    }

    // Prepare payload for barcode generation API
    const payload: any = {
      name: name || "barcode.png",
      type: type,
      value: value,
      inline: inline !== undefined ? inline : true,
      async: async !== undefined ? async : false,
      profiles: profiles || JSON.stringify({
        Angle: 0,
        NarrowBarWidth: 30,
        ForeColor: "#000000",
        BackColor: "#ffffff",
      }),
    };

    // Add decorationImage if provided
    if (decorationImage) {
      payload.decorationImage = decorationImage;
    }

    // Call external barcode generation API
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
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
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

    console.log(data);

    // Handle error response
    if (!res.ok || data.error === true) {
      const errorMessage = data?.message || data?.error || data?.body?.error || 'Barcode generation failed';
      console.error('Barcode generation API error:', {
        status: res.status,
        error: data?.error,
        message: data?.message,
        body: data
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

    // Fallback error case
    return NextResponse.json(
      { error: true, message: data?.message || 'Barcode generation failed' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Barcode generation error:', error);
    return NextResponse.json(
      { error: true, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

