"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PollAnswer from "./answers/PollAnswer";
import TextAnswer from "./answers/TextAnswer";
import ScaleAnswer from "./answers/ScaleAnswer";

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
  const router = useRouter();
  const [answered, setAnswered] = useState(false);
  const [submitting, setSubmitting] = useState(false);

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
        setAnswered(true);
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (answered) {
    return (
      <div className="bg-card rounded-xl border border-card-border p-6 text-center">
        <p className="text-lg font-medium mb-2">Antwort gespeichert!</p>
        <p className="text-muted text-sm mb-4">
          Ergebnisse werden aufgedeckt, wenn alle geantwortet haben.
        </p>
        <button
          onClick={() =>
            router.push(`/gruppe/${inviteCode}/frage/${question.id}`)
          }
          className="text-sm text-accent hover:text-accent-light"
        >
          Ergebnisse ansehen
        </button>
      </div>
    );
  }

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
