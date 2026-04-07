"use client";

import { useState, useRef, useCallback } from "react";
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
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const touchStartY = useRef<number>(0);
  const touchCurrentItem = useRef<number | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const unranked = members.filter((m) => !ranked.find((r) => r.id === m.id));

  const addToRanking = useCallback(
    (member: { id: string; name: string }) => {
      setRanked((prev) => [...prev, member]);
    },
    []
  );

  const removeFromRanking = useCallback((memberId: string) => {
    setRanked((prev) => prev.filter((m) => m.id !== memberId));
  }, []);

  // Touch drag handlers
  function handleTouchStart(e: React.TouchEvent, index: number) {
    touchStartY.current = e.touches[0].clientY;
    touchCurrentItem.current = index;
    setDragIndex(index);
  }

  function handleTouchMove(e: React.TouchEvent) {
    if (touchCurrentItem.current === null || !listRef.current) return;
    e.preventDefault();

    const touch = e.touches[0];
    const items = listRef.current.querySelectorAll("[data-rank-item]");

    let targetIndex = touchCurrentItem.current;
    items.forEach((item, i) => {
      const rect = item.getBoundingClientRect();
      const midY = rect.top + rect.height / 2;
      if (touch.clientY > midY) {
        targetIndex = i;
      }
    });

    if (targetIndex !== dragOverIndex) {
      setDragOverIndex(targetIndex);
    }
  }

  function handleTouchEnd() {
    if (dragIndex !== null && dragOverIndex !== null && dragIndex !== dragOverIndex) {
      setRanked((prev) => {
        const next = [...prev];
        const [moved] = next.splice(dragIndex, 1);
        next.splice(dragOverIndex, 0, moved);
        return next;
      });
    }
    setDragIndex(null);
    setDragOverIndex(null);
    touchCurrentItem.current = null;
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Ranked list with touch drag */}
      {ranked.length > 0 && (
        <div className="flex flex-col gap-1" ref={listRef}>
          <p className="text-xs text-muted mb-1">Dein Ranking (halten & ziehen zum Sortieren):</p>
          {ranked.map((member, i) => (
            <div
              key={member.id}
              data-rank-item
              onTouchStart={(e) => handleTouchStart(e, i)}
              onTouchMove={(e) => handleTouchMove(e)}
              onTouchEnd={handleTouchEnd}
              className={`flex items-center gap-2 rounded-xl px-3 py-2.5 transition-all select-none ${
                dragIndex === i
                  ? "bg-accent/20 border-2 border-accent scale-[1.02] shadow-lg z-10 relative"
                  : dragOverIndex === i && dragIndex !== null
                    ? "border-2 border-accent/40 bg-accent/5"
                    : "bg-accent/10 border border-accent/20"
              }`}
            >
              {/* Drag handle */}
              <span className="text-muted text-sm cursor-grab active:cursor-grabbing touch-none">
                ⠿
              </span>
              <span className="text-sm font-bold text-accent w-6 text-center">
                {i + 1}.
              </span>
              <Avatar name={member.name} size="sm" />
              <span className="text-sm font-medium flex-1">{member.name}</span>
              <button
                type="button"
                onClick={() => removeFromRanking(member.id)}
                className="w-7 h-7 rounded-lg bg-red-50 border border-red-200 text-red-500 text-xs shrink-0"
              >
                ×
              </button>
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
