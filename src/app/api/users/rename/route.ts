import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";

export async function POST(request: Request) {
  const { user_id, new_username } = await request.json();

  if (!user_id || !new_username?.trim()) {
    return NextResponse.json(
      { error: "user_id und neuer Name sind erforderlich" },
      { status: 400 }
    );
  }

  const clean = new_username.trim().toLowerCase();

  if (clean.length < 2 || clean.length > 20) {
    return NextResponse.json(
      { error: "Name muss 2-20 Zeichen lang sein" },
      { status: 400 }
    );
  }

  // Check if username is taken by someone else
  const { data: existing } = await supabaseAdmin
    .from("users")
    .select("id")
    .eq("username", clean)
    .neq("id", user_id)
    .single();

  if (existing) {
    return NextResponse.json(
      { error: "Name ist bereits vergeben" },
      { status: 409 }
    );
  }

  // Update users table
  const { error: userError } = await supabaseAdmin
    .from("users")
    .update({ username: clean })
    .eq("id", user_id);

  if (userError) {
    return NextResponse.json({ error: userError.message }, { status: 500 });
  }

  // Update all member entries for this user
  const { error: memberError } = await supabaseAdmin
    .from("members")
    .update({ name: clean })
    .eq("user_id", user_id);

  if (memberError) {
    return NextResponse.json({ error: memberError.message }, { status: 500 });
  }

  return NextResponse.json({ username: clean });
}
