import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";

export async function POST(request: Request) {
  const { member_id, subscription } = await request.json();

  if (!member_id || !subscription) {
    return NextResponse.json(
      { error: "member_id und subscription sind erforderlich" },
      { status: 400 }
    );
  }

  const { error } = await supabaseAdmin
    .from("members")
    .update({ push_subscription: subscription })
    .eq("id", member_id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
