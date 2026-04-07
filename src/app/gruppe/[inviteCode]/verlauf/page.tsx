"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { getAllGroups } from "@/lib/storage";

interface Question {
  id: string;
  text: string;
  type: string;
  scheduled_date: string | null;
  is_active: boolean;
  created_at: string;
  answers: { count: number }[];
}

export default function Verlauf({
  params,
}: {
  params: Promise<{ inviteCode: string }>;
}) {
  const { inviteCode } = use(params);
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      // Try to get groupId from localStorage first (faster)
      const groups = getAllGroups();
      const stored = groups.find((g) => g.inviteCode === inviteCode);
      let groupId = stored?.groupId;

      if (!groupId) {
        const res = await fetch(`/api/groups/${inviteCode}`);
        if (!res.ok) return;
        const group = await res.json();
        groupId = group.id;
      }

      const qRes = await fetch(`/api/questions?group_id=${groupId}`);
      if (qRes.ok) {
        setQuestions(await qRes.json());
      }
      setLoading(false);
    }
    load();
  }, [inviteCode]);

  const past = questions
    .filter((q) => q.scheduled_date && !q.is_active)
    .sort((a, b) => {
      const dateDiff =
        new Date(b.scheduled_date!).getTime() -
        new Date(a.scheduled_date!).getTime();
      if (dateDiff !== 0) return dateDiff;
      return (
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    });

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center min-h-screen">
        <div className="text-muted">Laden...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 min-h-screen">
      <div className="bg-gradient-to-b from-accent to-accent-light px-6 pt-8 pb-12">
        <button
          onClick={() => router.push(`/gruppe/${inviteCode}`)}
          className="text-white bg-white/20 text-sm font-semibold px-3 py-1.5 rounded-xl hover:bg-white/30 mb-4"
        >
          &larr; Zurück
        </button>
        <h1 className="text-xl font-bold text-white">Verlauf</h1>
      </div>

      <main className="flex-1 px-4 -mt-4 pb-8">
        {past.length === 0 ? (
          <div className="bg-card rounded-2xl border border-card-border p-6 text-center shadow-sm">
            <p className="text-muted">Noch keine vergangenen Fragen</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {past.map((q) => (
              <button
                key={q.id}
                onClick={() =>
                  router.push(`/gruppe/${inviteCode}/frage/${q.id}`)
                }
                className="bg-card rounded-2xl border border-card-border p-4 text-left shadow-sm hover:border-accent active:scale-[0.98]"
              >
                <p className="text-sm font-medium">{q.text}</p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-xs text-muted">
                    {new Date(q.scheduled_date!).toLocaleDateString("de-DE")}
                  </span>
                  <span className="text-xs text-muted">
                    {q.type === "poll"
                      ? "Abstimmung"
                      : q.type === "text"
                        ? "Freitext"
                        : q.type === "scale"
                          ? "Skala"
                          : q.type === "estimate"
                            ? "Schätzfrage"
                            : q.type === "team_split"
                              ? "Team-Aufteilung"
                              : q.type === "ranking"
                                ? "Ranking"
                                : q.type}
                  </span>
                  <span className="text-xs text-muted">
                    {q.answers?.[0]?.count || 0} Antworten
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
