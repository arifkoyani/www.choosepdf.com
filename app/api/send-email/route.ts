import { NextRequest, NextResponse } from 'next/server';

const API_KEY = process.env.CHOOSE_PDF_API_KEY || process.env.NEXT_PUBLIC_CHOOSE_PDF_API_KEY || "";
const SMTP_USERNAME = process.env.CHOOSE_PDF_SMTP_USERNAME || process.env.NEXT_PUBLIC_CHOOSE_PDF_SMTP_USERNAME || "";
const SMTP_PASSWORD = process.env.CHOOSE_PDF_SMTP_PASSWORD || process.env.NEXT_PUBLIC_CHOOSE_PDF_SMTP_PASSWORD || "";
const EMAIL_SEND_URL = process.env.CHOOSE_PDF_API_EMAIL_SEND_URL || process.env.NEXT_PUBLIC_CHOOSE_PDF_API_EMAIL_SEND_URL || "";

export async function POST(request: NextRequest) {
  try {
    // Validate required environment variables
    if (!EMAIL_SEND_URL) {
      console.error('EMAIL_SEND_URL is not configured');
      return NextResponse.json(
        { error: true, message: 'Email service is not configured. Please contact support.' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { toEmail, fileUrl, fileUrls } = body;

    // Support both single fileUrl (backward compatibility) and array of fileUrls
    const urls: string[] = fileUrls && Array.isArray(fileUrls) && fileUrls.length > 0
      ? fileUrls
      : fileUrl
        ? [fileUrl]
        : [];

    // Validate required fields
    if (!toEmail || urls.length === 0) {
      return NextResponse.json(
        { error: true, message: 'Recipient email and file URL(s) are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(toEmail)) {
      return NextResponse.json(
        { error: true, message: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Build email body with all URLs
    const urlList = urls.map((url, index) => `${index + 1}. ${url}`).join('\n    ');
    const urlListHtml = urls.map((url, index) => 
      `<p><strong>File ${index + 1}:</strong> <a href="${url}" target="_blank">${url}</a></p>`
    ).join('\n        ');

    // Build email payload
    const payload = {
      url: urls[0], // Keep first URL for backward compatibility with external API
      from: `CHOOSEPDF <${SMTP_USERNAME}>`,
      to: toEmail,
      subject: urls.length > 1 
        ? `Download Your ${urls.length} Files from ChoosePDF`
        : "Download Your File from ChoosePDF",
      bodytext: `Hello,
    
    Your file(s) have been processed using ChoosePDF.com.
    ${urls.length > 1 ? `You can download your ${urls.length} file(s) from the following links:` : 'You can download your file from the following link:'}
    
    ${urlList}
    
    Thank you,
    The ChoosePDF Team`,
      bodyHtml: `
        <p>Hello,</p>
        <p>Your file(s) have been processed using <strong><a href="www.whatpdf.com" target="_blank">ChoosePDF</a></strong>.</p>
        <p>${urls.length > 1 ? `You can download your ${urls.length} file(s) from the links below:` : 'You can download your file from the link below:'}</p>
        ${urlListHtml}
        <p>Thank you,<br />The ChoosePDF Team</p>
      `,
      smtpserver: "smtp.gmail.com",
      smtpport: "587",
      smtpusername: SMTP_USERNAME,
      smtppassword: SMTP_PASSWORD,
      async: false,
    };

    // Call external email API
    const response = await fetch(EMAIL_SEND_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": API_KEY,
      },
      body: JSON.stringify(payload),
    });

    // Check content type before parsing
    const contentType = response.headers.get("content-type");
    const isJson = contentType && contentType.includes("application/json");

    // Try to extract error message from response
    let errorMessage = 'Email send failed';
    if (!response.ok) {
      try {
        if (isJson) {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } else {
          const text = await response.text();
          errorMessage = text || errorMessage;
          console.error("Non-JSON error response:", text.substring(0, 200));
        }
      } catch (parseError) {
        // If we can't parse the error, use status text
        errorMessage = response.statusText || errorMessage;
        console.error("Failed to parse error response:", parseError);
      }
      
      return NextResponse.json(
        { error: true, message: errorMessage },
        { status: response.status }
      );
    }

    // Check if response is JSON for success case
    if (!isJson) {
      const text = await response.text();
      console.error("Non-JSON response received:", text.substring(0, 200));
      return NextResponse.json(
        { error: true, message: 'Server returned non-JSON response' },
        { status: 500 }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Email send error:', error);
    
    // Provide more specific error messages
    let errorMessage = 'Internal server error';
    if (error instanceof Error) {
      if (error.message.includes('fetch')) {
        errorMessage = 'Failed to connect to email service. Please try again later.';
      } else {
        errorMessage = error.message;
      }
    }
    
    return NextResponse.json(
      { error: true, message: errorMessage },
      { status: 500 }
    );
  }
}

