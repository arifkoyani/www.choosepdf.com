import { NextRequest, NextResponse } from 'next/server';

const API_KEY = process.env.CHOOSE_PDF_API_KEY || process.env.NEXT_PUBLIC_CHOOSE_PDF_API_KEY || "";
const MAKE_SEARCHABLE_URL = process.env.CHOOSE_PDF_API_MAKE_SEARCHABLE_URL || process.env.NEXT_PUBLIC_CHOOSE_PDF_API_MAKE_SEARCHABLE_URL || "https://api.pdf.co/v1/pdf/makesearchable";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, lang, pages, name, password, profiles } = body;

    if (!url) {
      return NextResponse.json(
        { error: true, message: 'File URL is required' },
        { status: 400 }
      );
    }

    // Prepare payload for make searchable API
    const payload = {
      url: url,
      lang: lang || "eng",
      pages: pages || "",
      name: name || `searchable-${Date.now()}.pdf`,
      password: password || "",
      async: false,
      profiles: profiles || ""
    };

    // Call external PDF make searchable API
    const response = await fetch(MAKE_SEARCHABLE_URL, {
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
          { error: true, message: text || 'PDF make searchable failed' },
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
      const errorMessage = data?.message || data?.error || 'PDF make searchable failed';
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
      { error: true, message: data?.message || 'PDF make searchable failed' },
      { status: 400 }
    );
  } catch (error) {
    console.error('PDF make searchable error:', error);
    return NextResponse.json(
      { error: true, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

