import { supabase } from "@/lib/supabaseClient";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, slug, description, content, thumbnailUrl, graphicUrl } = body;

    const { data, error } = await supabase
      .from("articles")
      .insert({
        title,
        slug,
        description,
        content,
        thumbnail: thumbnailUrl,
        graphic: graphicUrl
      });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data });
  } catch (err) {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
