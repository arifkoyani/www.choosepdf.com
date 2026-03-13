import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import { checkRateLimit } from "@/lib/limiter";
import { enqueueRequest, getResult } from "@/lib/queue";

const API_KEY =
  process.env.CHOOSE_PDF_API_KEY ||
  process.env.NEXT_PUBLIC_CHOOSE_PDF_API_KEY ||
  "";
const PDF_TO_QRCODE_URL =
  process.env.CHOOSE_PDF_PDF_TO_QRCODE_URL ||
  process.env.NEXT_PUBLIC_CHOOSE_PDF_PDF_TO_QRCODE_URL ||
  "https://api.pdf.co/v1/barcode/generate";

// ─── Supabase Upload Helper ───────────────────────────────────────────────────

async function uploadToSupabase(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const fileBuffer = Buffer.from(arrayBuffer);

  const timestamp = Date.now();
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
  const filePath = `uploads/${timestamp}-${sanitizedName}`;

  const { data, error } = await supabase.storage
    .from("server")
    .upload(filePath, fileBuffer, {
      contentType: file.type,
      upsert: false,
    });

  if (error) throw new Error(error.message);

  const { data: publicUrlData } = supabase.storage
    .from("server")
    .getPublicUrl(data.path);

  return publicUrlData.publicUrl;
}

// ─── Parse Request ─────────────────────────────────────────────────────────────

async function parseRequest(request: NextRequest): Promise<{
  name?: string;
  type?: string;
  value?: string;
  inline?: boolean;
  async?: boolean;
  profiles?: string;
  decorationImage?: string;
}> {
  const contentType = request.headers.get("content-type") || "";

  if (contentType.includes("multipart/form-data")) {
    const formData = await request.formData();

    const name = (formData.get("name") as string) || undefined;
    const type = (formData.get("type") as string) || undefined;
    const value = (formData.get("value") as string) || undefined;
    const profiles = (formData.get("profiles") as string) || undefined;

    const inlineRaw = formData.get("inline") as string;
    const asyncRaw = formData.get("async") as string;
    const inline =
      inlineRaw === "true" ? true : inlineRaw === "false" ? false : undefined;
    const asyncVal =
      asyncRaw === "true" ? true : asyncRaw === "false" ? false : undefined;

    const logoFile = formData.get("decorationImageFile");
    const decorationImageRaw = formData.get("decorationImage") as string;

    let decorationImage: string | undefined;
    if (logoFile && logoFile instanceof File && logoFile.size > 0) {
      decorationImage = await uploadToSupabase(logoFile);
    } else if (decorationImageRaw) {
      decorationImage = decorationImageRaw;
    }

    return { name, type, value, inline, async: asyncVal, profiles, decorationImage };
  } else {
    const body = await request.json();
    return {
      name: body?.name,
      type: body?.type,
      value: body?.value,
      inline: body?.inline,
      async: body?.async,
      profiles: body?.profiles,
      decorationImage: body?.decorationImage,
    };
  }
}

// ─── Direct API Call ───────────────────────────────────────────────────────────

async function callBarcodeAPI(
  payload: Record<string, any>
): Promise<NextResponse> {
  const res = await fetch(PDF_TO_QRCODE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": API_KEY,
    },
    body: JSON.stringify(payload),
  });

  let data: Record<string, any>;
  try {
    const ct = res.headers.get("content-type");
    if (ct && ct.includes("application/json")) {
      data = await res.json();
    } else {
      const text = await res.text();
      return NextResponse.json(
        { error: true, message: text || "Barcode generation failed" },
        { status: res.status }
      );
    }
  } catch {
    return NextResponse.json(
      {
        error: true,
        message: "Failed to parse response from barcode generation service",
      },
      { status: 500 }
    );
  }

  console.log("[Direct] API response:", data);

  if (!res.ok || data.error === true) {
    const errorMessage =
      data?.message || data?.error || data?.body?.error || "Barcode generation failed";
    console.error("[Direct] Barcode API error:", {
      status: res.status,
      error: data?.error,
      message: data?.message,
    });
    return NextResponse.json(
      { error: true, message: errorMessage },
      { status: res.ok ? 400 : res.status }
    );
  }

  if (data.error === false && data.url) {
    return NextResponse.json({
      error: false,
      url: data.url,
      name: data.name || payload.name || "qrcode.png",
      status: data.status || 200,
      remainingCredits: data.remainingCredits || 0,
      queued: false,
    });
  }

  return NextResponse.json(
    { error: true, message: data?.message || "Barcode generation failed" },
    { status: 400 }
  );
}

