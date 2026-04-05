import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ inviteCode: string }> }
) {
  const { inviteCode } = await params;

  const { data: group, error } = await supabaseAdmin
    .from("groups")
    .select("*, members(*)")
    .eq("invite_code", inviteCode)
    .single();

  if (error || !group) {
    return NextResponse.json(
      { error: "Gruppe nicht gefunden" },
      { status: 404 }
    );
  }

  return NextResponse.json(group);
}
