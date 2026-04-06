import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";

export async function POST(request: Request) {
  const { question_id, member_id, rating } = await request.json();

  if (!question_id || !member_id || (rating !== 1 && rating !== -1)) {
    return NextResponse.json({ error: "Ungültige Daten" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("question_ratings")
    .upsert(
      { question_id, member_id, rating },
      { onConflict: "question_id,member_id" }
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
  const memberId = searchParams.get("member_id");

  if (!questionId) {
    return NextResponse.json({ error: "question_id fehlt" }, { status: 400 });
  }

  // Get user's rating
  let myRating: number | null = null;
  if (memberId) {
    const { data } = await supabaseAdmin
      .from("question_ratings")
      .select("rating")
      .eq("question_id", questionId)
      .eq("member_id", memberId)
      .single();
    myRating = data?.rating ?? null;
  }

  return NextResponse.json({ myRating });
}
