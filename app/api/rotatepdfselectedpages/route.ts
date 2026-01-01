import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

const API_KEY = process.env.CHOOSE_PDF_API_KEY || process.env.NEXT_PUBLIC_CHOOSE_PDF_API_KEY || "";
const ROTATE_PDF_URL = process.env.CHOOSE_PDF_API_ROTATE_PDF_SELECTED_PAGES_URL || process.env.NEXT_PUBLIC_CHOOSE_PDF_API_ROTATE_PDF_SELECTED_PAGES_URL || "https://api.pdf.co/v1/pdf/edit/rotate";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, pages, angle } = body;

    if (!url) {
      return NextResponse.json(
        { error: true, message: 'File URL is required' },
        { status: 400 }
      );
    }

    if (!pages || pages.trim() === '') {
      return NextResponse.json(
        { error: true, message: 'Page numbers are required' },
        { status: 400 }
      );
    }

    if (angle === undefined || angle === null) {
      return NextResponse.json(
        { error: true, message: 'Rotation angle is required' },
        { status: 400 }
      );
    }

    // Prepare payload for rotate API
    const payload = {
      url: url,
      pages: pages.trim(),
      angle: angle.toString(),
      name: "result.pdf",
      async: false
    };

    // Call external PDF rotate API
    const response = await fetch(ROTATE_PDF_URL, {
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
          { error: true, message: text || 'PDF rotation failed' },
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
      const errorMessage = data?.message || data?.error || 'PDF rotation failed';
      return NextResponse.json(
        { error: true, message: errorMessage },
        { status: response.ok ? 400 : response.status }
      );
    }

    // Handle success response
    if (data.error === false && data.url) {
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

      return NextResponse.json({
        error: false,
        url: data.url
      });
    }

    // Fallback error case
    return NextResponse.json(
      { error: true, message: data?.message || 'PDF rotation failed' },
      { status: 400 }
    );
  } catch (error) {
    console.error('PDF rotation error:', error);
    return NextResponse.json(
      { error: true, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

