"use client";

import { useState, useRef } from "react";
import Avatar from "@/components/Avatar";

interface TeamSplitAnswerProps {
  config: Record<string, unknown>;
  members: { id: string; name: string }[];
  onAnswer: (value: Record<string, unknown>) => void;
  submitting: boolean;
}

export default function TeamSplitAnswer({
  config,
  members,
  onAnswer,
  submitting,
}: TeamSplitAnswerProps) {
  const teamLabels = (config.team_labels as string[]) || ["Team A", "Team B"];
  // assignments: memberId -> 0 or 1
  const [assignments, setAssignments] = useState<Record<string, number>>({});
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverZone, setDragOverZone] = useState<number | null>(null);
  const teamARef = useRef<HTMLDivElement>(null);
  const teamBRef = useRef<HTMLDivElement>(null);

  function assignMember(memberId: string, team: number) {
    setAssignments((prev) => ({ ...prev, [memberId]: team }));
  }

  function unassignMember(memberId: string) {
    setAssignments((prev) => {
      const next = { ...prev };
      delete next[memberId];
      return next;
    });
  }

  // Touch drag
  function handleTouchStart(memberId: string) {
    setDraggingId(memberId);
  }

  function handleTouchMove(e: React.TouchEvent) {
    if (!draggingId) return;
    e.preventDefault();
    const touch = e.touches[0];

    const aRect = teamARef.current?.getBoundingClientRect();
    const bRect = teamBRef.current?.getBoundingClientRect();

    if (aRect && touch.clientX >= aRect.left && touch.clientX <= aRect.right &&
        touch.clientY >= aRect.top && touch.clientY <= aRect.bottom) {
      setDragOverZone(0);
    } else if (bRect && touch.clientX >= bRect.left && touch.clientX <= bRect.right &&
               touch.clientY >= bRect.top && touch.clientY <= bRect.bottom) {
      setDragOverZone(1);
    } else {
      setDragOverZone(null);
    }
  }

  function handleTouchEnd() {
    if (draggingId && dragOverZone !== null) {
      assignMember(draggingId, dragOverZone);
    }
    setDraggingId(null);
    setDragOverZone(null);
  }

  const allAssigned = members.every((m) => assignments[m.id] !== undefined);
  const team0 = members.filter((m) => assignments[m.id] === 0);
  const team1 = members.filter((m) => assignments[m.id] === 1);
  const unassigned = members.filter((m) => assignments[m.id] === undefined);

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted text-center">
        Teile alle Mitglieder in zwei Gruppen ein!
      </p>

      {/* Drop zones */}
      <div className="grid grid-cols-2 gap-2">
        {/* Team 0 */}
        <div
          ref={teamARef}
          className={`flex flex-col gap-1 p-2 rounded-2xl border-2 min-h-[100px] transition-colors ${
            dragOverZone === 0
              ? "border-blue-400 bg-blue-500/10"
              : "border-blue-500/20 bg-blue-500/5"
          }`}
        >
          <h3 className="text-xs font-bold text-blue-600 text-center py-1">
            {teamLabels[0]}
          </h3>
          {team0.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => unassignMember(m.id)}
              onTouchStart={() => handleTouchStart(m.id)}
              onTouchMove={(e) => handleTouchMove(e)}
              onTouchEnd={handleTouchEnd}
              className={`flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-xl px-2.5 py-2 transition-all select-none ${
                draggingId === m.id ? "opacity-50 scale-95" : ""
              }`}
            >
              <Avatar name={m.name} size="sm" />
              <span className="text-xs font-medium flex-1 text-left">{m.name}</span>
            </button>
          ))}
          {team0.length === 0 && !draggingId && (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-xs text-muted py-4">Hierher ziehen</p>
            </div>
          )}
        </div>

        {/* Team 1 */}
        <div
          ref={teamBRef}
          className={`flex flex-col gap-1 p-2 rounded-2xl border-2 min-h-[100px] transition-colors ${
            dragOverZone === 1
              ? "border-red-400 bg-red-400/10"
              : "border-red-400/20 bg-red-400/5"
          }`}
        >
          <h3 className="text-xs font-bold text-red-500 text-center py-1">
            {teamLabels[1]}
          </h3>
          {team1.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => unassignMember(m.id)}
              onTouchStart={() => handleTouchStart(m.id)}
              onTouchMove={(e) => handleTouchMove(e)}
              onTouchEnd={handleTouchEnd}
              className={`flex items-center gap-2 bg-red-400/10 border border-red-400/20 rounded-xl px-2.5 py-2 transition-all select-none ${
                draggingId === m.id ? "opacity-50 scale-95" : ""
              }`}
            >
              <Avatar name={m.name} size="sm" />
              <span className="text-xs font-medium flex-1 text-left">{m.name}</span>
            </button>
          ))}
          {team1.length === 0 && !draggingId && (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-xs text-muted py-4">Hierher ziehen</p>
            </div>
          )}
        </div>
      </div>

      {/* Unassigned members */}
      {unassigned.length > 0 && (
        <div className="flex flex-col gap-1">
          <p className="text-xs text-muted mb-1">
            Tippe oder ziehe in ein Team ({unassigned.length} übrig):
          </p>
          {unassigned.map((m) => (
            <div
              key={m.id}
              onTouchStart={() => handleTouchStart(m.id)}
              onTouchMove={(e) => handleTouchMove(e)}
              onTouchEnd={handleTouchEnd}
              className={`flex items-center gap-3 bg-background border border-card-border rounded-xl px-3 py-2.5 select-none transition-all ${
                draggingId === m.id ? "opacity-50 scale-95" : ""
              }`}
            >
              <span className="text-muted text-sm touch-none">⠿</span>
              <Avatar name={m.name} size="sm" />
              <span className="text-sm font-medium flex-1">{m.name}</span>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => assignMember(m.id, 0)}
                  className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-blue-500/10 text-blue-600 border border-blue-500/20"
                >
                  {teamLabels[0]}
                </button>
                <button
                  type="button"
                  onClick={() => assignMember(m.id, 1)}
                  className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-red-400/10 text-red-500 border border-red-400/20"
                >
                  {teamLabels[1]}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={() => onAnswer({ assignments })}
        disabled={submitting || !allAssigned}
        className="h-11 rounded-2xl bg-accent text-white font-semibold hover:bg-accent-dark disabled:opacity-50"
      >
        {submitting
          ? "Sende..."
          : allAssigned
            ? "Absenden"
            : `Noch ${unassigned.length} zuordnen`}
      </button>
    </div>
  );
}
