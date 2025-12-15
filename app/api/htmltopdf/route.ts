import { NextRequest, NextResponse } from 'next/server';

const API_KEY = process.env.CHOOSE_PDF_API_KEY || process.env.NEXT_PUBLIC_CHOOSE_PDF_API_KEY || "";
const HTML_TO_PDF_URL = process.env.CHOOSE_PDF_HTML_TO_PDF_URL || process.env.NEXT_PUBLIC_CHOOSE_PDF_HTML_TO_PDF_URL || "https://api.pdf.co/v1/pdf/convert/from/html";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { html, name, margins, paperSize, orientation, printBackground, header, footer, mediaType } = body;

    if (!html || !html.trim()) {
      return NextResponse.json(
        { error: true, message: 'HTML code is required' },
        { status: 400 }
      );
    }

    // Prepare payload for HTML to PDF conversion API
    const payload = {
      html: html.trim(),
      name: name || "converted-document.pdf",
      margins: margins || "5px 5px 5px 5px",
      paperSize: paperSize || "Letter",
      orientation: orientation || "Portrait",
      printBackground: printBackground !== undefined ? printBackground : true,
      header: header || "",
      footer: footer || "",
      mediaType: mediaType || "print",
      async: false,
    };

    // Call external HTML to PDF conversion API
    const response = await fetch(HTML_TO_PDF_URL, {
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
          { error: true, message: text || 'HTML to PDF conversion failed' },
          { status: response.status }
        );
      }
    } catch (parseError) {
      return NextResponse.json(
        { error: true, message: 'Failed to parse response from conversion service' },
        { status: 500 }
      );
    }

    // Handle error response
    if (!response.ok || data.error === true) {
      const errorMessage = data?.message || data?.error || 'HTML to PDF conversion failed';
      return NextResponse.json(
        { error: true, message: errorMessage },
        { status: response.ok ? 400 : response.status }
      );
    }

    // Handle success response - can return either url or urls array
    if (data.error === false) {
      const urls = Array.isArray(data.urls)
        ? data.urls
        : (typeof data.url === 'string' && data.url.length > 0)
          ? [data.url]
          : [];

      if (urls.length > 0) {
        return NextResponse.json({
          error: false,
          urls: urls,
          url: urls[0] // Also include first URL for backward compatibility
        });
      }
    }

    // Fallback error case
    return NextResponse.json(
      { error: true, message: data?.message || 'HTML to PDF conversion failed' },
      { status: 400 }
    );
  } catch (error) {
    console.error('HTML to PDF conversion error:', error);
    return NextResponse.json(
      { error: true, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

