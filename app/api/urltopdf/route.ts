import { NextRequest, NextResponse } from 'next/server';

const API_KEY = process.env.CHOOSE_PDF_API_KEY || process.env.NEXT_PUBLIC_CHOOSE_PDF_API_KEY || "";
const URL_TO_PDF_API_URL =  process.env.NEXT_PUBLIC_CHOOSE_PDF_API_URL_TO_PDF_URL || "";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url || !url.trim()) {
      return NextResponse.json(
        { error: true, message: 'URL is required' },
        { status: 400 }
      );
    }

    // Call external PDF conversion API
    const response = await fetch(URL_TO_PDF_API_URL, {
      method: 'POST',
      headers: {
        'x-api-key': API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: url,
        name: "result.pdf",
        margins: "1mm",
        paperSize: "Letter",
        orientation: "Landscape",
        printBackground: true,
        header: "",
        footer: "",
        mediaType: "print",
        async: false,
      }),
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: true, message: 'PDF conversion failed' },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // Handle response format
    if (data.error === false) {
      const urls = Array.isArray(data.urls)
        ? data.urls
        : (typeof data.url === 'string' && data.url.length > 0)
          ? [data.url]
          : [];

      if (urls.length > 0) {
        return NextResponse.json({
          error: false,
          urls: urls
        });
      } else {
        return NextResponse.json(
          { error: true, message: 'No PDF files generated' },
          { status: 500 }
        );
      }
    } else {
      return NextResponse.json(
        { error: true, message: data.message || 'Conversion failed' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('URL to PDF conversion error:', error);
    return NextResponse.json(
      { error: true, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

