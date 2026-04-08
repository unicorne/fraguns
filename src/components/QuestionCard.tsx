"use client";

import { useEffect, useState } from "react";
import PollAnswer from "./answers/PollAnswer";
import TextAnswer from "./answers/TextAnswer";
import ScaleAnswer from "./answers/ScaleAnswer";
import EstimateAnswer from "./answers/EstimateAnswer";
import TimelineAnswer from "./answers/TimelineAnswer";
import TwoTruthsOneLieAnswer from "./answers/TwoTruthsOneLieAnswer";
import PollResults from "./results/PollResults";
import TextResults from "./results/TextResults";
import ScaleResults from "./results/ScaleResults";
import EstimateResults from "./results/EstimateResults";
import TimelineResults from "./results/TimelineResults";
import TwoTruthsOneLieResults from "./results/TwoTruthsOneLieResults";
import TeamSplitAnswer from "./answers/TeamSplitAnswer";
import TeamSplitResults from "./results/TeamSplitResults";
import RankingAnswer from "./answers/RankingAnswer";
import RankingResults from "./results/RankingResults";
import QuestionRating from "./QuestionRating";
import { CardSkeleton } from "./LoadingSpinner";
import Comments from "./Comments";

interface Answer {
  value: Record<string, unknown>;
  members: { id: string; name: string };
}

interface Comment {
  id: string;
  text: string;
  created_at: string;
  members: { id: string; name: string };
}

interface ResultsData {
  revealed: boolean;
  answers?: Answer[];
  answered?: string[];
  total?: number;
  comments?: Comment[];
  myRating?: number | null;
  question: {
    id: string;
    text: string;
    type: string;
    config: Record<string, unknown>;
  };
}

interface QuestionCardProps {
  question: {
    id: string;
    text: string;
    type: string;
    config: Record<string, unknown>;
  };
  groupId: string;
  memberId: string;
  members: { id: string; name: string }[];
  inviteCode: string;
}

export default function QuestionCard({
  question,
  groupId,
  memberId,
  members,
  inviteCode,
}: QuestionCardProps) {
  const [results, setResults] = useState<ResultsData | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkResults();
  }, [question.id, memberId]);

  async function checkResults() {
    try {
      const res = await fetch(
        `/api/questions/${question.id}/results?member_id=${memberId}`
      );
      if (res.ok) {
        setResults(await res.json());
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleAnswer(value: Record<string, unknown>) {
    setSubmitting(true);
    try {
      const res = await fetch("/api/answers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question_id: question.id,
          member_id: memberId,
          value,
        }),
      });
      if (res.ok) {
        await checkResults();
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <CardSkeleton />;
  }

  // Already answered — show results
  if (results?.revealed) {
    return (
      <div className="bg-card rounded-2xl border border-card-border p-5 shadow-sm">
        <p className="text-sm text-muted mb-4 text-center">
          {results.answers?.length || 0} von {results.total} haben geantwortet
        </p>

        {question.type === "poll" && (
          <PollResults
            answers={results.answers || []}
            config={question.config}
            groupMembers={members}
          />
        )}
        {question.type === "text" && (
          <TextResults answers={results.answers || []} />
        )}
        {question.type === "scale" && (
          <ScaleResults
            answers={results.answers || []}
            config={question.config}
          />
        )}
        {question.type === "estimate" && (
          <EstimateResults
            answers={results.answers || []}
            config={question.config}
          />
        )}
        {question.type === "timeline" && (
          <TimelineResults answers={results.answers || []} />
        )}
        {question.type === "two_truths_one_lie" && (
          <TwoTruthsOneLieResults
            answers={results.answers || []}
            questionId={question.id}
            memberId={memberId}
          />
        )}
        {question.type === "team_split" && (
          <TeamSplitResults
            answers={results.answers || []}
            config={question.config}
            groupMembers={members}
          />
        )}
        {question.type === "ranking" && (
          <RankingResults
            answers={results.answers || []}
            groupMembers={members}
          />
        )}

        <QuestionRating questionId={question.id} memberId={memberId} initialRating={results.myRating ?? null} />
        <Comments questionId={question.id} memberId={memberId} initialComments={results.comments} />
      </div>
    );
  }

  // Not yet answered — show answer form
  return (
    <div className="bg-card rounded-2xl border border-card-border p-5 shadow-sm">
      {question.type === "poll" && (
        <PollAnswer
          config={question.config}
          members={members}
          onAnswer={handleAnswer}
          submitting={submitting}
        />
      )}
      {question.type === "text" && (
        <TextAnswer onAnswer={handleAnswer} submitting={submitting} />
      )}
      {question.type === "scale" && (
        <ScaleAnswer
          config={question.config}
          onAnswer={handleAnswer}
          submitting={submitting}
        />
      )}
      {question.type === "estimate" && (
        <EstimateAnswer
          config={question.config}
          onAnswer={handleAnswer}
          submitting={submitting}
        />
      )}
      {question.type === "timeline" && (
        <TimelineAnswer
          onAnswer={handleAnswer}
          submitting={submitting}
        />
      )}
      {question.type === "two_truths_one_lie" && (
        <TwoTruthsOneLieAnswer
          onAnswer={handleAnswer}
          submitting={submitting}
        />
      )}
      {question.type === "team_split" && (
        <TeamSplitAnswer
          config={question.config}
          members={members}
          onAnswer={handleAnswer}
          submitting={submitting}
        />
      )}
      {question.type === "ranking" && (
        <RankingAnswer
          members={members}
          onAnswer={handleAnswer}
          submitting={submitting}
        />
      )}
    </div>
  );
}
