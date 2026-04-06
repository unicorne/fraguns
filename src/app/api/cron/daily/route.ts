import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";

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

  // Set up web-push once
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

    // Activate next unscheduled question
    const { data: nextQuestion } = await supabaseAdmin
      .from("questions")
      .select("id, text")
      .eq("group_id", group.id)
      .is("scheduled_date", null)
      .order("created_at", { ascending: true })
      .limit(1)
      .single();

    if (!nextQuestion) {
      log.push(`group ${group.name}: no questions in queue`);
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

    log.push(`group ${group.name}: activated "${nextQuestion.text.slice(0, 30)}..."`);

    // Send push notifications — one per member with group-specific link
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
