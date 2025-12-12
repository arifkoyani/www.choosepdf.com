import { NextRequest, NextResponse } from 'next/server';

const API_KEY = process.env.CHOOSE_PDF_API_KEY || process.env.NEXT_PUBLIC_CHOOSE_PDF_API_KEY || "";
const SPLIT_BY_TEXT_URL = process.env.CHOOSE_PDF_API_SPLIT_BY_TEXT_URL || "";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, searchString, excludeKeyPages, regexSearch, caseSensitive } = body;

    if (!url || !searchString) {
      return NextResponse.json(
        { error: true, message: 'File URL and search string are required' },
        { status: 400 }
      );
    }

    // Call external PDF split by text/barcode API
    const response = await fetch(SPLIT_BY_TEXT_URL, {
      method: 'POST',
      headers: {
        'x-api-key': API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: url,
        searchString: searchString.trim(),
        excludeKeyPages: excludeKeyPages ?? true,
        regexSearch: regexSearch ?? false,
        caseSensitive: caseSensitive ?? false,
        inline: true,
        name: `output-split-by-search-${Date.now()}`,
        async: false,
      }),
    });

    // Check if response is JSON
    const contentType = response.headers.get("content-type");
    if (!contentType?.includes("application/json")) {
      const text = await response.text();
      console.error("Non-JSON response received:", text.substring(0, 200));
      return NextResponse.json(
        { error: true, message: 'Server returned non-JSON response' },
        { status: 500 }
      );
    }

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: true, message: data.message || 'PDF split failed' },
        { status: response.status }
      );
    }

    if (data.error === false && data.urls && data.urls.length > 0) {
      return NextResponse.json({
        error: false,
        urls: data.urls
      });
    } else if (data.error === false && (!data.urls || data.urls.length === 0)) {
      // Search string was not found in PDF - return specific error
      return NextResponse.json(
        { 
          error: true, 
          message: 'searchString is not available in given pdf',
          notFound: true 
        },
        { status: 200 } // Return 200 so client can handle it gracefully
      );
    } else {
      return NextResponse.json(
        { error: true, message: data.message || 'PDF split failed' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('PDF split by text error:', error);
    return NextResponse.json(
      { error: true, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

