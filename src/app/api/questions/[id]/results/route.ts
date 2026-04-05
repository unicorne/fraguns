import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Get question with answers and group member count
  const { data: question, error } = await supabaseAdmin
    .from("questions")
    .select("*, answers(*, members:member_id(id, name))")
    .eq("id", id)
    .single();

  if (error || !question) {
    return NextResponse.json({ error: "Frage nicht gefunden" }, { status: 404 });
  }

  // Get total member count for the group
  const { count: memberCount } = await supabaseAdmin
    .from("members")
    .select("*", { count: "exact", head: true })
    .eq("group_id", question.group_id);

  const answerCount = question.answers?.length || 0;
  const allAnswered = answerCount >= (memberCount || 0);
  const deadlinePassed = question.deadline
    ? new Date() > new Date(question.deadline)
    : false;

  const canReveal = allAnswered || deadlinePassed;

  if (!canReveal) {
    // Return only who has answered, not what they answered
    const answered = question.answers?.map(
      (a: { members: { name: string } }) => a.members.name
    ) || [];
    return NextResponse.json({
      revealed: false,
      answered,
      total: memberCount,
      question: {
        id: question.id,
        text: question.text,
        type: question.type,
        config: question.config,
      },
    });
  }

  return NextResponse.json({
    revealed: true,
    question: {
      id: question.id,
      text: question.text,
      type: question.type,
      config: question.config,
    },
    answers: question.answers,
    total: memberCount,
  });
}
