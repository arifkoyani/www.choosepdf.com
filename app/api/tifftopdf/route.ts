import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

const API_KEY = process.env.CHOOSE_PDF_API_KEY || process.env.NEXT_PUBLIC_CHOOSE_PDF_API_KEY || "";
const TIFF_TO_PDF_URL = process.env.CHOOSE_PDF_TIFF_TO_PDF_URL || process.env.NEXT_PUBLIC_CHOOSE_PDF_TIFF_TO_PDF_URL || "https://api.pdf.co/v1/pdf/convert/from/image";

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

    if (!TIFF_TO_PDF_URL) {
      return NextResponse.json(
        { error: true, message: 'TIFF to PDF conversion service URL is not configured' },
        { status: 500 }
      );
    }

    // Prepare payload for TIFF to PDF conversion API
    const payload = {
      url: url,
      pages: pages || "",
      password: password || "",
    };

    // Call external TIFF to PDF conversion API
    const response = await fetch(TIFF_TO_PDF_URL, {
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
          { error: true, message: text || 'TIFF to PDF conversion failed' },
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
      const errorMessage = data?.message || data?.error || data?.body?.error || 'TIFF to PDF conversion failed';
      console.error('TIFF to PDF API error:', {
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
      // Delete the original file from Supabase storage after successful conversion
      try {
        // Extract file path from Supabase URL
        // URL format: https://[project].supabase.co/storage/v1/object/public/server/uploads/file.tiff
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
          urls: urls,
          status: data.status || 200,
          remainingCredits: data.remainingCredits || 0,
        });
      }
    }

    // Fallback error case
    return NextResponse.json(
      { error: true, message: data?.message || 'TIFF to PDF conversion failed' },
      { status: 400 }
    );
  } catch (error) {
    console.error('TIFF to PDF conversion error:', error);
    return NextResponse.json(
      { error: true, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