// ─── POST Handler ──────────────────────────────────────────────────────────────

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // 1. Parse request body
    const parsed = await parseRequest(request);
    const { name, type, value, inline, async: asyncVal, profiles, decorationImage } = parsed;

    // 2. Validate required fields
    if (!value) {
      return NextResponse.json(
        { error: true, message: "Value is required" },
        { status: 400 }
      );
    }
    if (!type) {
      return NextResponse.json(
        { error: true, message: "Barcode type is required" },
        { status: 400 }
      );
    }
    if (!API_KEY) {
      return NextResponse.json(
        { error: true, message: "ChoosePDF API key not configured" },
        { status: 500 }
      );
    }

    // 3. Build API payload
    const payload: Record<string, any> = {
      name: name || "barcode.png",
      type,
      value,
      inline: inline !== undefined ? inline : true,
      async: asyncVal !== undefined ? asyncVal : false,
      profiles:
        profiles ||
        JSON.stringify({
          Angle: 0,
          NarrowBarWidth: 30,
          ForeColor: "#000000",
          BackColor: "#ffffff",
        }),
    };
    if (decorationImage) payload.decorationImage = decorationImage;

    // 4. Check rate limit (sliding window, 5 req/sec globally via Redis)
    const allowed = await checkRateLimit();

    if (allowed) {
      // ✅ Under limit — call API immediately
      console.log("[Route] Rate limit OK — processing immediately");
      return callBarcodeAPI(payload);
    } else {
      // 🚦 Over limit — enqueue and return job ID
      console.log("[Route] Rate limit exceeded — queuing request");
      const jobId = await enqueueRequest(payload);

      return NextResponse.json(
        {
          error: false,
          queued: true,
          jobId,
          message:
            "Rate limit reached. Request queued. Poll /api/pdftoqrcode/result?jobId=<id> for result.",
          pollUrl: `/api/pdftoqrcode/result?jobId=${jobId}`,
        },
        { status: 202 } // 202 Accepted
      );
    }
  } catch (error: any) {
    console.error("[Route] Unhandled error:", error);
    return NextResponse.json(
      { error: true, message: "Internal server error" },
      { status: 500 }
    );
  }
}





// import { NextRequest, NextResponse } from 'next/server';
// import { supabase } from '@/lib/supabaseClient';

// const API_KEY = process.env.CHOOSE_PDF_API_KEY || process.env.NEXT_PUBLIC_CHOOSE_PDF_API_KEY || "";
// const PDF_TO_QRCODE_URL = process.env.CHOOSE_PDF_PDF_TO_QRCODE_URL || process.env.NEXT_PUBLIC_CHOOSE_PDF_PDF_TO_QRCODE_URL || "https://api.pdf.co/v1/barcode/generate";

// async function uploadToSupabase(file: File) {
//   const arrayBuffer = await file.arrayBuffer();
//   const fileBuffer = Buffer.from(arrayBuffer);

//   const timestamp = Date.now();
//   const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
//   const filePath = `uploads/${timestamp}-${sanitizedName}`;

//   const { data, error } = await supabase
//     .storage
//     .from('server')
//     .upload(filePath, fileBuffer, {
//       contentType: file.type,
//       upsert: false,
//     });

//   if (error) {
//     throw new Error(error.message);
//   }

//   const { data: publicUrlData } = supabase
//     .storage
//     .from('server')
//     .getPublicUrl(data.path);

//   return publicUrlData.publicUrl;
// }

// export async function POST(request: NextRequest) {
//   try {
//     const contentType = request.headers.get('content-type') || '';

//     let name: string | undefined;
//     let type: string | undefined;
//     let value: string | undefined;
//     let inline: boolean | undefined;
//     let async: boolean | undefined;
//     let profiles: string | undefined;
//     let decorationImage: string | undefined;

