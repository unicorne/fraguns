import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";

export async function POST(request: Request) {
  const { name, group_id, user_id } = await request.json();

  if (!name?.trim() || !group_id) {
    return NextResponse.json(
      { error: "Name und Gruppe sind erforderlich" },
      { status: 400 }
    );
  }

  const insertData: Record<string, unknown> = {
    name: name.trim(),
    group_id,
  };
  if (user_id) {
    insertData.user_id = user_id;
  }

  const { data, error } = await supabaseAdmin
    .from("members")
    .insert(insertData)
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      // Name already exists in group — return existing + update user_id if needed
      const { data: existing } = await supabaseAdmin
        .from("members")
        .select()
        .eq("group_id", group_id)
        .eq("name", name.trim())
        .single();

      if (existing) {
        if (user_id && !existing.user_id) {
          await supabaseAdmin
            .from("members")
            .update({ user_id })
            .eq("id", existing.id);
        }
        return NextResponse.json(existing);
      }
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
