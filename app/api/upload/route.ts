import { NextRequest, NextResponse } from 'next/server';

const API_KEY = process.env.CHOOSE_PDF_API_KEY || process.env.NEXT_PUBLIC_CHOOSE_PDF_API_KEY || "";
const UPLOAD_URL = process.env.CHOOSE_PDF_API_UPLOAD_URL || process.env.NEXT_PUBLIC_CHOOSE_PDF_API_UPLOAD_URL || "";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: true, message: 'No file provided' },
        { status: 400 }
      );
    }

    // Create FormData for external API
    const externalFormData = new FormData();
    externalFormData.append('file', file);

    // Call external API
    const response = await fetch(UPLOAD_URL, {
      method: 'POST',
      headers: { 'x-api-key': API_KEY },
      body: externalFormData,
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: true, message: 'Upload failed' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: true, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

