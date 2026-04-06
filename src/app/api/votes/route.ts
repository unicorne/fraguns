import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";

export async function POST(request: Request) {
  const { question_id, voter_id, target_member_id, voted_index } =
    await request.json();

  if (!question_id || !voter_id || !target_member_id || voted_index === undefined) {
    return NextResponse.json(
      { error: "question_id, voter_id, target_member_id und voted_index sind erforderlich" },
      { status: 400 }
    );
  }

  const { data, error } = await supabaseAdmin
    .from("votes")
    .upsert(
      { question_id, voter_id, target_member_id, voted_index },
      { onConflict: "question_id,voter_id,target_member_id" }
    )
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const questionId = searchParams.get("question_id");
  const voterId = searchParams.get("voter_id");

  if (!questionId) {
    return NextResponse.json(
      { error: "question_id ist erforderlich" },
      { status: 400 }
    );
  }

  let query = supabaseAdmin
    .from("votes")
    .select("*")
    .eq("question_id", questionId);

  if (voterId) {
    query = query.eq("voter_id", voterId);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
