import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";

export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get all groups
  const { data: groups } = await supabaseAdmin.from("groups").select("id");

  if (!groups) {
    return NextResponse.json({ message: "Keine Gruppen" });
  }

  const today = new Date().toISOString().split("T")[0];

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
      .select("id")
      .eq("group_id", group.id)
      .is("scheduled_date", null)
      .order("created_at", { ascending: true })
      .limit(1)
      .single();

    if (nextQuestion) {
      // Set deadline to end of day CET (23:59)
      const deadline = new Date(`${today}T22:59:00Z`); // ~23:59 CET

      await supabaseAdmin
        .from("questions")
        .update({
          is_active: true,
          scheduled_date: today,
          deadline: deadline.toISOString(),
        })
        .eq("id", nextQuestion.id);

      // Send push notifications to group members
      const { data: members } = await supabaseAdmin
        .from("members")
        .select("push_subscription")
        .eq("group_id", group.id)
        .not("push_subscription", "is", null);

      if (members && members.length > 0) {
        try {
          const webpush = await import("web-push");
          webpush.setVapidDetails(
            process.env.VAPID_SUBJECT!,
            process.env.VAPID_PUBLIC_KEY!,
            process.env.VAPID_PRIVATE_KEY!
          );

          const payload = JSON.stringify({
            title: "FragUns",
            body: "Neue Frage! Schau vorbei und antworte.",
          });

          await Promise.allSettled(
            members.map((m) =>
              webpush.sendNotification(m.push_subscription, payload)
            )
          );
        } catch (e) {
          console.error("Push error:", e);
        }
      }
    }
  }

  return NextResponse.json({ success: true, date: today });
}
