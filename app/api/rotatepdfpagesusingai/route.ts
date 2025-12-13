import { NextRequest, NextResponse } from 'next/server';

const API_KEY = process.env.CHOOSE_PDF_API_KEY || process.env.NEXT_PUBLIC_CHOOSE_PDF_API_KEY || "";
const ROTATE_PDF_AI_URL = process.env.CHOOSE_PDF_API_ROTATE_PDF_PAGES_USING_AI_URL || process.env.NEXT_PUBLIC_CHOOSE_PDF_API_ROTATE_PDF_PAGES_USING_AI_URL || "";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, lang } = body;

    if (!url) {
      return NextResponse.json(
        { error: true, message: 'File URL is required' },
        { status: 400 }
      );
    }

    // Prepare payload for auto-rotate API
    const payload = {
      url: url,
      lang: lang || "eng",
      name: "result.pdf",
      async: false
    };

    // Call external PDF auto-rotate API
    const response = await fetch(ROTATE_PDF_AI_URL, {
      method: 'POST',
      headers: {
        'x-api-key': API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    // Parse response
    let data;
    try {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        return NextResponse.json(
          { error: true, message: text || 'PDF rotation failed' },
          { status: response.status }
        );
      }
    } catch (parseError) {
      return NextResponse.json(
        { error: true, message: 'Failed to parse response from PDF service' },
        { status: 500 }
      );
    }

    // Handle error response
    if (!response.ok || data.error === true) {
      const errorMessage = data?.message || data?.error || 'PDF rotation failed';
      return NextResponse.json(
        { error: true, message: errorMessage },
        { status: response.ok ? 400 : response.status }
      );
    }

    // Handle success response
    if (data.error === false && data.url) {
      return NextResponse.json({
        error: false,
        url: data.url
      });
    }

    // Fallback error case
    return NextResponse.json(
      { error: true, message: data?.message || 'PDF rotation failed' },
      { status: 400 }
    );
  } catch (error) {
    console.error('PDF rotation error:', error);
    return NextResponse.json(
      { error: true, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

