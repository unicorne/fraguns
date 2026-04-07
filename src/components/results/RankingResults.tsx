"use client";

import { useState } from "react";
import Avatar from "@/components/Avatar";

interface RankingResultsProps {
  answers: Array<{
    value: Record<string, unknown>;
    members: { id: string; name: string };
  }>;
  groupMembers: { id: string; name: string }[];
}

interface MemberRank {
  id: string;
  name: string;
  avgPosition: number;
  positions: { voterName: string; position: number }[];
}

export default function RankingResults({
  answers,
  groupMembers,
}: RankingResultsProps) {
  const [view, setView] = useState<"average" | "individual">("average");
  const [expandedMember, setExpandedMember] = useState<string | null>(null);

  // Calculate positions for each member
  const memberData: Record<string, MemberRank> = {};

  for (const member of groupMembers) {
    memberData[member.id] = {
      id: member.id,
      name: member.name,
      avgPosition: 0,
      positions: [],
    };
  }

  for (const answer of answers) {
    const ranking = answer.value.ranking as string[];
    if (!ranking) continue;
    ranking.forEach((memberId, index) => {
      if (!memberData[memberId]) return;
      memberData[memberId].positions.push({
        voterName: answer.members.name,
        position: index + 1,
      });
    });
  }

  // Calculate averages
  for (const data of Object.values(memberData)) {
    if (data.positions.length > 0) {
      data.avgPosition =
        data.positions.reduce((sum, p) => sum + p.position, 0) /
        data.positions.length;
    }
  }

  const ranked = Object.values(memberData)
    .filter((m) => m.positions.length > 0)
    .sort((a, b) => a.avgPosition - b.avgPosition);

  if (ranked.length === 0) return null;

  const maxPos = groupMembers.length;

  return (
    <div className="flex flex-col gap-3">
      {/* View toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => setView("average")}
          className={`flex-1 py-2 rounded-2xl text-xs font-semibold border ${
            view === "average"
              ? "bg-accent text-white border-accent"
              : "bg-background border-card-border text-muted"
          }`}
        >
          Durchschnitt
        </button>
        <button
          onClick={() => setView("individual")}
          className={`flex-1 py-2 rounded-2xl text-xs font-semibold border ${
            view === "individual"
              ? "bg-accent text-white border-accent"
              : "bg-background border-card-border text-muted"
          }`}
        >
          Einzelne Rankings
        </button>
      </div>

      {/* Average view */}
      {view === "average" && (
        <div className="flex flex-col gap-1.5">
          <p className="text-xs text-muted text-center mb-1">
            Tippe für Details
          </p>
          {ranked.map((entry, i) => {
            const isExpanded = expandedMember === entry.id;
            const barWidth =
              maxPos > 1
                ? ((maxPos - entry.avgPosition) / (maxPos - 1)) * 100
                : 100;

            return (
              <div key={entry.id}>
                <button
                  onClick={() =>
                    setExpandedMember(isExpanded ? null : entry.id)
                  }
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-2xl transition-colors ${
                    i === 0
                      ? "bg-orange/10"
                      : isExpanded
                        ? "bg-accent/5"
                        : ""
                  }`}
                >
                  <span
                    className={`text-sm font-bold w-6 text-center ${
                      i === 0 ? "text-orange" : "text-muted"
                    }`}
                  >
                    {i === 0 ? "🏆" : `${i + 1}.`}
                  </span>
                  <Avatar name={entry.name} size="sm" />
                  <div className="flex-1">
                    <span className="text-sm font-medium">{entry.name}</span>
                    <div className="h-2 rounded-full bg-background mt-1 overflow-hidden">
                      <div
                        className="h-full bg-orange/40 rounded-full"
                        style={{ width: `${Math.max(barWidth, 8)}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-xs text-muted font-semibold">
                    Ø {entry.avgPosition.toFixed(1)}
                  </span>
                </button>

                {isExpanded && (
                  <div className="ml-12 mt-1 mb-2 flex flex-col gap-1">
                    {/* Position distribution */}
                    <div className="flex items-center gap-1 mb-2 px-1">
                      <span className="text-[10px] text-muted w-4">1.</span>
                      <div className="flex-1 flex gap-px">
                        {Array.from({ length: maxPos }, (_, pos) => {
                          const count = entry.positions.filter(
                            (p) => p.position === pos + 1
                          ).length;
                          return (
                            <div
                              key={pos}
                              className="flex-1 rounded-sm bg-background overflow-hidden"
                              style={{ height: "16px" }}
                            >
                              <div
                                className="w-full bg-orange/50 rounded-sm transition-all"
                                style={{
                                  height:
                                    entry.positions.length > 0
                                      ? `${(count / entry.positions.length) * 100}%`
                                      : "0%",
                                  marginTop:
                                    entry.positions.length > 0
                                      ? `${100 - (count / entry.positions.length) * 100}%`
                                      : "100%",
                                }}
                              />
                            </div>
                          );
                        })}
                      </div>
                      <span className="text-[10px] text-muted w-4 text-right">
                        {maxPos}.
                      </span>
                    </div>

                    {entry.positions
                      .sort((a, b) => a.position - b.position)
                      .map((pos, vi) => (
                        <div
                          key={vi}
                          className="flex items-center gap-2 text-xs text-muted"
                        >
                          <span className="font-medium">{pos.voterName}</span>
                          <span className="text-[10px]">→</span>
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                              pos.position <= Math.ceil(maxPos / 3)
                                ? "bg-green-100 text-green-700"
                                : pos.position >= Math.ceil((maxPos * 2) / 3)
                                  ? "bg-red-100 text-red-600"
                                  : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            Platz {pos.position}
                          </span>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Individual rankings view */}
      {view === "individual" && (
        <div className="flex flex-col gap-4">
          {answers.map((answer, ai) => {
            const ranking = answer.value.ranking as string[];
            if (!ranking) return null;

            return (
              <div
                key={ai}
                className="bg-background rounded-2xl border border-card-border p-3"
              >
                <div className="flex items-center gap-2 mb-3">
                  <Avatar name={answer.members.name} size="sm" />
                  <span className="text-sm font-semibold">
                    {answer.members.name}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  {ranking.map((memberId, pos) => {
                    const member = groupMembers.find(
                      (m) => m.id === memberId
                    );
                    if (!member) return null;
                    return (
                      <div
                        key={memberId}
                        className="flex items-center gap-2 px-2 py-1.5"
                      >
                        <span
                          className={`text-xs font-bold w-5 text-center ${
                            pos === 0 ? "text-orange" : "text-muted"
                          }`}
                        >
                          {pos + 1}.
                        </span>
                        <Avatar name={member.name} size="sm" />
                        <span className="text-xs font-medium">
                          {member.name}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
