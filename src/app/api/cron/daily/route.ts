import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";

interface UnscheduledQuestion {
  id: string;
  text: string;
  created_by: string | null;
  created_at: string;
}

/**
 * Pick the next question using this priority:
 * 1. User-submitted questions (created_by != null), interleaved fairly between creators
 * 2. Random pool question (created_by == null) that hasn't been asked yet
 */
function pickNextQuestion(
  unscheduled: UnscheduledQuestion[],
  lastCreatorId: string | null
): UnscheduledQuestion | null {
  // Split into user-submitted and pool
  const userQuestions = unscheduled.filter((q) => q.created_by);
  const poolQuestions = unscheduled.filter((q) => !q.created_by);

  // Priority 1: User-submitted questions with fair round-robin
  if (userQuestions.length > 0) {
    // Group by creator
    const byCreator: Record<string, UnscheduledQuestion[]> = {};
    for (const q of userQuestions) {
      const key = q.created_by!;
      if (!byCreator[key]) byCreator[key] = [];
      byCreator[key].push(q);
    }

    const creatorIds = Object.keys(byCreator);

    // Pick next creator (different from last if possible)
    let nextCreator: string;
    if (!lastCreatorId || creatorIds.length === 1) {
      // No history or only one creator — pick whoever has oldest question
      nextCreator = creatorIds[0];
    } else {
      // Find the next creator after lastCreatorId (round-robin)
      const lastIdx = creatorIds.indexOf(lastCreatorId);
      nextCreator = creatorIds[(lastIdx + 1) % creatorIds.length];
    }

    // Pick the oldest question from that creator
    const questions = byCreator[nextCreator];
    questions.sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
    return questions[0];
  }

  // Priority 2: Random pool question
  if (poolQuestions.length > 0) {
    const idx = Math.floor(Math.random() * poolQuestions.length);
    return poolQuestions[idx];
  }

  return null;
}

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: groups } = await supabaseAdmin
    .from("groups")
    .select("id, name, invite_code");

  if (!groups) {
    return NextResponse.json({ message: "Keine Gruppen" });
  }

  const today = new Date().toISOString().split("T")[0];
  const log: string[] = [];

  const webpush = await import("web-push");
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT!.trim(),
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!.trim().replace(/=+$/, ""),
    process.env.VAPID_PRIVATE_KEY!.trim().replace(/=+$/, "")
  );

  for (const group of groups) {
    // Deactivate current active question
    await supabaseAdmin
      .from("questions")
      .update({ is_active: false })
      .eq("group_id", group.id)
      .eq("is_active", true);

    // Get all unscheduled questions for this group
    const { data: unscheduled } = await supabaseAdmin
      .from("questions")
      .select("id, text, created_by, created_at")
      .eq("group_id", group.id)
      .is("scheduled_date", null)
      .order("created_at", { ascending: true });

    if (!unscheduled || unscheduled.length === 0) {
      log.push(`group ${group.name}: no questions left`);
      continue;
    }

    // Find who submitted the last user-created question (for round-robin)
    const { data: lastUserQ } = await supabaseAdmin
      .from("questions")
      .select("created_by")
      .eq("group_id", group.id)
      .not("created_by", "is", null)
      .not("scheduled_date", "is", null)
      .order("scheduled_date", { ascending: false })
      .limit(1)
      .single();

    const lastCreatorId = lastUserQ?.created_by || null;

    const nextQuestion = pickNextQuestion(unscheduled, lastCreatorId);

    if (!nextQuestion) {
      log.push(`group ${group.name}: no suitable question found`);
      continue;
    }

    const deadline = new Date(`${today}T22:59:00Z`);

    await supabaseAdmin
      .from("questions")
      .update({
        is_active: true,
        scheduled_date: today,
        deadline: deadline.toISOString(),
      })
      .eq("id", nextQuestion.id);

    const source = nextQuestion.created_by ? "user" : "pool";
    log.push(
      `group ${group.name}: activated [${source}] "${nextQuestion.text.slice(0, 30)}..."`
    );

    // Send push notifications
    const { data: members } = await supabaseAdmin
      .from("members")
      .select("push_subscription")
      .eq("group_id", group.id)
      .not("push_subscription", "is", null);

    if (!members || members.length === 0) {
      log.push(`  push: no subscriptions`);
      continue;
    }

    log.push(`  push: ${members.length} subscription(s)`);

    const payload = JSON.stringify({
      title: `${group.name}`,
      body: nextQuestion.text,
      url: `/gruppe/${group.invite_code}`,
    });

    const results = await Promise.allSettled(
      members.map((m) =>
        webpush.sendNotification(m.push_subscription, payload)
      )
    );

    for (const r of results) {
      if (r.status === "fulfilled") {
        log.push(`  push: sent (${r.value.statusCode})`);
      } else {
        log.push(
          `  push: failed (${r.reason?.statusCode || r.reason?.message || "unknown"})`
        );
      }
    }
  }

  return NextResponse.json({
    success: true,
    date: today,
    groups: groups.length,
    log,
  });
}
