import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

const API_KEY = process.env.CHOOSE_PDF_API_KEY || process.env.NEXT_PUBLIC_CHOOSE_PDF_API_KEY || "";
const ADD_PASSWORD_URL = process.env.CHOOSE_PDF_ADD_PASSWORD_TO_PDF_URL || process.env.NEXT_PUBLIC_CHOOSE_PDF_ADD_PASSWORD_TO_PDF_URL || "";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      url, 
      ownerPassword, 
      userPassword, 
      EncryptionAlgorithm,
      AllowPrintDocument,
      AllowFillForms,
      AllowModifyDocument,
      AllowContentExtraction,
      AllowModifyAnnotations,
      PrintQuality,
      name
    } = body;

    if (!url) {
      return NextResponse.json(
        { error: true, message: 'File URL is required' },
        { status: 400 }
      );
    }

    if (!ownerPassword || !userPassword) {
      return NextResponse.json(
        { error: true, message: 'Password is required' },
        { status: 400 }
      );
    }

    // Prepare payload for add password API
    const payload = {
      url: url,
      ownerPassword: ownerPassword,
      userPassword: userPassword,
      EncryptionAlgorithm: EncryptionAlgorithm || "AES_128bit",
      AllowPrintDocument: AllowPrintDocument !== undefined ? AllowPrintDocument : false,
      AllowFillForms: AllowFillForms !== undefined ? AllowFillForms : false,
      AllowModifyDocument: AllowModifyDocument !== undefined ? AllowModifyDocument : false,
      AllowContentExtraction: AllowContentExtraction !== undefined ? AllowContentExtraction : false,
      AllowModifyAnnotations: AllowModifyAnnotations !== undefined ? AllowModifyAnnotations : false,
      PrintQuality: PrintQuality || "LowResolution",
      name: name || `protected-${Date.now()}.pdf`,
      async: false
    };

    // Call external PDF add password API
    const response = await fetch(ADD_PASSWORD_URL, {
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
          { error: true, message: text || 'PDF add password failed' },
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
      const errorMessage = data?.message || data?.error || 'PDF add password failed';
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
      { error: true, message: data?.message || 'PDF add password failed' },
      { status: 400 }
    );
  } catch (error) {
    console.error('PDF add password error:', error);
    return NextResponse.json(
      { error: true, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

