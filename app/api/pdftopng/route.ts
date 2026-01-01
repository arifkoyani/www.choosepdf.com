import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

const API_KEY = process.env.CHOOSE_PDF_API_KEY || process.env.NEXT_PUBLIC_CHOOSE_PDF_API_KEY || "";
const PDF_TO_PNG_URL = process.env.CHOOSE_PDF_PDF_TO_PNG_URL || process.env.NEXT_PUBLIC_CHOOSE_PDF_PDF_TO_PNG_URL || "";

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

    if (!PDF_TO_PNG_URL) {
      return NextResponse.json(
        { error: true, message: 'PDF to PNG conversion service URL is not configured' },
        { status: 500 }
      );
    }

    // Prepare payload for PDF to PNG conversion API
    const payload = {
      url: url,
      pages: pages || "",
      password: password || "",
    };

    // Call external PDF to PNG conversion API
    const response = await fetch(PDF_TO_PNG_URL, {
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
          { error: true, message: text || 'PDF to PNG conversion failed' },
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
      const errorMessage = data?.message || data?.error || data?.body?.error || 'PDF to PNG conversion failed';
      console.error('PDF to PNG API error:', {
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

    // Handle success response
    if (data.error === false && data.urls && Array.isArray(data.urls)) {
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
        urls: data.urls,
        status: data.status || 200,
        remainingCredits: data.remainingCredits || 0,
      });
    }

    // Fallback error case
    return NextResponse.json(
      { error: true, message: data?.message || 'PDF to PNG conversion failed' },
      { status: 400 }
    );
  } catch (error) {
    console.error('PDF to PNG conversion error:', error);
    return NextResponse.json(
      { error: true, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

