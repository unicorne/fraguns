import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const groupId = searchParams.get("group_id");

  if (!groupId) {
    return NextResponse.json({ error: "group_id fehlt" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("questions")
    .select("*, answers(count)")
    .eq("group_id", groupId)
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { group_id, type, text, config, created_by } = body;

  if (!group_id || !type || !text?.trim()) {
    return NextResponse.json(
      { error: "group_id, type und text sind erforderlich" },
      { status: 400 }
    );
  }

  const { data, error } = await supabaseAdmin
    .from("questions")
    .insert({
      group_id,
      type,
      text: text.trim(),
      config: config || {},
      created_by,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
