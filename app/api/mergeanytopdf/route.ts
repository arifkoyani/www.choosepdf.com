import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

const API_KEY = process.env.CHOOSE_PDF_API_KEY || process.env.NEXT_PUBLIC_CHOOSE_PDF_API_KEY || "";
const MERGE_URL = process.env.CHOOSE_PDF_API_MERGE_URL || process.env.NEXT_PUBLIC_CHOOSE_PDF_API_MERGE_URL || "";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json(
        { error: true, message: 'No URLs provided' },
        { status: 400 }
      );
    }

    // Call external merge API
    const response = await fetch(MERGE_URL, {
      method: 'POST',
      headers: {
        'x-api-key': API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: url,
        async: false
      }),
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: true, message: 'Merge failed' },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Delete the original file(s) from Supabase storage after successful merge
    if (data.error === false || (response.ok && !data.error)) {
      try {
        // Handle array, comma-separated string, or single URL cases
        let urlsToDelete: string[] = [];
        if (Array.isArray(url)) {
          urlsToDelete = url;
        } else if (typeof url === 'string' && url.includes(',')) {
          // Handle comma-separated string from client
          urlsToDelete = url.split(',').map(u => u.trim()).filter(u => u.length > 0);
        } else if (typeof url === 'string') {
          urlsToDelete = [url];
        }
        
        for (const fileUrl of urlsToDelete) {
          try {
            // Extract file path from Supabase URL
            // URL format: https://[project].supabase.co/storage/v1/object/public/server/uploads/file.pdf
            const urlObj = new URL(fileUrl);
            const pathParts = urlObj.pathname.split('/');
            const serverIndex = pathParts.indexOf('server');
            if (serverIndex !== -1 && serverIndex < pathParts.length - 1) {
              const filePath = pathParts.slice(serverIndex + 1).join('/');
              const { error: deleteError } = await supabase.storage.from('server').remove([filePath]);
              if (deleteError) {
                console.error('Error deleting file from Supabase:', fileUrl, deleteError);
              } else {
                console.log('Successfully deleted file from Supabase:', filePath);
              }
            }
          } catch (deleteError) {
            // Log error but continue with other files
            console.error('Error deleting file from Supabase:', fileUrl, deleteError);
          }
        }
      } catch (deleteError) {
        // Log error but don't fail the request if deletion fails
        console.error('Error deleting original files from Supabase:', deleteError);
      }
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Merge error:', error);
    return NextResponse.json(
      { error: true, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

