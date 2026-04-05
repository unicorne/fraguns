"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResults();
    // Poll every 10s for new answers
    const interval = setInterval(fetchResults, 10000);
    return () => clearInterval(interval);
  }, [questionId]);

  async function fetchResults() {
    try {
      const res = await fetch(`/api/questions/${questionId}/results`);
      if (res.ok) {
        setResults(await res.json());
      }
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="text-muted">Laden...</div>
      </div>
    );
  }

  if (!results) return null;

  return (
    <div className="flex flex-col flex-1 px-6 pt-6 pb-24">
      <button
        onClick={() => router.push(`/gruppe/${inviteCode}`)}
        className="text-muted text-sm mb-6 hover:text-foreground self-start"
      >
        &larr; Zurück
      </button>

      <div className="bg-card rounded-xl border border-card-border p-6 mb-4">
        <p className="text-lg font-medium">{results.question.text}</p>
        <p className="text-xs text-muted mt-1 capitalize">
          {results.question.type === "poll"
            ? "Abstimmung"
            : results.question.type === "text"
              ? "Freitext"
              : "Skala"}
        </p>
      </div>

      {!results.revealed ? (
        <div className="bg-card rounded-xl border border-card-border p-6 text-center">
          <p className="text-muted mb-3">
            Warte auf alle Antworten ({results.answered?.length || 0}/
            {results.total})
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {results.answered?.map((name) => (
              <span
                key={name}
                className="px-3 py-1 rounded-full bg-accent/20 text-accent text-sm"
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-card-border p-6">
          <h2 className="text-sm font-medium text-muted mb-4">Ergebnisse</h2>

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
    </div>
  );
}
