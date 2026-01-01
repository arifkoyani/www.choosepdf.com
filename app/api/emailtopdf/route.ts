import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

const API_KEY = process.env.CHOOSE_PDF_API_KEY || process.env.NEXT_PUBLIC_CHOOSE_PDF_API_KEY || "";
const EMAIL_TO_PDF_URL = process.env.CHOOSE_PDF_EMAIL_TO_PDF_URL || process.env.NEXT_PUBLIC_CHOOSE_PDF_EMAIL_TO_PDF_URL || "https://api.pdf.co/v1/pdf/convert/from/email";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, name, embedAttachments, convertAttachments, paperSize } = body;

    if (!url) {
      return NextResponse.json(
        { error: true, message: 'File URL is required' },
        { status: 400 }
      );
    }

    // Prepare payload for Email to PDF conversion API
    const payload = {
      url: url,
      embedAttachments: embedAttachments !== undefined ? embedAttachments : true,
      convertAttachments: convertAttachments !== undefined ? convertAttachments : true,
      paperSize: paperSize || "Letter",
      name: name || "email-with-attachments",
      async: false,
    };

    // Call external Email to PDF conversion API
    const response = await fetch(EMAIL_TO_PDF_URL, {
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
          { error: true, message: text || 'Email to PDF conversion failed' },
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
      const errorMessage = data?.message || data?.error || 'Email to PDF conversion failed';
      return NextResponse.json(
        { error: true, message: errorMessage },
        { status: response.ok ? 400 : response.status }
      );
    }

    // Handle success response - can return either url or urls array
    if (data.error === false) {
      // Delete the original file from Supabase storage after successful conversion
      try {
        // Extract file path from Supabase URL
        // URL format: https://[project].supabase.co/storage/v1/object/public/server/uploads/file.eml
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
          url: urls[0] // Also include first URL for backward compatibility
        });
      }
    }

    // Fallback error case
    return NextResponse.json(
      { error: true, message: data?.message || 'Email to PDF conversion failed' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Email to PDF conversion error:', error);
    return NextResponse.json(
      { error: true, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

