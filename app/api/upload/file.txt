import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: true, message: 'No file provided' },
        { status: 400 }
      );
    }

    // Convert File to ArrayBuffer for Supabase
    const arrayBuffer = await file.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer);

    // Generate unique filename to avoid conflicts
    const timestamp = Date.now();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filePath = `uploads/${timestamp}-${sanitizedName}`;

    // Upload to Supabase storage
    const { data, error } = await supabase
      .storage
      .from('server')
      .upload(filePath, fileBuffer, {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      console.error('Supabase upload error:', error);
      return NextResponse.json(
        { error: true, message: error.message },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: publicUrlData } = supabase
      .storage
      .from('server')
      .getPublicUrl(data.path);
    const publicUrl = publicUrlData.publicUrl;

    return NextResponse.json({ 
      error: false,
      url: publicUrl,
      path: data.path 
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: true, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

