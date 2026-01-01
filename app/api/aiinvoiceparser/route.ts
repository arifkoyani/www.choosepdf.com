import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

const API_KEY = process.env.CHOOSE_PDF_API_KEY || process.env.NEXT_PUBLIC_CHOOSE_PDF_API_KEY || "";
const AI_INVOICE_PARSER_URL = process.env.CHOOSE_PDF_API_AI_INVOICE_PARSER_URL || process.env.NEXT_PUBLIC_CHOOSE_PDF_API_AI_INVOICE_PARSER_URL || "https://api.pdf.co/v1/ai-invoice-parser";
const JOB_CHECK_URL = process.env.CHOOSE_PDF_API_JOB_CHECK_URL || process.env.NEXT_PUBLIC_CHOOSE_PDF_API_JOB_CHECK_URL || "https://api.pdf.co/v1/job/check";

// Process invoice - starts the AI invoice parsing job
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json(
        { error: true, message: 'File URL is required' },
        { status: 400 }
      );
    }

    // Call external AI invoice parser API
    const response = await fetch(AI_INVOICE_PARSER_URL, {
      method: 'POST',
      headers: {
        'x-api-key': API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: url,
        callback: "https://example.com/callback/url/you/provided"
      }),
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
          { error: true, message: text || 'AI invoice parser failed' },
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
      const errorMessage = data?.message || data?.error || 'AI invoice parser failed';
      return NextResponse.json(
        { error: true, message: errorMessage },
        { status: response.ok ? 400 : response.status }
      );
    }

    // Return job ID for client to poll
    if (data.error === false && data.jobId) {
      return NextResponse.json({
        error: false,
        jobId: data.jobId,
        originalUrl: url
      });
    }

    // Fallback error case
    return NextResponse.json(
      { error: true, message: data?.message || 'AI invoice parser failed' },
      { status: 400 }
    );
  } catch (error) {
    console.error('AI invoice parser error:', error);
    return NextResponse.json(
      { error: true, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Check job status - polls for job completion
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('jobId');
    const originalUrl = searchParams.get('originalUrl');

    if (!jobId) {
      return NextResponse.json(
        { error: true, message: 'Job ID is required' },
        { status: 400 }
      );
    }

    // Call external job check API
    const response = await fetch(`${JOB_CHECK_URL}?jobid=${jobId}`, {
      method: 'GET',
      headers: {
        'x-api-key': API_KEY,
      },
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
          { error: true, message: text || 'Job check failed' },
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
    if (!response.ok) {
      const errorMessage = data?.message || data?.error || 'Job check failed';
      return NextResponse.json(
        { error: true, message: errorMessage },
        { status: response.status }
      );
    }

    // Delete the original file from Supabase storage after successful job completion
    if (data.status === "success" && originalUrl) {
      try {
        // Extract file path from Supabase URL
        // URL format: https://[project].supabase.co/storage/v1/object/public/server/uploads/file.pdf
        const urlObj = new URL(originalUrl);
        const pathParts = urlObj.pathname.split('/');
        const serverIndex = pathParts.indexOf('server');
        if (serverIndex !== -1 && serverIndex < pathParts.length - 1) {
          const filePath = pathParts.slice(serverIndex + 1).join('/');
          const { error: deleteError } = await supabase.storage.from('server').remove([filePath]);
          if (deleteError) {
            console.error('Error deleting original file from Supabase:', deleteError);
          } else {
            console.log('Successfully deleted original file from Supabase:', filePath);
          }
        }
      } catch (deleteError) {
        // Log error but don't fail the request if deletion fails
        console.error('Error deleting original file from Supabase:', deleteError);
      }
    }

    // Return job status and data
    return NextResponse.json({
      error: false,
      status: data.status,
      url: data.url,
      body: data.body,
      message: data.message
    });
  } catch (error) {
    console.error('Job check error:', error);
    return NextResponse.json(
      { error: true, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

