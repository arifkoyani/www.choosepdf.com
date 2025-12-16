import { NextRequest, NextResponse } from 'next/server';

const API_KEY = process.env.CHOOSE_PDF_API_KEY || process.env.NEXT_PUBLIC_CHOOSE_PDF_API_KEY || "";
const PDF_TO_JSON_BY_AI_URL = process.env.CHOOSE_PDF_PDF_TO_JSON_BY_AI_URL || process.env.NEXT_PUBLIC_CHOOSE_PDF_PDF_TO_JSON_BY_AI_URL || "https://api.pdf.co/v1/pdf/convert/to/json-meta";

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

    if (!PDF_TO_JSON_BY_AI_URL) {
      return NextResponse.json(
        { error: true, message: 'PDF to JSON by AI conversion service URL is not configured' },
        { status: 500 }
      );
    }

    // Prepare payload for PDF to JSON by AI conversion API
    const payload = {
      url: url,
      pages: pages || "",
      password: password || "",
      profiles: JSON.stringify({
        "OCRImagePreprocessingFilters.AddGrayscale()": [],
        "OCRImagePreprocessingFilters.AddGammaCorrection()": [1.4]
      })
    };

    // Call external PDF to JSON by AI conversion API
    const response = await fetch(PDF_TO_JSON_BY_AI_URL, {
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
          { error: true, message: text || 'PDF to JSON by AI conversion failed' },
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
      const errorMessage = data?.message || data?.error || data?.body?.error || 'PDF to JSON by AI conversion failed';
      console.error('PDF to JSON by AI API error:', {
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

    // Handle success response - API returns data.url (singular)
    if (data.error === false && data.url) {
      return NextResponse.json({
        error: false,
        url: data.url,
        name: data.name || "result.json",
        status: data.status || 200,
        remainingCredits: data.remainingCredits || 0,
      });
    }

    // Fallback error case
    return NextResponse.json(
      { error: true, message: data?.message || 'PDF to JSON by AI conversion failed' },
      { status: 400 }
    );
  } catch (error) {
    console.error('PDF to JSON by AI conversion error:', error);
    return NextResponse.json(
      { error: true, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

