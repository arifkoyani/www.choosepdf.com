import { NextRequest, NextResponse } from 'next/server';

const API_KEY = process.env.CHOOSE_PDF_API_KEY || process.env.NEXT_PUBLIC_CHOOSE_PDF_API_KEY || "";
const SEARCH_TEXT_DELETE_URL = process.env.CHOOSE_PDF_SEARCH_TEXT_DELETE_IN_PDF_URL || process.env.NEXT_PUBLIC_CHOOSE_PDF_SEARCH_TEXT_DELETE_IN_PDF_URL || "";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, searchString, caseSensitive, name, replacementLimit } = body;

    if (!url) {
      return NextResponse.json(
        { error: true, message: 'File URL is required' },
        { status: 400 }
      );
    }

    if (!searchString || !searchString.trim()) {
      return NextResponse.json(
        { error: true, message: 'Search string is required' },
        { status: 400 }
      );
    }

    // Prepare payload for delete text API
    const payload = {
      url: url,
      name: name || `text-deleted-${Date.now()}.pdf`,
      caseSensitive: caseSensitive !== undefined ? caseSensitive : false,
      searchString: searchString.trim(),
      replacementLimit: replacementLimit !== undefined ? replacementLimit : 0, // 0 means delete all occurrences
      async: false
    };

    // Call external PDF delete text API
    const response = await fetch(SEARCH_TEXT_DELETE_URL, {
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
          { error: true, message: text || 'PDF delete text failed' },
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
      const errorMessage = data?.message || data?.error || 'PDF delete text failed';
      return NextResponse.json(
        { error: true, message: errorMessage },
        { status: response.ok ? 400 : response.status }
      );
    }

    // Handle success response - check for various URL formats
    if (data.error === false) {
      let urls: string[] = [];

      if (Array.isArray(data.urls)) {
        urls = data.urls;
      } else if (typeof data.url === 'string' && data.url.length > 0) {
        urls = [data.url];
      } else if (typeof data.resultUrl === 'string' && data.resultUrl.length > 0) {
        urls = [data.resultUrl];
      } else if (typeof data.downloadUrl === 'string' && data.downloadUrl.length > 0) {
        urls = [data.downloadUrl];
      }

      if (urls.length > 0) {
        return NextResponse.json({
          error: false,
          urls: urls
        });
      } else {
        return NextResponse.json(
          { error: true, message: 'Delete text failed. No PDF generated.' },
          { status: 400 }
        );
      }
    }

    // Fallback error case
    return NextResponse.json(
      { error: true, message: data?.message || 'PDF delete text failed' },
      { status: 400 }
    );
  } catch (error) {
    console.error('PDF delete text error:', error);
    return NextResponse.json(
      { error: true, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

