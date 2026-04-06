import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";

// POST: Register new user
export async function POST(request: Request) {
  const { username } = await request.json();

  if (!username?.trim()) {
    return NextResponse.json({ error: "Benutzername fehlt" }, { status: 400 });
  }

  const clean = username.trim().toLowerCase();

  if (clean.length < 2 || clean.length > 20) {
    return NextResponse.json(
      { error: "Benutzername muss 2-20 Zeichen lang sein" },
      { status: 400 }
    );
  }

  // Try to create
  const { data, error } = await supabaseAdmin
    .from("users")
    .insert({ username: clean })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json(
        { error: "Benutzername ist bereits vergeben" },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// GET: Login / lookup by username
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get("username")?.trim().toLowerCase();

  if (!username) {
    return NextResponse.json({ error: "Benutzername fehlt" }, { status: 400 });
  }

  const { data: user } = await supabaseAdmin
    .from("users")
    .select("*")
    .eq("username", username)
    .single();

  if (!user) {
    return NextResponse.json(
      { error: "Benutzer nicht gefunden" },
      { status: 404 }
    );
  }

  // Also fetch all groups this user is in
  const { data: memberships } = await supabaseAdmin
    .from("members")
    .select("*, groups:group_id(id, name, invite_code)")
    .eq("user_id", user.id);

  return NextResponse.json({ user, memberships: memberships || [] });
}
