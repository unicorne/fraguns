"use client";

import { useState, useEffect } from "react";
import Avatar from "@/components/Avatar";

interface Answer {
  value: Record<string, unknown>;
  members: { id: string; name: string };
}

interface Vote {
  voter_id: string;
  target_member_id: string;
  voted_index: number;
}

interface TwoTruthsOneLieResultsProps {
  answers: Answer[];
  questionId: string;
  memberId: string;
}

export default function TwoTruthsOneLieResults({
  answers,
  questionId,
  memberId,
}: TwoTruthsOneLieResultsProps) {
  const [votes, setVotes] = useState<Vote[]>([]);
  const [allVotes, setAllVotes] = useState<Vote[]>([]);
  const [voting, setVoting] = useState(false);

  useEffect(() => {
    fetchVotes();
  }, [questionId, memberId]);

  async function fetchVotes() {
    // Fetch my votes
    const myRes = await fetch(
      `/api/votes?question_id=${questionId}&voter_id=${memberId}`
    );
    if (myRes.ok) {
      setVotes(await myRes.json());
    }
    // Fetch all votes for leaderboard
    const allRes = await fetch(`/api/votes?question_id=${questionId}`);
    if (allRes.ok) {
      setAllVotes(await allRes.json());
    }
  }

  async function handleVote(targetMemberId: string, votedIndex: number) {
    setVoting(true);
    try {
      const res = await fetch("/api/votes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question_id: questionId,
          voter_id: memberId,
          target_member_id: targetMemberId,
          voted_index: votedIndex,
        }),
      });
      if (res.ok) {
        await fetchVotes();
      }
    } finally {
      setVoting(false);
    }
  }

  // Other members' answers (not my own)
  const otherAnswers = answers.filter((a) => a.members.id !== memberId);
  const myVotedTargets = new Set(votes.map((v) => v.target_member_id));
  const unvoted = otherAnswers.filter((a) => !myVotedTargets.has(a.members.id));
  const voted = otherAnswers.filter((a) => myVotedTargets.has(a.members.id));

  // Leaderboard: who guessed the most lies correctly
  const leaderboard = answers
    .filter((a) => a.members.id !== memberId)
    .map(() => null); // placeholder

  // Calculate scores from all votes
  const scoreMap: Record<string, { name: string; correct: number; total: number }> = {};
  for (const answer of answers) {
    const membVotes = allVotes.filter(
      (v) => v.voter_id === answer.members.id
    );
    const correct = membVotes.filter((v) => {
      const target = answers.find((a) => a.members.id === v.target_member_id);
      if (!target) return false;
      return v.voted_index === (target.value.lie_index as number);
    }).length;
    scoreMap[answer.members.id] = {
      name: answer.members.name,
      correct,
      total: membVotes.length,
    };
  }
  void leaderboard;

  const rankedScores = Object.values(scoreMap)
    .filter((s) => s.total > 0)
    .sort((a, b) => b.correct - a.correct);

  return (
    <div className="flex flex-col gap-5">
      {/* Progress */}
      <div className="text-center bg-accent/10 rounded-2xl py-3">
        <p className="text-xs text-muted">Dein Fortschritt</p>
        <p className="text-lg font-bold text-accent">
          {voted.length} von {otherAnswers.length} bewertet
        </p>
      </div>

      {/* Unvoted members — voting phase */}
      {unvoted.length > 0 && (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-muted text-center font-medium">
            Welche Aussage ist die Lüge?
          </p>
          {unvoted.map((answer) => {
            const statements = answer.value.statements as string[];
            return (
              <div
                key={answer.members.id}
                className="bg-background rounded-2xl border border-card-border p-4"
              >
                <div className="flex items-center gap-2 mb-3">
                  <Avatar name={answer.members.name} size="sm" />
                  <span className="text-sm font-semibold">
                    {answer.members.name}
                  </span>
                </div>
                <div className="flex flex-col gap-2">
                  {statements.map((statement, i) => (
                    <button
                      key={i}
                      onClick={() => handleVote(answer.members.id, i)}
                      disabled={voting}
                      className="text-left px-4 py-2.5 rounded-xl border border-card-border hover:border-red-300 hover:bg-red-50 text-sm disabled:opacity-50 transition-colors"
                    >
                      {statement}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Voted members — show reveal */}
      {voted.length > 0 && (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-muted text-center font-medium">
            Auflösung
          </p>
          {voted.map((answer) => {
            const statements = answer.value.statements as string[];
            const lieIndex = answer.value.lie_index as number;
            const myVote = votes.find(
              (v) => v.target_member_id === answer.members.id
            );
            const gotIt = myVote?.voted_index === lieIndex;

            return (
              <div
                key={answer.members.id}
                className="bg-background rounded-2xl border border-card-border p-4"
              >
                <div className="flex items-center gap-2 mb-3">
                  <Avatar name={answer.members.name} size="sm" />
                  <span className="text-sm font-semibold">
                    {answer.members.name}
                  </span>
                  <span
                    className={`ml-auto text-xs font-bold px-2 py-0.5 rounded-full ${
                      gotIt
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {gotIt ? "Richtig!" : "Falsch"}
                  </span>
                </div>
                <div className="flex flex-col gap-2">
                  {statements.map((statement, i) => (
                    <div
                      key={i}
                      className={`px-4 py-2.5 rounded-xl text-sm border ${
                        i === lieIndex
                          ? "border-red-300 bg-red-50 text-red-700 font-medium"
                          : "border-green-200 bg-green-50 text-green-700"
                      }`}
                    >
                      {statement}
                      {i === lieIndex && (
                        <span className="ml-2 text-xs text-red-500">
                          — Lüge
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Leaderboard */}
      {rankedScores.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-sm text-muted text-center font-medium">
            Lügen-Detektor Rangliste
          </p>
          {rankedScores.map((score, i) => (
            <div
              key={i}
              className={`flex items-center gap-3 px-3 py-2 rounded-2xl ${
                i === 0 ? "bg-orange/10" : ""
              }`}
            >
              <span
                className={`text-sm font-bold w-6 text-center ${
                  i === 0 ? "text-orange" : "text-muted"
                }`}
              >
                {i === 0 ? "🏆" : `${i + 1}.`}
              </span>
              <Avatar name={score.name} size="sm" />
              <span className="text-sm font-medium flex-1">{score.name}</span>
              <span className="text-sm font-bold text-orange">
                {score.correct}/{score.total}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
