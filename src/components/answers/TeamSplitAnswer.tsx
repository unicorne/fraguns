"use client";

import { useState } from "react";

interface TeamSplitAnswerProps {
  config: Record<string, unknown>;
  onAnswer: (value: Record<string, unknown>) => void;
  submitting: boolean;
}

export default function TeamSplitAnswer({
  config,
  onAnswer,
  submitting,
}: TeamSplitAnswerProps) {
  const teamLabels = (config.team_labels as string[]) || ["Team A", "Team B"];
  const [selected, setSelected] = useState<number | null>(null);

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted text-center">
        Ordne dich einem Team zu!
      </p>

      <div className="grid grid-cols-2 gap-3">
        {teamLabels.map((label, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setSelected(i)}
            className={`py-6 rounded-2xl text-sm font-bold border-2 transition-colors ${
              selected === i
                ? "bg-accent text-white border-accent"
                : "bg-background border-card-border text-foreground hover:border-accent/50"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <button
        onClick={() => onAnswer({ team: selected })}
        disabled={submitting || selected === null}
        className="h-11 rounded-2xl bg-accent text-white font-semibold hover:bg-accent-dark disabled:opacity-50"
      >
        {submitting ? "Sende..." : "Absenden"}
      </button>
    </div>
  );
}
