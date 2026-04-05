"use client";

import { useEffect, useState } from "react";
import PollAnswer from "./answers/PollAnswer";
import TextAnswer from "./answers/TextAnswer";
import ScaleAnswer from "./answers/ScaleAnswer";
import PollResults from "./results/PollResults";
import TextResults from "./results/TextResults";
import ScaleResults from "./results/ScaleResults";

interface Answer {
  value: Record<string, unknown>;
  members: { id: string; name: string };
}

interface ResultsData {
  revealed: boolean;
  answers?: Answer[];
  answered?: string[];
  total?: number;
  question: {
    id: string;
    text: string;
    type: string;
    config: Record<string, unknown>;
  };
}

interface QuestionCardProps {
  question: {
    id: string;
    text: string;
    type: string;
    config: Record<string, unknown>;
  };
  groupId: string;
  memberId: string;
  members: { id: string; name: string }[];
  inviteCode: string;
}

export default function QuestionCard({
  question,
  groupId,
  memberId,
  members,
  inviteCode,
}: QuestionCardProps) {
  const [results, setResults] = useState<ResultsData | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkResults();
  }, [question.id, memberId]);

  async function checkResults() {
    try {
      const res = await fetch(
        `/api/questions/${question.id}/results?member_id=${memberId}`
      );
      if (res.ok) {
        const data = await res.json();
        setResults(data);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleAnswer(value: Record<string, unknown>) {
    setSubmitting(true);
    try {
      const res = await fetch("/api/answers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question_id: question.id,
          member_id: memberId,
          value,
        }),
      });
      if (res.ok) {
        // Re-fetch results — now revealed since we answered
        await checkResults();
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="bg-card rounded-xl border border-card-border p-6 text-center">
        <p className="text-muted">Laden...</p>
      </div>
    );
  }

  // Already answered — show results
  if (results?.revealed) {
    return (
      <div className="bg-card rounded-xl border border-card-border p-6">
        <p className="text-lg font-medium mb-4">{question.text}</p>

        {question.type === "poll" && (
          <PollResults
            answers={results.answers || []}
            config={question.config}
          />
        )}
        {question.type === "text" && (
          <TextResults answers={results.answers || []} />
        )}
        {question.type === "scale" && (
          <ScaleResults
            answers={results.answers || []}
            config={question.config}
          />
        )}

        <p className="text-xs text-muted mt-4 text-center">
          {results.answers?.length || 0} von {results.total} haben geantwortet
        </p>
      </div>
    );
  }

  // Not yet answered — show answer form
  return (
    <div className="bg-card rounded-xl border border-card-border p-6">
      <p className="text-lg font-medium mb-4">{question.text}</p>

      {question.type === "poll" && (
        <PollAnswer
          config={question.config}
          members={members}
          onAnswer={handleAnswer}
          submitting={submitting}
        />
      )}
      {question.type === "text" && (
        <TextAnswer onAnswer={handleAnswer} submitting={submitting} />
      )}
      {question.type === "scale" && (
        <ScaleAnswer
          config={question.config}
          onAnswer={handleAnswer}
          submitting={submitting}
        />
      )}
    </div>
  );
}
