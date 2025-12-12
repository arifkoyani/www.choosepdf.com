import { NextRequest, NextResponse } from 'next/server';

const API_KEY = process.env.CHOOSE_PDF_API_KEY || process.env.NEXT_PUBLIC_CHOOSE_PDF_API_KEY || "";
const SPLIT_URL = process.env.CHOOSE_PDF_API_SPLIT_URL || "";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, pages } = body;

    if (!url || !pages) {
      return NextResponse.json(
        { error: true, message: 'File URL and page numbers are required' },
        { status: 400 }
      );
    }

    // Call external PDF split API
    const response = await fetch(SPLIT_URL, {
      method: 'POST',
      headers: {
        'x-api-key': API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: url,
        pages: pages.replace(/\s/g, ""),
        inline: true,
        name: `split-result-${Date.now()}.pdf`,
        async: false,
      }),
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: true, message: 'PDF split failed' },
        { status: response.status }
      );
    }

    const data = await response.json();

    if (data.error === false && data.urls && data.urls.length > 0) {
      return NextResponse.json({
        error: false,
        urls: data.urls
      });
    } else {
      return NextResponse.json(
        { error: true, message: data.message || 'PDF split failed' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('PDF split error:', error);
    return NextResponse.json(
      { error: true, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

