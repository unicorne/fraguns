import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";

export async function POST(request: Request) {
  const { question_id, member_id, value } = await request.json();

  if (!question_id || !member_id || value === undefined) {
    return NextResponse.json(
      { error: "question_id, member_id und value sind erforderlich" },
      { status: 400 }
    );
  }

  const { data, error } = await supabaseAdmin
    .from("answers")
    .upsert(
      { question_id, member_id, value },
      { onConflict: "question_id,member_id" }
    )
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
