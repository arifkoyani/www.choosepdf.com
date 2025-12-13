import { NextRequest, NextResponse } from 'next/server';

const API_KEY = process.env.CHOOSE_PDF_API_KEY || process.env.NEXT_PUBLIC_CHOOSE_PDF_API_KEY || "";
const COMPRESS_PDF_URL = process.env.CHOOSE_PDF_API_COMPRESS_PDF_URL || process.env.NEXT_PUBLIC_CHOOSE_PDF_API_COMPRESS_PDF_URL || "https://api.pdf.co/v2/pdf/compress";

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

    // Compression configuration
    const payload = {
      url: url,
      async: false,
      config: {
        images: {
          color: {
            skip: false,
            downsample: {
              skip: false,
              downsample_ppi: 150,
              threshold_ppi: 225
            },
            compression: {
              skip: false,
              compression_format: "jpeg",
              compression_params: {
                quality: 60
              }
            }
          },
          grayscale: {
            skip: false,
            downsample: {
              skip: false,
              downsample_ppi: 150,
              threshold_ppi: 225
            },
            compression: {
              skip: false,
              compression_format: "jpeg",
              compression_params: {
                quality: 60
              }
            }
          },
          monochrome: {
            skip: false,
            downsample: {
              skip: false,
              downsample_ppi: 300,
              threshold_ppi: 450
            },
            compression: {
              skip: false,
              compression_format: "ccitt_g4",
              compression_params: {}
            }
          }
        },
        save: {
          garbage: 4
        }
      }
    };

    // Call external PDF compress API
    const response = await fetch(COMPRESS_PDF_URL, {
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
          { error: true, message: text || 'PDF compression failed' },
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
      const errorMessage = data?.message || data?.error || 'PDF compression failed';
      return NextResponse.json(
        { error: true, message: errorMessage },
        { status: response.ok ? 400 : response.status }
      );
    }

    // Handle success response
    if (data.error === false && data.url) {
      return NextResponse.json({
        error: false,
        url: data.url
      });
    }

    // Fallback error case
    return NextResponse.json(
      { error: true, message: data?.message || 'PDF compression failed' },
      { status: 400 }
    );
  } catch (error) {
    console.error('PDF compression error:', error);
    return NextResponse.json(
      { error: true, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

