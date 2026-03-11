import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

const API_KEY =
  process.env.CHOOSE_PDF_API_KEY ||
  process.env.NEXT_PUBLIC_CHOOSE_PDF_API_KEY ||
  '';

// Separate env key so ScanToPdf can be configured independently if needed
const SCAN_TO_PDF_URL =
  process.env.CHOOSE_PDF_SCAN_TO_PDF_URL ||
  process.env.NEXT_PUBLIC_CHOOSE_PDF_SCAN_TO_PDF_URL ||
  process.env.CHOOSE_PDF_JPG_TO_PDF_URL ||
  process.env.NEXT_PUBLIC_CHOOSE_PDF_JPG_TO_PDF_URL ||
  'https://api.pdf.co/v1/pdf/convert/from/image';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, pages, password, urls } = body as {
      url?: string;
      urls?: string[];
      pages?: string;
      password?: string;
    };

    // Support multiple image URLs: if 'urls' array is provided, join into single comma-separated string
    const mergedUrl =
      Array.isArray(urls) && urls.length > 0
        ? urls.join(',')
        : url;

    if (!mergedUrl) {
      return NextResponse.json(
        { error: true, message: 'File URL is required' },
        { status: 400 },
      );
    }

    if (!API_KEY) {
      return NextResponse.json(
        { error: true, message: 'ChoosePDF API key not configured' },
        { status: 500 },
      );
    }

    if (!SCAN_TO_PDF_URL) {
      return NextResponse.json(
        {
          error: true,
          message: 'Scan-to-PDF conversion service URL is not configured',
        },
        { status: 500 },
      );
    }

    // Payload for ScanToPdf – accepts one or more JPG/PNG image URLs as comma-separated list
    const payload = {
      url: mergedUrl,
      pages: pages || '',
      password: password || '',
      async: false,
    };

    const response = await fetch(SCAN_TO_PDF_URL, {
      method: 'POST',
      headers: {
        'x-api-key': API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    let data: any;
    try {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        return NextResponse.json(
          { error: true, message: text || 'Scan to PDF conversion failed' },
          { status: response.status },
        );
      }
    } catch {
      return NextResponse.json(
        {
          error: true,
          message: 'Failed to parse response from conversion service',
        },
        { status: 500 },
      );
    }

    if (!response.ok || data.error === true) {
      const errorMessage =
        data?.message ||
        data?.error ||
        data?.body?.error ||
        'Scan to PDF conversion failed';

      console.error('ScanToPdf API error:', {
        status: response.status,
        error: data?.error,
        message: data?.message,
        body: data,
      });

      return NextResponse.json(
        { error: true, message: errorMessage },
        { status: response.ok ? 400 : response.status },
      );
    }

    if (data.error === false) {
      // Delete original uploaded image from Supabase after successful conversion
      try {
        // When multiple URLs are passed, best-effort delete for each
        const rawUrls: string[] =
          Array.isArray((body as any).urls) && (body as any).urls.length > 0
            ? (body as any).urls
            : typeof url === 'string'
              ? [url]
              : [];

        for (const originalUrl of rawUrls) {
          if (!originalUrl) continue;
          try {
            const urlObj = new URL(originalUrl);
            const pathParts = urlObj.pathname.split('/');
            const serverIndex = pathParts.indexOf('server');
            if (serverIndex !== -1 && serverIndex < pathParts.length - 1) {
              const filePath = pathParts.slice(serverIndex + 1).join('/');
              await supabase.storage.from('server').remove([filePath]);
            }
          } catch (innerErr) {
            console.error(
              'Error deleting original scan image from Supabase (one file):',
              innerErr,
            );
          }
        }
      } catch (deleteError) {
        console.error(
          'Error deleting original scan image from Supabase:',
          deleteError,
        );
      }

      const urls =
        Array.isArray(data.urls) && data.urls.length > 0
          ? data.urls
          : typeof data.url === 'string' && data.url.length > 0
            ? [data.url]
            : [];

      if (urls.length > 0) {
        return NextResponse.json({
          error: false,
          urls,
          status: data.status || 200,
          remainingCredits: data.remainingCredits || 0,
        });
      }
    }

    return NextResponse.json(
      {
        error: true,
        message: data?.message || 'Scan to PDF conversion failed',
      },
      { status: 400 },
    );
  } catch (error) {
    console.error('ScanToPdf conversion error:', error);
    return NextResponse.json(
      { error: true, message: 'Internal server error' },
      { status: 500 },
    );
  }
}

