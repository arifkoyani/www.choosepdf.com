import { NextRequest, NextResponse } from 'next/server';

const API_KEY = process.env.CHOOSE_PDF_API_KEY || process.env.NEXT_PUBLIC_CHOOSE_PDF_API_KEY || "";
const PDF_EDIT_URL = process.env.CHOOSE_PDF_PDF_EDIT_URL || process.env.NEXT_PUBLIC_CHOOSE_PDF_PDF_EDIT_URL || "https://api.pdf.co/v1/pdf/edit/add";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, inline, annotations, images } = body;

    // Validate required fields
    if (!url) {
      return NextResponse.json(
        { error: true, message: 'PDF URL is required' },
        { status: 400 }
      );
    }

    if (!API_KEY) {
      return NextResponse.json(
        { error: true, message: 'ChoosePDF API key is not configured' },
        { status: 500 }
      );
    }

    if (!PDF_EDIT_URL) {
      return NextResponse.json(
        { error: true, message: 'PDF edit service URL is not configured' },
        { status: 500 }
      );
    }

    // Prepare payload for PDF.co API
    const payload = {
      url: url,
      inline: inline !== undefined ? inline : false,
      annotations: annotations || [],
      images: images || [],
    };

    // Call external PDF.co API
    const response = await fetch(PDF_EDIT_URL, {
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
          { error: true, message: text || 'PDF edit failed' },
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
    if (data.error) {
      return NextResponse.json(
        { error: true, message: data.message || 'Failed to apply annotations to PDF' },
        { status: response.status || 500 }
      );
    }

    // Return success response
    return NextResponse.json({
      error: false,
      url: data.url,
      ...data,
    });
  } catch (error) {
    console.error('PDF edit error:', error);
    return NextResponse.json(
      { error: true, message: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

