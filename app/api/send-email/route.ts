import { NextRequest, NextResponse } from 'next/server';

const API_KEY = process.env.CHOOSE_PDF_API_KEY || process.env.NEXT_PUBLIC_CHOOSE_PDF_API_KEY || "";
const SMTP_USERNAME = process.env.CHOOSE_PDF_SMTP_USERNAME || process.env.NEXT_PUBLIC_CHOOSE_PDF_SMTP_USERNAME || "";
const SMTP_PASSWORD = process.env.CHOOSE_PDF_SMTP_PASSWORD || process.env.NEXT_PUBLIC_CHOOSE_PDF_SMTP_PASSWORD || "";
const EMAIL_SEND_URL = process.env.CHOOSE_PDF_API_EMAIL_SEND_URL || process.env.NEXT_PUBLIC_CHOOSE_PDF_API_EMAIL_SEND_URL || "";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { toEmail, fileUrl } = body;

    // Validate required fields
    if (!toEmail || !fileUrl) {
      return NextResponse.json(
        { error: true, message: 'Recipient email and file URL are required' },
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

    // Build email payload
    const payload = {
      url: fileUrl,
      from: `CHOOSEPDF <${SMTP_USERNAME}>`,
      to: toEmail,
      subject: "Download Your Converted File from ChoosePDF",
      bodytext: `Hello,
    
    Your PDF has been securely protected with a password using ChoosePDF.com.
    You can download your protected PDF from the following link: ${fileUrl}
    
    Keep your password safe to access the file.
    
    Thank you,
    The WhatPDF Team`,
      bodyHtml: `
        <p className="bg-black">Hello,</p>
        <p>Your PDF has been securely converted and processed using <strong><a href="www.whatpdf.com" target="_blank">Download PDF</a></strong>.</p>
        <p>You can download your  PDF from the link below:</p>
        <p>Download PDF</a></p>
        <p>Keep your pdf safe to access the file.</p>
        <p>Thank you,<br />The choosepdf Team</p>
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

    // Check if response is OK
    if (!response.ok) {
      return NextResponse.json(
        { error: true, message: 'Email send failed' },
        { status: response.status }
      );
    }

    // Check if response is JSON
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
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
    return NextResponse.json(
      { error: true, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

