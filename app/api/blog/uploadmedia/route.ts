import { supabase } from "@/lib/supabaseClient";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Convert File to ArrayBuffer for Supabase
    const arrayBuffer = await file.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer);

    // Generate unique filename to avoid conflicts
    const timestamp = Date.now();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filePath = `uploads/${timestamp}-${sanitizedName}`;

    // Upload to your "server" bucket
    const { data, error } = await supabase
      .storage
      .from("server")
      .upload(filePath, fileBuffer, {
        contentType: file.type,
        upsert: false, // Set to true if you want to overwrite existing files
      });

    if (error) {
      console.error("Supabase upload error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Get public URL
    const { data: publicUrlData } = supabase
      .storage
      .from("server")
      .getPublicUrl(data.path);
    const publicUrl = publicUrlData.publicUrl;

    return NextResponse.json({ 
      path: data.path, 
      url: publicUrl,
      message: "File uploaded successfully"
    });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json({ 
      error: err instanceof Error ? err.message : "Something went wrong" 
    }, { status: 500 });
  }
}
