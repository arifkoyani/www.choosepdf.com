import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

const API_KEY = process.env.CHOOSE_PDF_API_KEY || process.env.NEXT_PUBLIC_CHOOSE_PDF_API_KEY || "";
const SEARCH_TEXT_REPLACE_IMAGE_URL = process.env.CHOOSE_PDF_SEARCH_TEXT_REPLACE_IMAGE_IN_PDF_URL || process.env.NEXT_PUBLIC_CHOOSE_PDF_SEARCH_TEXT_REPLACE_IMAGE_IN_PDF_URL || "";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, searchString, caseSensitive, replaceImage, pages } = body;

    if (!url) {
      return NextResponse.json(
        { error: true, message: 'PDF file URL is required' },
        { status: 400 }
      );
    }

    if (!replaceImage) {
      return NextResponse.json(
        { error: true, message: 'Image file URL is required' },
        { status: 400 }
      );
    }

    if (!searchString || !searchString.trim()) {
      return NextResponse.json(
        { error: true, message: 'Search string is required' },
        { status: 400 }
      );
    }

    // Prepare payload for replace text with image API
    const payload = {
      url: url,
      searchString: searchString.trim(),
      caseSensitive: caseSensitive !== undefined ? caseSensitive : false,
      replaceImage: replaceImage,
      pages: pages || "0", // 0 means all pages
      profiles: "{'AutoCropImages': true}", // Crop empty space around images
      async: false
    };

    // Call external PDF replace text with image API
    const response = await fetch(SEARCH_TEXT_REPLACE_IMAGE_URL, {
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
          { error: true, message: text || 'PDF replace text with image failed' },
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
      const errorMessage = data?.message || data?.error || 'PDF replace text with image failed';
      return NextResponse.json(
        { error: true, message: errorMessage },
        { status: response.ok ? 400 : response.status }
      );
    }

    // Handle success response - check for various URL formats
    if (data.error === false) {
      // Delete the original files from Supabase storage after successful conversion
      // Delete both PDF and image files
      const filesToDelete: string[] = [];
      
      // Extract PDF file path
      try {
        const pdfUrlObj = new URL(url);
        const pdfPathParts = pdfUrlObj.pathname.split('/');
        const pdfServerIndex = pdfPathParts.indexOf('server');
        if (pdfServerIndex !== -1 && pdfServerIndex < pdfPathParts.length - 1) {
          const pdfFilePath = pdfPathParts.slice(pdfServerIndex + 1).join('/');
          filesToDelete.push(pdfFilePath);
        }
      } catch (pdfError) {
        console.error('Error extracting PDF file path:', pdfError);
      }

      // Extract image file path
      try {
        const imageUrlObj = new URL(replaceImage);
        const imagePathParts = imageUrlObj.pathname.split('/');
        const imageServerIndex = imagePathParts.indexOf('server');
        if (imageServerIndex !== -1 && imageServerIndex < imagePathParts.length - 1) {
          const imageFilePath = imagePathParts.slice(imageServerIndex + 1).join('/');
          filesToDelete.push(imageFilePath);
        }
      } catch (imageError) {
        console.error('Error extracting image file path:', imageError);
      }

      // Delete all files from Supabase
      if (filesToDelete.length > 0) {
        try {
          await supabase.storage.from('server').remove(filesToDelete);
        } catch (deleteError) {
          // Log error but don't fail the request if deletion fails
          console.error('Error deleting files from Supabase:', deleteError);
        }
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
          { error: true, message: 'Replace text with image failed. No PDF generated.' },
          { status: 400 }
        );
      }
    }

    // Fallback error case
    return NextResponse.json(
      { error: true, message: data?.message || 'PDF replace text with image failed' },
      { status: 400 }
    );
  } catch (error) {
    console.error('PDF replace text with image error:', error);
    return NextResponse.json(
      { error: true, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

