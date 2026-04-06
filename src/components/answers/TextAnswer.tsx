"use client";

import { useState } from "react";

interface TextAnswerProps {
  onAnswer: (value: Record<string, unknown>) => void;
  submitting: boolean;
}

export default function TextAnswer({ onAnswer, submitting }: TextAnswerProps) {
  const [text, setText] = useState("");

  return (
    <div className="flex flex-col gap-3">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Deine Antwort..."
        rows={3}
        className="w-full rounded-2xl bg-background border border-card-border px-4 py-3 text-foreground placeholder:text-muted focus:outline-none focus:border-accent resize-none"
      />
      <button
        onClick={() => onAnswer({ text })}
        disabled={submitting || !text.trim()}
        className="h-11 rounded-2xl bg-accent text-white font-semibold hover:bg-accent-dark disabled:opacity-50"
      >
        {submitting ? "Sende..." : "Absenden"}
      </button>
    </div>
  );
}
