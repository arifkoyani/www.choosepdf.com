import { NextRequest, NextResponse } from 'next/server';

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
    return NextResponse.json(data);
  } catch (error) {
    console.error('Merge error:', error);
    return NextResponse.json(
      { error: true, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

