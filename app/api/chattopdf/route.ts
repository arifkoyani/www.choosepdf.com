import { NextRequest, NextResponse } from 'next/server';

const CHAT_TO_PDF_URL = process.env.CHOOSE_PDF_CHAT_TO_PDF_URL || process.env.NEXT_PUBLIC_CHOOSE_PDF_CHAT_TO_PDF_URL || "";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, data_send } = body;

    // Validate required fields
    if (!user_id) {
      return NextResponse.json(
        { error: true, message: 'user_id is required' },
        { status: 400 }
      );
    }

    if (!data_send) {
      return NextResponse.json(
        { error: true, message: 'data_send is required' },
        { status: 400 }
      );
    }

    // Check if URL is configured
    if (!CHAT_TO_PDF_URL) {
      return NextResponse.json(
        { error: true, message: 'Chat to PDF service URL is not configured' },
        { status: 500 }
      );
    }

    // Prepare payload for external webhook
    const payload = {
      user_id: user_id,
      data_send: data_send,
    };

    // Call external webhook
    const response = await fetch(CHAT_TO_PDF_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: true, message: `Webhook request failed: ${response.status} ${response.statusText}` },
        { status: response.status }
      );
    }

    // Get response text first to check if it's valid JSON
    const responseText = await response.text();
    let responseData;
    
    try {
      // Trim whitespace and parse JSON
      const trimmedText = responseText.trim();
      responseData = JSON.parse(trimmedText);
    } catch (parseError) {
      console.error('Invalid JSON response:', responseText);
      console.error('Response status:', response.status);
      console.error('Response headers:', Object.fromEntries(response.headers.entries()));
      return NextResponse.json(
        { error: true, message: `Invalid JSON response from server. Status: ${response.status}` },
        { status: 500 }
      );
    }

    // Handle array format: [{ "output": { "answer": "...", "suggested_question": "..." } }]
    if (Array.isArray(responseData) && responseData.length > 0 && responseData[0].output) {
      const output = responseData[0].output;
      if (output.answer) {
        return NextResponse.json({
          error: false,
          answer: output.answer,
          suggested_question: output.suggested_question || undefined,
        });
      }
    }
    
    // Handle direct format: { "success": true, "answer": "...", "suggested_question": "...", "upload": true }
    if (responseData.success) {
      return NextResponse.json({
        error: false,
        success: responseData.success,
        answer: responseData.answer,
        suggested_question: responseData.suggested_question || undefined,
        upload: responseData.upload || false,
      });
    }

    // If response doesn't match expected format, return as is
    return NextResponse.json({
      error: false,
      ...responseData,
    });
  } catch (error) {
    console.error('Chat to PDF API error:', error);
    return NextResponse.json(
      { error: true, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

