"use client";

import { useState, useCallback } from "react";
import Avatar from "@/components/Avatar";

interface RankingAnswerProps {
  members: { id: string; name: string }[];
  onAnswer: (value: Record<string, unknown>) => void;
  submitting: boolean;
}

export default function RankingAnswer({
  members,
  onAnswer,
  submitting,
}: RankingAnswerProps) {
  const [ranked, setRanked] = useState<{ id: string; name: string }[]>([]);
  const unranked = members.filter((m) => !ranked.find((r) => r.id === m.id));

  const addToRanking = useCallback(
    (member: { id: string; name: string }) => {
      setRanked((prev) => [...prev, member]);
    },
    []
  );

  const removeFromRanking = useCallback(
    (memberId: string) => {
      setRanked((prev) => prev.filter((m) => m.id !== memberId));
    },
    []
  );

  const moveUp = useCallback((index: number) => {
    if (index === 0) return;
    setRanked((prev) => {
      const next = [...prev];
      [next[index - 1], next[index]] = [next[index], next[index - 1]];
      return next;
    });
  }, []);

  const moveDown = useCallback((index: number) => {
    setRanked((prev) => {
      if (index >= prev.length - 1) return prev;
      const next = [...prev];
      [next[index], next[index + 1]] = [next[index + 1], next[index]];
      return next;
    });
  }, []);

  return (
    <div className="flex flex-col gap-4">
      {/* Ranked list */}
      {ranked.length > 0 && (
        <div className="flex flex-col gap-1">
          <p className="text-xs text-muted mb-1">Dein Ranking:</p>
          {ranked.map((member, i) => (
            <div
              key={member.id}
              className="flex items-center gap-2 bg-accent/10 border border-accent/20 rounded-xl px-3 py-2"
            >
              <span className="text-sm font-bold text-accent w-6 text-center">
                {i + 1}.
              </span>
              <Avatar name={member.name} size="sm" />
              <span className="text-sm font-medium flex-1">{member.name}</span>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => moveUp(i)}
                  disabled={i === 0}
                  className="w-7 h-7 rounded-lg bg-background border border-card-border text-xs disabled:opacity-30"
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => moveDown(i)}
                  disabled={i === ranked.length - 1}
                  className="w-7 h-7 rounded-lg bg-background border border-card-border text-xs disabled:opacity-30"
                >
                  ↓
                </button>
                <button
                  type="button"
                  onClick={() => removeFromRanking(member.id)}
                  className="w-7 h-7 rounded-lg bg-red-50 border border-red-200 text-red-500 text-xs"
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Unranked members to pick from */}
      {unranked.length > 0 && (
        <div className="flex flex-col gap-1">
          <p className="text-xs text-muted mb-1">
            Tippe in der Reihenfolge, die du willst:
          </p>
          {unranked.map((member) => (
            <button
              key={member.id}
              type="button"
              onClick={() => addToRanking(member)}
              className="flex items-center gap-3 bg-background border border-card-border rounded-xl px-3 py-2.5 hover:border-accent/50 transition-colors"
            >
              <Avatar name={member.name} size="sm" />
              <span className="text-sm font-medium">{member.name}</span>
            </button>
          ))}
        </div>
      )}

      <button
        onClick={() => onAnswer({ ranking: ranked.map((m) => m.id) })}
        disabled={submitting || ranked.length !== members.length}
        className="h-11 rounded-2xl bg-accent text-white font-semibold hover:bg-accent-dark disabled:opacity-50"
      >
        {submitting
          ? "Sende..."
          : ranked.length === members.length
            ? "Absenden"
            : `Noch ${members.length - ranked.length} auswählen`}
      </button>
    </div>
  );
}
