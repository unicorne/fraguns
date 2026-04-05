"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { getMemberForGroup } from "@/lib/storage";
import Navigation from "@/components/Navigation";

interface Question {
  id: string;
  text: string;
  type: string;
  is_active: boolean;
  scheduled_date: string | null;
  created_at: string;
  answers: { count: number }[];
}

export default function FragenListe({
  params,
}: {
  params: Promise<{ inviteCode: string }>;
}) {
  const { inviteCode } = use(params);
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [groupId, setGroupId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/groups/${inviteCode}`);
      if (!res.ok) return;
      const group = await res.json();
      setGroupId(group.id);

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

  const queued = questions.filter((q) => !q.scheduled_date && !q.is_active);

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="text-muted">Laden...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1">
      <header className="px-6 pt-6 pb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">Fragen-Warteschlange</h1>
        <button
          onClick={() => router.push(`/gruppe/${inviteCode}/fragen/neu`)}
          className="text-sm px-4 py-2 rounded-xl bg-accent text-white font-medium hover:bg-accent-light"
        >
          + Neue Frage
        </button>
      </header>

      <main className="flex-1 px-6 pb-24">
        {queued.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted">Noch keine Fragen in der Warteschlange</p>
            <p className="text-muted text-sm mt-1">
              Füge Fragen hinzu, die täglich aktiviert werden
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {queued.map((q, i) => (
              <div
                key={q.id}
                className="bg-card rounded-xl border border-card-border p-4 flex items-start gap-3"
              >
                <span className="text-xs text-muted mt-0.5 w-5">{i + 1}.</span>
                <div className="flex-1">
                  <p className="text-sm">{q.text}</p>
                  <p className="text-xs text-muted mt-1 capitalize">
                    {q.type === "poll"
                      ? "Abstimmung"
                      : q.type === "text"
                        ? "Freitext"
                        : "Skala"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Navigation inviteCode={inviteCode} active="fragen" />
    </div>
  );
}
