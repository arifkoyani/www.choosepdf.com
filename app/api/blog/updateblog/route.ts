import { supabase } from "@/lib/supabaseClient";
import { NextResponse } from "next/server";

export async function PUT(req: Request) {
  const { id, title, slug, description, content, thumbnail, graphic } = await req.json();

  const { error } = await supabase
    .from("articles")
    .update({ title, slug, description, content, thumbnail, graphic })
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
