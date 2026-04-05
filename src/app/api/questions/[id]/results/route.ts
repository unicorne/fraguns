import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const memberId = searchParams.get("member_id");

  // Get question with answers
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

  // Reveal results if this member has answered
  const memberHasAnswered = memberId
    ? question.answers?.some(
        (a: { members: { id: string } }) => a.members.id === memberId
      )
    : false;

  if (!memberHasAnswered) {
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
