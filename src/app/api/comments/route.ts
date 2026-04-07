import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const questionId = searchParams.get("question_id");

  if (!questionId) {
    return NextResponse.json(
      { error: "question_id ist erforderlich" },
      { status: 400 }
    );
  }

  const { data, error } = await supabaseAdmin
    .from("comments")
    .select("*, members:member_id(id, name)")
    .eq("question_id", questionId)
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const { question_id, member_id, text } = await request.json();

  if (!question_id || !member_id || !text?.trim()) {
    return NextResponse.json(
      { error: "question_id, member_id und text sind erforderlich" },
      { status: 400 }
    );
  }

  const { data, error } = await supabaseAdmin
    .from("comments")
    .insert({ question_id, member_id, text: text.trim() })
    .select("*, members:member_id(id, name)")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