//     // Support both JSON and multipart/form-data
//     if (contentType.includes('multipart/form-data')) {
//       const formData = await request.formData();

//       name = (formData.get('name') as string) || undefined;
//       type = (formData.get('type') as string) || undefined;
//       value = (formData.get('value') as string) || undefined;
//       profiles = (formData.get('profiles') as string) || undefined;

//       const inlineRaw = formData.get('inline') as string;
//       const asyncRaw = formData.get('async') as string;
//       inline = inlineRaw === 'true' ? true : inlineRaw === 'false' ? false : undefined;
//       async = asyncRaw === 'true' ? true : asyncRaw === 'false' ? false : undefined;

//       const logoFile = formData.get('decorationImageFile');
//       const decorationImageRaw = formData.get('decorationImage') as string;

//       // If a file is provided, upload it to Supabase and use its public URL
//       if (logoFile && logoFile instanceof File && logoFile.size > 0) {
//         decorationImage = await uploadToSupabase(logoFile);
//       } else if (decorationImageRaw) {
//         decorationImage = decorationImageRaw;
//       }
//     } else {
//       const body = await request.json();
//       name = body?.name;
//       type = body?.type;
//       value = body?.value;
//       inline = body?.inline;
//       async = body?.async;
//       profiles = body?.profiles;
//       decorationImage = body?.decorationImage;
//     }

//     if (!value) {
//       return NextResponse.json(
//         { error: true, message: 'Value is required' },
//         { status: 400 }
//       );
//     }

//     if (!type) {
//       return NextResponse.json(
//         { error: true, message: 'Barcode type is required' },
//         { status: 400 }
//       );
//     }

//     if (!API_KEY) {
//       return NextResponse.json(
//         { error: true, message: 'ChoosePDF API error configured' },
//         { status: 500 }
//       );
//     }

//     // Prepare payload for barcode generation API
//     const payload: any = {
//       name: name || "barcode.png",
//       type: type,
//       value: value,
//       inline: inline !== undefined ? inline : true,
//       async: async !== undefined ? async : false,
//       profiles: profiles || JSON.stringify({
//         Angle: 0,
//         NarrowBarWidth: 30,
//         ForeColor: "#000000",
//         BackColor: "#ffffff",
//       }),
//     };

//     // Add decorationImage if provided
//     if (decorationImage) {
//       payload.decorationImage = decorationImage;
//     }

//     // Call external barcode generation API with rate limiting

//     const res = await fetch(PDF_TO_QRCODE_URL, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           "x-api-key": API_KEY,
//         },
//         body: JSON.stringify(payload),
//       })  ;

//     // Parse response
//     let data;
//     try {
//       const contentType = res.headers.get('content-type');
//       if (contentType && contentType.includes('application/json')) {
//         data = await res.json();
//       } else {
//         const text = await res.text();
//         return NextResponse.json(
//           { error: true, message: text || 'Barcode generation failed' },
//           { status: res.status }
//         );
//       }
//     } catch (parseError) {
//       return NextResponse.json(
//         { error: true, message: 'Failed to parse response from barcode generation service' },
//         { status: 500 }
//       );
//     }

//     console.log(data);

//     // Handle error response
//     if (!res.ok || data.error === true) {
//       const errorMessage = data?.message || data?.error || data?.body?.error || 'Barcode generation failed';
//       console.error('Barcode generation API error:', {
//         status: res.status,
//         error: data?.error,
//         message: data?.message,
//         body: data
//       });
//       return NextResponse.json(
//         { error: true, message: errorMessage },
//         { status: res.ok ? 400 : res.status }
//       );
//     }

//     // Handle success response
//     if (data.error === false && data.url) {
//       return NextResponse.json({
//         error: false,
//         url: data.url,
//         name: data.name || name || "qrcode.png",
//         status: data.status || 200,
//         remainingCredits: data.remainingCredits || 0,
//       });
//     }

//     // Fallback error case
//     return NextResponse.json(
//       { error: true, message: data?.message || 'Barcode generation failed' },
//       { status: 400 }
//     );
//   } catch (error) {
//     console.error('Barcode generation error:', error);
//     return NextResponse.json(
//       { error: true, message: 'Internal server error' },
//       { status: 500 }
//     );
//   }
// }

