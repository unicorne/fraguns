import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const memberId = searchParams.get("member_id");

  // Get question with answers and member count in parallel
  const [questionResult, commentsResult] = await Promise.all([
    supabaseAdmin
      .from("questions")
      .select("*, answers(*, members:member_id(id, name)), groups:group_id(members(count))")
      .eq("id", id)
      .single(),
    supabaseAdmin
      .from("comments")
      .select("*, members:member_id(id, name)")
      .eq("question_id", id)
      .order("created_at", { ascending: true }),
  ]);

  const { data: question, error } = questionResult;

  if (error || !question) {
    return NextResponse.json({ error: "Frage nicht gefunden" }, { status: 404 });
  }

  const memberCount = (question.groups as unknown as { members: { count: number }[] })?.members?.[0]?.count ?? 0;
  const comments = commentsResult.data || [];

  // Get rating for this member
  let myRating: number | null = null;
  if (memberId) {
    const { data: ratingData } = await supabaseAdmin
      .from("question_ratings")
      .select("rating")
      .eq("question_id", id)
      .eq("member_id", memberId)
      .single();
    myRating = ratingData?.rating ?? null;
  }

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
      comments,
      myRating,
    });
  }

  let answersData = question.answers;

  // For two_truths_one_lie: hide lie_index from other members' answers
  // until the requesting member has voted on them
  if (question.type === "two_truths_one_lie" && memberId) {
    const { data: myVotes } = await supabaseAdmin
      .from("votes")
      .select("target_member_id")
      .eq("question_id", id)
      .eq("voter_id", memberId);

    const votedTargets = new Set(
      (myVotes || []).map((v: { target_member_id: string }) => v.target_member_id)
    );

    answersData = question.answers.map(
      (a: { value: Record<string, unknown>; members: { id: string } }) => {
        if (a.members.id === memberId || votedTargets.has(a.members.id)) {
          return a; // Show lie_index for own answer and voted members
        }
        // Strip lie_index for members not yet voted on
        const { lie_index: _, ...safeValue } = a.value;
        void _;
        return { ...a, value: safeValue };
      }
    );
  }

  // Anonymize answers if question is anonymous
  if (question.config?.is_anonymous) {
    answersData = answersData.map(
      (a: { value: Record<string, unknown>; members: { id: string; name: string } }, i: number) => ({
        ...a,
        members: { id: `anon-${i}`, name: `Anonym ${i + 1}` },
      })
    );
  }

  return NextResponse.json({
    revealed: true,
    question: {
      id: question.id,
      text: question.text,
      type: question.type,
      config: question.config,
    },
    answers: answersData,
    total: memberCount,
    comments,
    myRating,
  });
}
