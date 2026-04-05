import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";

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

  return NextResponse.json(data);
}
