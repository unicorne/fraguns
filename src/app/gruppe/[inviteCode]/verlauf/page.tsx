"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { getMemberForGroup } from "@/lib/storage";
import Navigation from "@/components/Navigation";

interface Question {
  id: string;
  text: string;
  type: string;
  scheduled_date: string | null;
  is_active: boolean;
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
      const res = await fetch(`/api/groups/${inviteCode}`);
      if (!res.ok) return;
      const group = await res.json();

      const stored = getMemberForGroup(group.id);
      if (!stored) {
        router.push(`/gruppe/${inviteCode}`);
        return;
      }

      const qRes = await fetch(`/api/questions?group_id=${group.id}`);
      if (qRes.ok) {
        setQuestions(await qRes.json());
      }
      setLoading(false);
    }
    load();
  }, [inviteCode]);

  // Past questions = have a scheduled_date and are not active
  const past = questions
    .filter((q) => q.scheduled_date && !q.is_active)
    .sort(
      (a, b) =>
        new Date(b.scheduled_date!).getTime() -
        new Date(a.scheduled_date!).getTime()
    );

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="text-muted">Laden...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1">
      <header className="px-6 pt-6 pb-4">
        <h1 className="text-xl font-bold">Verlauf</h1>
      </header>

      <main className="flex-1 px-6 pb-24">
        {past.length === 0 ? (
          <div className="text-center py-12">
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
                className="bg-card rounded-xl border border-card-border p-4 text-left hover:border-accent"
              >
                <p className="text-sm">{q.text}</p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-xs text-muted">
                    {new Date(q.scheduled_date!).toLocaleDateString("de-DE")}
                  </span>
                  <span className="text-xs text-muted capitalize">
                    {q.type === "poll"
                      ? "Abstimmung"
                      : q.type === "text"
                        ? "Freitext"
                        : "Skala"}
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

      <Navigation inviteCode={inviteCode} active="verlauf" />
    </div>
  );
}
