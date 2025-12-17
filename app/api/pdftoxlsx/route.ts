import { NextRequest, NextResponse } from 'next/server';

const API_KEY = process.env.CHOOSE_PDF_API_KEY || process.env.NEXT_PUBLIC_CHOOSE_PDF_API_KEY || "";
const PDF_TO_XLSX_URL = process.env.CHOOSE_PDF_PDF_TO_XLSX_URL || process.env.NEXT_PUBLIC_CHOOSE_PDF_PDF_TO_XLSX_URL || "";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, pages, password } = body;

    if (!url) {
      return NextResponse.json(
        { error: true, message: 'File URL is required' },
        { status: 400 }
      );
    }

    if (!API_KEY) {
      return NextResponse.json(
        { error: true, message: 'ChoosePDF API error configured' },
        { status: 500 }
      );
    }

    if (!PDF_TO_XLSX_URL) {
      return NextResponse.json(
        { error: true, message: 'PDF to XLSX service URL is not configured' },
        { status: 500 }
      );
    }

    // Prepare payload for PDF to XLSX conversion API
    const payload = {
      url: url,
      pages: pages || "",
      password: password || "",
      profiles: JSON.stringify({
        ExtractShadowLikeText: false,
        OCRMode: "Auto",
        "OCRImagePreprocessingFilters.AddGrayscale()": [],
        "OCRImagePreprocessingFilters.AddGammaCorrection()": [1.4],
        ColumnDetectionMode: "ContentGroups"
      })
    };

    // Call external PDF to XLSX                         conversion API
    const response = await fetch(PDF_TO_XLSX_URL, {
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
          { error: true, message: text || 'PDF to XLSX conversion failed' },
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
      const errorMessage = data?.message || data?.error || data?.body?.error || 'PDF to XLSX conversion failed';
      console.error('PDF to XLSX conversion API error:', {
        status: response.status,
        error: data?.error,
        message: data?.message,
        body: data
      });
      return NextResponse.json(
        { error: true, message: errorMessage },
        { status: response.ok ? 400 : response.status }
      );
    }

    // Handle success response - support both array and single URL formats
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
          status: data.status || 200,
          remainingCredits: data.remainingCredits || 0,
        });
      }
    }

    // Fallback error case
    return NextResponse.json(
      { error: true, message: data?.message || 'PDF to XLSX conversion failed' },
      { status: 400 }
    );
  } catch (error) {
    console.error('PDF to XLSX conversion error:', error);
    return NextResponse.json(
      { error: true, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

