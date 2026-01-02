import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

const API_KEY = process.env.CHOOSE_PDF_API_KEY || process.env.NEXT_PUBLIC_CHOOSE_PDF_API_KEY || "";
const SEARCH_TEXT_REPLACE_URL = process.env.CHOOSE_PDF_SEARCH_TEXT_REPLACE_IN_PDF_URL || process.env.NEXT_PUBLIC_CHOOSE_PDF_SEARCH_TEXT_REPLACE_IN_PDF_URL || "";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, searchStrings, replaceStrings, caseSensitive, replacementLimit, pages, password, name } = body;

    if (!url) {
      return NextResponse.json(
        { error: true, message: 'File URL is required' },
        { status: 400 }
      );
    }

    if (!searchStrings || !Array.isArray(searchStrings) || searchStrings.length === 0) {
      return NextResponse.json(
        { error: true, message: 'At least one search string is required' },
        { status: 400 }
      );
    }

    // Validate that searchStrings and replaceStrings arrays have the same length
    if (replaceStrings && Array.isArray(replaceStrings) && searchStrings.length !== replaceStrings.length) {
      return NextResponse.json(
        { error: true, message: 'Search strings and replace strings arrays must have the same length' },
        { status: 400 }
      );
    }

    // Prepare payload for replace text API
    const payload = {
      url: url,
      searchStrings: searchStrings,
      replaceStrings: replaceStrings || searchStrings.map(() => ""), // Default to empty strings if not provided
      caseSensitive: caseSensitive !== undefined ? caseSensitive : false,
      replacementLimit: replacementLimit !== undefined ? replacementLimit : 0, // 0 means unlimited
      pages: pages || "",
      password: password || "",
      name: name || `text-replaced-${Date.now()}.pdf`,
      async: false
    };

    // Call external PDF replace text API
    const response = await fetch(SEARCH_TEXT_REPLACE_URL, {
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
          { error: true, message: text || 'PDF replace text failed' },
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
      const errorMessage = data?.message || data?.error || 'PDF replace text failed';
      return NextResponse.json(
        { error: true, message: errorMessage },
        { status: response.ok ? 400 : response.status }
      );
    }

    // Handle success response - check for various URL formats
    if (data.error === false) {
      // Delete the original file from Supabase storage after successful conversion
      try {
        // Extract file path from Supabase URL
        // URL format: https://[project].supabase.co/storage/v1/object/public/server/uploads/file.pdf
        const urlObj = new URL(url);
        const pathParts = urlObj.pathname.split('/');
        const serverIndex = pathParts.indexOf('server');
        if (serverIndex !== -1 && serverIndex < pathParts.length - 1) {
          const filePath = pathParts.slice(serverIndex + 1).join('/');
          await supabase.storage.from('server').remove([filePath]);
        }
      } catch (deleteError) {
        // Log error but don't fail the request if deletion fails
        console.error('Error deleting original file from Supabase:', deleteError);
      }

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
          { error: true, message: 'Replace text failed. No PDF generated.' },
          { status: 400 }
        );
      }
    }

    // Fallback error case
    return NextResponse.json(
      { error: true, message: data?.message || 'PDF replace text failed' },
      { status: 400 }
    );
  } catch (error) {
    console.error('PDF replace text error:', error);
    return NextResponse.json(
      { error: true, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

