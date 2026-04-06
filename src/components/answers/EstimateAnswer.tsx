"use client";

import { useState } from "react";

interface EstimateAnswerProps {
  config: Record<string, unknown>;
  onAnswer: (value: Record<string, unknown>) => void;
  submitting: boolean;
}

export default function EstimateAnswer({
  config,
  onAnswer,
  submitting,
}: EstimateAnswerProps) {
  const unit = (config.unit as string) || "";
  const [value, setValue] = useState("");

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <input
          type="number"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Deine Schätzung..."
          className="flex-1 h-12 rounded-2xl bg-background border border-card-border px-4 text-foreground text-lg text-center placeholder:text-muted focus:outline-none focus:border-accent"
        />
        {unit && (
          <span className="text-sm text-muted font-medium">{unit}</span>
        )}
      </div>

      <button
        onClick={() => onAnswer({ estimate: Number(value) })}
        disabled={submitting || value === ""}
        className="h-11 rounded-2xl bg-accent text-white font-semibold hover:bg-accent-dark disabled:opacity-50"
      >
        {submitting ? "Sende..." : "Absenden"}
      </button>
    </div>
  );
}
