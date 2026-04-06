"use client";

import { useState } from "react";

interface ScaleAnswerProps {
  config: Record<string, unknown>;
  onAnswer: (value: Record<string, unknown>) => void;
  submitting: boolean;
}

export default function ScaleAnswer({
  config,
  onAnswer,
  submitting,
}: ScaleAnswerProps) {
  const min = (config.min as number) || 1;
  const max = (config.max as number) || 10;
  const labels = (config.labels as Record<string, string>) || {};
  const [value, setValue] = useState(Math.round((min + max) / 2));

  return (
    <div className="flex flex-col gap-4">
      <div className="text-center">
        <span className="text-4xl font-bold text-accent">{value}</span>
      </div>

      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => setValue(Number(e.target.value))}
        className="w-full accent-accent"
      />

      <div className="flex justify-between text-xs text-muted">
        <span>{labels[String(min)] || min}</span>
        <span>{labels[String(max)] || max}</span>
      </div>

      <button
        onClick={() => onAnswer({ scale: value })}
        disabled={submitting}
        className="h-11 rounded-2xl bg-accent text-white font-semibold hover:bg-accent-dark disabled:opacity-50"
      >
        {submitting ? "Sende..." : "Absenden"}
      </button>
    </div>
  );
}
