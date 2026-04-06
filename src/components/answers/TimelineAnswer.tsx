"use client";

import { useState } from "react";

interface TimelineAnswerProps {
  onAnswer: (value: Record<string, unknown>) => void;
  submitting: boolean;
}

export default function TimelineAnswer({
  onAnswer,
  submitting,
}: TimelineAnswerProps) {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);

  return (
    <div className="flex flex-col gap-4">
      <div className="text-center">
        <span className="text-4xl font-bold text-accent">{year}</span>
      </div>

      <input
        type="range"
        min={1950}
        max={currentYear}
        value={year}
        onChange={(e) => setYear(Number(e.target.value))}
        className="w-full accent-accent"
      />

      <div className="flex justify-between text-xs text-muted">
        <span>1950</span>
        <span>{currentYear}</span>
      </div>

      <button
        onClick={() => onAnswer({ year })}
        disabled={submitting}
        className="h-11 rounded-2xl bg-accent text-white font-semibold hover:bg-accent-dark disabled:opacity-50"
      >
        {submitting ? "Sende..." : "Absenden"}
      </button>
    </div>
  );
}
