import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";

// GET: Fetch all groups for a user with pending question status
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("user_id");

  if (!userId) {
    return NextResponse.json({ error: "user_id fehlt" }, { status: 400 });
  }

  // Get all memberships for this user
  const { data: memberships } = await supabaseAdmin
    .from("members")
    .select("id, name, group_id, groups:group_id(id, name, invite_code)")
    .eq("user_id", userId);

  if (!memberships || memberships.length === 0) {
    return NextResponse.json([]);
  }

  // For each group, check if there's an active question the user hasn't answered
  const result = await Promise.all(
    memberships.map(async (m) => {
      const group = m.groups as unknown as {
        id: string;
        name: string;
        invite_code: string;
      };

      // Get active question for this group
      const { data: activeQ } = await supabaseAdmin
        .from("questions")
        .select("id")
        .eq("group_id", group.id)
        .eq("is_active", true)
        .single();

      let hasUnanswered = false;

      if (activeQ) {
        // Check if this member has answered
        const { data: answer } = await supabaseAdmin
          .from("answers")
          .select("id")
          .eq("question_id", activeQ.id)
          .eq("member_id", m.id)
          .single();

        hasUnanswered = !answer;
      }

      return {
        groupId: group.id,
        groupName: group.name,
        inviteCode: group.invite_code,
        memberId: m.id,
        memberName: m.name,
        hasUnanswered,
      };
    })
  );

  return NextResponse.json(result);
}
