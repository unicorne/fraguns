"use client";

import { useState, useRef, useCallback, useEffect } from "react";
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
  // dragSource: { type: "ranked", index } or { type: "unranked", memberId }
  const [dragSource, setDragSource] = useState<
    | { type: "ranked"; index: number }
    | { type: "unranked"; member: { id: string; name: string } }
    | null
  >(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);
  const dragSourceRef = useRef(dragSource);
  dragSourceRef.current = dragSource;

  const containerRef = useRef<HTMLDivElement>(null);
  const rankedRef = useRef<HTMLDivElement>(null);

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

  // Non-passive touchmove on entire container
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    function onTouchMove(e: TouchEvent) {
      if (!dragSourceRef.current) return;
      e.preventDefault();

      const touch = e.touches[0];
      const rankedEl = rankedRef.current;
      if (!rankedEl) {
        // No ranked items yet — dropping will add at position 0
        setDropIndex(0);
        return;
      }

      const items = rankedEl.querySelectorAll("[data-rank-item]");
      if (items.length === 0) {
        setDropIndex(0);
        return;
      }

      // Check if above all items
      const firstRect = items[0].getBoundingClientRect();
      if (touch.clientY < firstRect.top + firstRect.height / 2) {
        setDropIndex(0);
        return;
      }

      let targetIndex = 0;
      items.forEach((item, i) => {
        const rect = item.getBoundingClientRect();
        const midY = rect.top + rect.height / 2;
        if (touch.clientY > midY) {
          targetIndex = i + 1;
        }
      });

      // Clamp to valid range
      const src = dragSourceRef.current;
      const maxIndex = src?.type === "ranked" ? items.length - 1 : items.length;
      setDropIndex(Math.min(targetIndex, maxIndex));
    }

    el.addEventListener("touchmove", onTouchMove, { passive: false });
    return () => el.removeEventListener("touchmove", onTouchMove);
  });

  function handleRankedTouchStart(index: number) {
    setDragSource({ type: "ranked", index });
  }

  function handleUnrankedTouchStart(member: { id: string; name: string }) {
    setDragSource({ type: "unranked", member });
  }

  function handleTouchEnd() {
    const src = dragSourceRef.current;
    const to = dropIndex;

    if (src && to !== null) {
      if (src.type === "ranked") {
        // Reorder within ranked list
        if (src.index !== to && src.index !== to - 1) {
          setRanked((prev) => {
            const next = [...prev];
            const [moved] = next.splice(src.index, 1);
            const insertAt = to > src.index ? to - 1 : to;
            next.splice(insertAt, 0, moved);
            return next;
          });
        }
      } else {
        // Insert from unranked pool into ranked list at position
        setRanked((prev) => {
          const next = [...prev];
          next.splice(to, 0, src.member);
          return next;
        });
      }
    }

    setDragSource(null);
    setDropIndex(null);
  }

  const isDragging = dragSource !== null;
  const draggingMemberId =
    dragSource?.type === "ranked"
      ? ranked[dragSource.index]?.id
      : dragSource?.type === "unranked"
        ? dragSource.member.id
        : null;

  return (
    <div className="flex flex-col gap-4" ref={containerRef}>
      {/* Ranked list */}
      <div className="flex flex-col gap-1" ref={rankedRef}>
        <p className="text-sm text-muted mb-1">Dein Ranking:</p>

        {ranked.length === 0 && isDragging && (
          <div
            data-rank-item
            className="flex items-center justify-center rounded-xl px-3 py-4 border-2 border-dashed border-accent/40 bg-accent/5"
          >
            <span className="text-sm text-accent">Hier ablegen</span>
          </div>
        )}

        {ranked.length === 0 && !isDragging && (
          <div className="flex items-center justify-center rounded-xl px-3 py-4 border border-dashed border-card-border">
            <span className="text-sm text-muted">
              Tippe oder ziehe Mitglieder hierher
            </span>
          </div>
        )}

        {ranked.map((member, i) => {
          // Show drop indicator line
          const showDropBefore =
            isDragging &&
            dropIndex === i &&
            !(dragSource?.type === "ranked" && dragSource.index === i);
          const showDropAfter =
            isDragging &&
            dropIndex === i + 1 &&
            !(dragSource?.type === "ranked" && dragSource.index === i) &&
            i === ranked.length - 1;

          return (
            <div key={member.id}>
              {showDropBefore && (
                <div className="h-1 bg-accent rounded-full mx-4 my-0.5" />
              )}
              <div
                data-rank-item
                onTouchStart={() => handleRankedTouchStart(i)}
                onTouchEnd={handleTouchEnd}
                className={`flex items-center gap-2 rounded-xl px-3 py-3 transition-all select-none touch-none ${
                  draggingMemberId === member.id
                    ? "bg-accent/20 border-2 border-accent scale-[1.02] shadow-lg z-10 relative"
                    : "bg-accent/10 border border-accent/20"
                }`}
              >
                <span className="text-muted text-sm">⠿</span>
                <span className="text-base font-bold text-accent w-7 text-center">
                  {i + 1}.
                </span>
                <Avatar name={member.name} size="sm" />
                <span className="text-base font-medium flex-1">
                  {member.name}
                </span>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => moveUp(i)}
                    disabled={i === 0}
                    className="w-8 h-8 rounded-lg bg-background border border-card-border text-sm disabled:opacity-30"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => moveDown(i)}
                    disabled={i === ranked.length - 1}
                    className="w-8 h-8 rounded-lg bg-background border border-card-border text-sm disabled:opacity-30"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={() => removeFromRanking(member.id)}
                    className="w-8 h-8 rounded-lg bg-red-50 border border-red-200 text-red-500 text-sm shrink-0"
                  >
                    ×
                  </button>
                </div>
              </div>
              {showDropAfter && (
                <div className="h-1 bg-accent rounded-full mx-4 my-0.5" />
              )}
            </div>
          );
        })}
      </div>

      {/* Unranked members to pick from */}
      {unranked.length > 0 && (
        <div className="flex flex-col gap-1">
          <p className="text-sm text-muted mb-1">
            Tippe oder ziehe nach oben:
          </p>
          {unranked.map((member) => (
            <div
              key={member.id}
              onTouchStart={() => handleUnrankedTouchStart(member)}
              onTouchEnd={handleTouchEnd}
              onClick={() => addToRanking(member)}
              className={`flex items-center gap-3 bg-background border border-card-border rounded-xl px-3 py-2.5 select-none touch-none transition-all ${
                draggingMemberId === member.id
                  ? "opacity-50 scale-95"
                  : ""
              }`}
            >
              <span className="text-muted text-sm">⠿</span>
              <Avatar name={member.name} size="sm" />
              <span className="text-base font-medium">{member.name}</span>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={() => onAnswer({ ranking: ranked.map((m) => m.id) })}
        disabled={submitting || ranked.length !== members.length}
        className="h-12 rounded-2xl bg-accent text-white text-base font-semibold hover:bg-accent-dark disabled:opacity-50"
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
