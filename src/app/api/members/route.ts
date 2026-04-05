import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";

export async function POST(request: Request) {
  const { name, group_id } = await request.json();

  if (!name?.trim() || !group_id) {
    return NextResponse.json(
      { error: "Name und Gruppe sind erforderlich" },
      { status: 400 }
    );
  }

  const { data, error } = await supabaseAdmin
    .from("members")
    .insert({ name: name.trim(), group_id })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      // Unique violation - name already exists in group
      const { data: existing } = await supabaseAdmin
        .from("members")
        .select()
        .eq("group_id", group_id)
        .eq("name", name.trim())
        .single();

      if (existing) {
        return NextResponse.json(existing);
      }
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
