import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

const API_KEY = process.env.CHOOSE_PDF_API_KEY || process.env.NEXT_PUBLIC_CHOOSE_PDF_API_KEY || "";
const DELETE_PAGES_URL = process.env.CHOOSE_PDF_API_DELETE_PAGES_FROM_PDF_URL ||  process.env.NEXT_PUBLIC_CHOOSE_PDF_API_DELETE_PAGES_FROM_PDF_URL || "";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, pages } = body;

    if (!url) {
      return NextResponse.json(
        { error: true, message: 'File URL is required' },
        { status: 400 }
      );
    }

    // Call external PDF delete pages API
    const response = await fetch(DELETE_PAGES_URL, {
      method: 'POST',
      headers: {
        'x-api-key': API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: url,
        pages: pages ? pages.replace(/\s/g, "") : "",
        name: `delete-pages-result-${Date.now()}.pdf`,
        async: false,
      }),
    });

    // Parse response (works for both success and error)
    let data;
    try {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        return NextResponse.json(
          { error: true, message: text || 'Delete pages failed' },
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
      const errorMessage = data?.message || data?.error || 'Delete pages failed';
      return NextResponse.json(
        { error: true, message: errorMessage },
        { status: response.ok ? 400 : response.status }
      );
    }

    // Handle success response format - can return url or urls array
    if (data.error === false) {
      // Delete the original file from Supabase storage after successful deletion
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
          { error: true, message: data.message || 'No PDF file generated' },
          { status: 400 }
        );
      }
    }

    // Fallback error case
    return NextResponse.json(
      { error: true, message: data?.message || 'Delete pages failed' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Delete pages error:', error);
    return NextResponse.json(
      { error: true, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

