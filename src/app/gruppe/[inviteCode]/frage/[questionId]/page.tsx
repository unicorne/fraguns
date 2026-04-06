"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { getMemberForGroup } from "@/lib/storage";
import PollResults from "@/components/results/PollResults";
import TextResults from "@/components/results/TextResults";
import ScaleResults from "@/components/results/ScaleResults";

interface ResultsData {
  revealed: boolean;
  answered?: string[];
  total?: number;
  question: {
    id: string;
    text: string;
    type: string;
    config: Record<string, unknown>;
  };
  answers?: Array<{
    value: Record<string, unknown>;
    members: { id: string; name: string };
  }>;
}

export default function FrageErgebnisse({
  params,
}: {
  params: Promise<{ inviteCode: string; questionId: string }>;
}) {
  const { inviteCode, questionId } = use(params);
  const router = useRouter();
  const [results, setResults] = useState<ResultsData | null>(null);
  const [memberId, setMemberId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function init() {
      const res = await fetch(`/api/groups/${inviteCode}`);
      if (!res.ok) return;
      const group = await res.json();
      const stored = getMemberForGroup(group.id);
      if (stored) {
        setMemberId(stored.memberId);
      }
    }
    init();
  }, [inviteCode]);

  useEffect(() => {
    if (!memberId) return;
    fetchResults();
    const interval = setInterval(fetchResults, 10000);
    return () => clearInterval(interval);
  }, [questionId, memberId]);

  async function fetchResults() {
    try {
      const res = await fetch(
        `/api/questions/${questionId}/results?member_id=${memberId}`
      );
      if (res.ok) {
        setResults(await res.json());
      }
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center min-h-screen">
        <div className="text-muted">Laden...</div>
      </div>
    );
  }

  if (!results) return null;

  return (
    <div className="flex flex-col flex-1 min-h-screen">
      <div className="bg-gradient-to-b from-accent to-accent-light px-6 pt-8 pb-12 text-center">
        <button
          onClick={() => router.push(`/gruppe/${inviteCode}`)}
          className="text-white/70 text-sm mb-4 hover:text-white self-start block"
        >
          &larr; Zurück
        </button>
        <h2 className="text-xl font-bold text-white leading-snug">
          {results.question.text}
        </h2>
        <p className="text-white/60 text-xs mt-2">
          {results.question.type === "poll"
            ? "Abstimmung"
            : results.question.type === "text"
              ? "Freitext"
              : "Skala"}
        </p>
      </div>

      <main className="px-4 -mt-4 pb-8">
        {!results.revealed ? (
          <div className="bg-card rounded-2xl border border-card-border p-6 text-center shadow-sm">
            <p className="text-muted mb-3">
              Du musst zuerst antworten, um die Ergebnisse zu sehen.
            </p>
            <button
              onClick={() => router.push(`/gruppe/${inviteCode}`)}
              className="text-sm text-accent font-semibold hover:text-accent-dark"
            >
              Zur Frage
            </button>
          </div>
        ) : (
          <div className="bg-card rounded-2xl border border-card-border p-5 shadow-sm">
            <p className="text-xs text-muted mb-4 text-center">
              {results.answers?.length || 0} von {results.total} haben
              geantwortet
            </p>

            {results.question.type === "poll" && (
              <PollResults
                answers={results.answers || []}
                config={results.question.config}
              />
            )}
            {results.question.type === "text" && (
              <TextResults answers={results.answers || []} />
            )}
            {results.question.type === "scale" && (
              <ScaleResults
                answers={results.answers || []}
                config={results.question.config}
              />
            )}
          </div>
        )}
      </main>
    </div>
  );
}
