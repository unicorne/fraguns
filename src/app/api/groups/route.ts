import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import { defaultQuestions } from "@/lib/default-questions";

function generateInviteCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export async function POST(request: Request) {
  const { name } = await request.json();

  if (!name?.trim()) {
    return NextResponse.json({ error: "Gruppenname fehlt" }, { status: 400 });
  }

  const invite_code = generateInviteCode();

  const { data, error } = await supabaseAdmin
    .from("groups")
    .insert({ name: name.trim(), invite_code })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Seed default questions — first one is immediately active
  const today = new Date().toISOString().split("T")[0];
  const deadline = new Date(`${today}T22:59:00Z`).toISOString();

  const questionsToInsert = defaultQuestions.map((q, i) => ({
    group_id: data.id,
    text: q.text,
    type: q.type,
    config: q.config,
    ...(i === 0
      ? { is_active: true, scheduled_date: today, deadline }
      : {}),
  }));

  await supabaseAdmin.from("questions").insert(questionsToInsert);

  return NextResponse.json(data);
}
