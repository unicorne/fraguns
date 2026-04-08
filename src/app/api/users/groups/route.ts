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

  const groupIds = memberships.map((m) => {
    const group = m.groups as unknown as { id: string };
    return group.id;
  });
  const memberIds = memberships.map((m) => m.id);

  // Batch: get all active questions for all groups at once
  const { data: activeQuestions } = await supabaseAdmin
    .from("questions")
    .select("id, group_id")
    .in("group_id", groupIds)
    .eq("is_active", true);

  // Batch: get all answers by this user's members for active questions
  const activeQIds = (activeQuestions || []).map((q) => q.id);
  let answeredQIds: string[] = [];

  if (activeQIds.length > 0) {
    const { data: answers } = await supabaseAdmin
      .from("answers")
      .select("question_id")
      .in("question_id", activeQIds)
      .in("member_id", memberIds);

    answeredQIds = (answers || []).map((a) => a.question_id);
  }

  // Build lookup maps
  const activeQByGroup = new Map<string, string>();
  for (const q of activeQuestions || []) {
    activeQByGroup.set(q.group_id, q.id);
  }
  const answeredSet = new Set(answeredQIds);

  const result = memberships.map((m) => {
    const group = m.groups as unknown as {
      id: string;
      name: string;
      invite_code: string;
    };
    const activeQId = activeQByGroup.get(group.id);
    const hasUnanswered = activeQId ? !answeredSet.has(activeQId) : false;

    return {
      groupId: group.id,
      groupName: group.name,
      inviteCode: group.invite_code,
      memberId: m.id,
      memberName: m.name,
      hasUnanswered,
    };
  });

  return NextResponse.json(result);
}
