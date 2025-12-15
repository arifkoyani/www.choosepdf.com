import { NextRequest, NextResponse } from 'next/server';

const API_KEY = process.env.CHOOSE_PDF_API_KEY || process.env.NEXT_PUBLIC_CHOOSE_PDF_API_KEY || "";
const EXTRACT_ATTACHMENTS_FROM_PDF_URL = process.env.CHOOSE_PDF_Extract_Attachments_From_Pdf_URL || process.env.NEXT_PUBLIC_CHOOSE_PDF_Extract_Attachments_From_Pdf_URL || "https://api.pdf.co/v1/pdf/attachments/extract";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, inline } = body;

    if (!url) {
      return NextResponse.json(
        { error: true, message: 'File URL is required' },
        { status: 400 }
      );
    }

    // Prepare payload for PDF attachment extraction API
    const payload = {
      url: url,
      inline: inline !== undefined ? inline : false,
      async: false,
    };

    // Call external PDF attachment extraction API
    const response = await fetch(EXTRACT_ATTACHMENTS_FROM_PDF_URL, {
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
          { error: true, message: text || 'PDF attachment extraction failed' },
          { status: response.status }
        );
      }
    } catch (parseError) {
      return NextResponse.json(
        { error: true, message: 'Failed to parse response from extraction service' },
        { status: 500 }
      );
    }

    // Handle error response
    if (!response.ok || data.error === true) {
      const errorMessage = data?.message || data?.error || 'PDF attachment extraction failed';
      return NextResponse.json(
        { error: true, message: errorMessage },
        { status: response.ok ? 400 : response.status }
      );
    }

    // Handle success response
    if (data.error === false && data.urls) {
      const urls = Array.isArray(data.urls) ? data.urls : [];
      const hasAttachments = urls.length > 0;
      
      return NextResponse.json({
        error: false,
        urls: urls,
        hasAttachments: hasAttachments,
        message: hasAttachments ? undefined : 'No attachments found in this PDF',
        pageCount: data.pageCount || 0,
        status: data.status || 200,
        name: data.name || '',
        credits: data.credits || 0,
        duration: data.duration || 0,
        remainingCredits: data.remainingCredits || 0,
      });
    }

    // Fallback error case
    return NextResponse.json(
      { error: true, message: data?.message || 'PDF attachment extraction failed' },
      { status: 400 }
    );
  } catch (error) {
    console.error('PDF attachment extraction error:', error);
    return NextResponse.json(
      { error: true, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

