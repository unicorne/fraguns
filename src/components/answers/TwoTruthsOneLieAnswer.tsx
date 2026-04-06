"use client";

import { useState } from "react";

interface TwoTruthsOneLieAnswerProps {
  onAnswer: (value: Record<string, unknown>) => void;
  submitting: boolean;
}

export default function TwoTruthsOneLieAnswer({
  onAnswer,
  submitting,
}: TwoTruthsOneLieAnswerProps) {
  const [statements, setStatements] = useState(["", "", ""]);
  const [lieIndex, setLieIndex] = useState<number | null>(null);

  function updateStatement(index: number, value: string) {
    const next = [...statements];
    next[index] = value;
    setStatements(next);
  }

  const allFilled = statements.every((s) => s.trim());
  const canSubmit = allFilled && lieIndex !== null && !submitting;

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted text-center">
        Schreibe 2 wahre und 1 falsche Aussage über dich. Markiere die Lüge.
      </p>

      {statements.map((s, i) => (
        <div key={i} className="flex items-start gap-2">
          <button
            type="button"
            onClick={() => setLieIndex(i)}
            className={`mt-2.5 w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${
              lieIndex === i
                ? "bg-red-500 border-red-500"
                : "border-card-border hover:border-red-300"
            }`}
          >
            {lieIndex === i && (
              <span className="text-white text-xs font-bold">L</span>
            )}
          </button>
          <input
            type="text"
            value={s}
            onChange={(e) => updateStatement(i, e.target.value)}
            placeholder={`Aussage ${i + 1}`}
            className="flex-1 h-10 rounded-2xl bg-background border border-card-border px-4 text-foreground placeholder:text-muted focus:outline-none focus:border-accent"
          />
        </div>
      ))}

      <p className="text-xs text-muted text-center">
        {lieIndex === null
          ? "Tippe auf den Kreis neben der Lüge"
          : `Aussage ${lieIndex + 1} ist als Lüge markiert`}
      </p>

      <button
        onClick={() =>
          onAnswer({ statements, lie_index: lieIndex })
        }
        disabled={!canSubmit}
        className="h-11 rounded-2xl bg-accent text-white font-semibold hover:bg-accent-dark disabled:opacity-50"
      >
        {submitting ? "Sende..." : "Absenden"}
      </button>
    </div>
  );
}
