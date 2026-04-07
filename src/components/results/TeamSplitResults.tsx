"use client";

import { useState } from "react";
import Avatar from "@/components/Avatar";

interface TeamSplitResultsProps {
  answers: Array<{
    value: Record<string, unknown>;
    members: { id: string; name: string };
  }>;
  config: Record<string, unknown>;
  groupMembers: { id: string; name: string }[];
}

interface MemberScore {
  id: string;
  name: string;
  teamAVotes: number;
  teamBVotes: number;
  total: number;
  ratio: number; // 0 = all team A, 1 = all team B
  voters: { name: string; team: number }[];
}

export default function TeamSplitResults({
  answers,
  config,
  groupMembers,
}: TeamSplitResultsProps) {
  const teamLabels = (config.team_labels as string[]) || ["Team A", "Team B"];
  const [expandedMember, setExpandedMember] = useState<string | null>(null);

  // Calculate scores for each group member
  const scoreMap: Record<string, MemberScore> = {};

  for (const member of groupMembers) {
    scoreMap[member.id] = {
      id: member.id,
      name: member.name,
      teamAVotes: 0,
      teamBVotes: 0,
      total: 0,
      ratio: 0.5,
      voters: [],
    };
  }

  for (const answer of answers) {
    const assignments = answer.value.assignments as Record<string, number>;
    if (!assignments) continue;

    for (const [memberId, team] of Object.entries(assignments)) {
      if (!scoreMap[memberId]) continue;
      scoreMap[memberId].total += 1;
      if (team === 0) {
        scoreMap[memberId].teamAVotes += 1;
      } else {
        scoreMap[memberId].teamBVotes += 1;
      }
      scoreMap[memberId].voters.push({
        name: answer.members.name,
        team,
      });
    }
  }

  // Calculate ratio for each member
  for (const score of Object.values(scoreMap)) {
    if (score.total > 0) {
      score.ratio = score.teamBVotes / score.total;
    }
  }

  // Sort by ratio: team A (left) to team B (right)
  const sorted = Object.values(scoreMap).sort((a, b) => a.ratio - b.ratio);

  if (sorted.length === 0) return null;

  return (
    <div className="flex flex-col gap-5">
      {/* Spectrum header */}
      <div className="flex justify-between items-center">
        <span className="text-xs font-bold text-blue-600 bg-blue-500/10 px-3 py-1.5 rounded-xl">
          {teamLabels[0]}
        </span>
        <div className="flex-1 mx-3 h-px bg-gradient-to-r from-blue-400 via-card-border to-red-400" />
        <span className="text-xs font-bold text-red-500 bg-red-400/10 px-3 py-1.5 rounded-xl">
          {teamLabels[1]}
        </span>
      </div>

      {/* Spectrum visualization */}
      <div className="relative bg-gradient-to-r from-blue-500/5 via-background to-red-400/5 rounded-2xl border border-card-border py-3 px-2 min-h-[80px]">
        {/* Gradient bar */}
        <div className="h-1.5 rounded-full bg-gradient-to-r from-blue-400 via-gray-300 to-red-400 mb-4 mx-1" />

        {/* Member dots on spectrum */}
        <div className="relative h-12">
          {sorted.map((member, i) => {
            // Position: 5% to 95% range
            const pos = 5 + member.ratio * 90;
            // Slight vertical offset to avoid overlap
            const row = i % 2;
            return (
              <button
                key={member.id}
                onClick={() =>
                  setExpandedMember(
                    expandedMember === member.id ? null : member.id
                  )
                }
                className="absolute transition-all"
                style={{
                  left: `${pos}%`,
                  top: row === 0 ? "0px" : "28px",
                  transform: "translateX(-50%)",
                }}
              >
                <div
                  className={`ring-2 rounded-full ${
                    expandedMember === member.id
                      ? "ring-accent scale-110"
                      : "ring-white"
                  }`}
                >
                  <Avatar name={member.name} size="sm" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Member list with details */}
      <div className="flex flex-col gap-1.5">
        {sorted.map((member) => {
          const isExpanded = expandedMember === member.id;
          const teamAPercent =
            member.total > 0
              ? Math.round((member.teamAVotes / member.total) * 100)
              : 50;
          const teamBPercent = 100 - teamAPercent;

          return (
            <div key={member.id}>
              <button
                onClick={() =>
                  setExpandedMember(isExpanded ? null : member.id)
                }
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-colors ${
                  isExpanded ? "bg-accent/5 border border-accent/20" : ""
                }`}
              >
                <Avatar name={member.name} size="sm" />
                <span className="text-sm font-medium flex-1 text-left">
                  {member.name}
                </span>

                {/* Mini bar */}
                <div className="w-24 h-4 rounded-full overflow-hidden flex bg-gray-100">
                  <div
                    className="h-full bg-blue-400 transition-all"
                    style={{ width: `${teamAPercent}%` }}
                  />
                  <div
                    className="h-full bg-red-400 transition-all"
                    style={{ width: `${teamBPercent}%` }}
                  />
                </div>

                <span className="text-[10px] text-muted w-14 text-right">
                  {member.teamAVotes}:{member.teamBVotes}
                </span>
              </button>

              {/* Expanded voter details */}
              {isExpanded && member.voters.length > 0 && (
                <div className="ml-12 mt-1 mb-2 flex flex-col gap-1">
                  {member.voters.map((voter, vi) => (
                    <div
                      key={vi}
                      className="flex items-center gap-2 text-xs text-muted"
                    >
                      <span className="font-medium">{voter.name}</span>
                      <span className="text-[10px]">→</span>
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          voter.team === 0
                            ? "bg-blue-500/10 text-blue-600"
                            : "bg-red-400/10 text-red-500"
                        }`}
                      >
                        {teamLabels[voter.team]}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
