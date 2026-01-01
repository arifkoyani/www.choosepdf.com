import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

const API_KEY = process.env.CHOOSE_PDF_API_KEY || process.env.NEXT_PUBLIC_CHOOSE_PDF_API_KEY || "";
const EXTRACT_DATA_FROM_EMAIL_URL = process.env.CHOOSE_PDF_EXTRACT_DATA_FROM_EMAIL_URL || process.env.NEXT_PUBLIC_CHOOSE_PDF_EXTRACT_DATA_FROM_EMAIL_URL || "";

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

    // Prepare payload for email data extraction API
    const payload = {
      url: url,
      inline: inline !== undefined ? inline : true,
      async: false,
    };

    // Call external email data extraction API
    const response = await fetch(EXTRACT_DATA_FROM_EMAIL_URL, {
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
          { error: true, message: text || 'Email data extraction failed' },
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
      const errorMessage = data?.message || data?.error || 'Email data extraction failed';
      return NextResponse.json(
        { error: true, message: errorMessage },
        { status: response.ok ? 400 : response.status }
      );
    }

    // Handle success response
    if (data.error === false && data.body) {
      // Delete the original file from Supabase storage after successful extraction
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

      return NextResponse.json({
        error: false,
        body: data.body,
        status: data.status || 200,
        name: data.name || '',
        remainingCredits: data.remainingCredits || 0,
      });
    }

    // Fallback error case
    return NextResponse.json(
      { error: true, message: data?.message || 'Email data extraction failed' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Email data extraction error:', error);
    return NextResponse.json(
      { error: true, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

