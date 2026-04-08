"use client";

import { useState, useEffect } from "react";

interface QuestionRatingProps {
  questionId: string;
  memberId: string;
  initialRating?: number | null;
}

export default function QuestionRating({
  questionId,
  memberId,
  initialRating,
}: QuestionRatingProps) {
  const [myRating, setMyRating] = useState<number | null>(initialRating ?? null);

  useEffect(() => {
    if (initialRating !== undefined) return; // Skip fetch if provided
    fetch(
      `/api/ratings?question_id=${questionId}&member_id=${memberId}`
    )
      .then((r) => r.json())
      .then((d) => setMyRating(d.myRating));
  }, [questionId, memberId, initialRating]);

  async function rate(rating: number) {
    // Toggle off if same rating
    const newRating = myRating === rating ? null : rating;

    if (newRating === null) {
      // No API for delete yet, just toggle visually
      setMyRating(null);
      return;
    }

    setMyRating(newRating);
    await fetch("/api/ratings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question_id: questionId,
        member_id: memberId,
        rating: newRating,
      }),
    });
  }

  return (
    <div className="flex items-center gap-1 mt-3 justify-center">
      <button
        onClick={() => rate(1)}
        className={`w-9 h-9 rounded-xl text-base flex items-center justify-center ${
          myRating === 1
            ? "bg-accent/20 text-accent"
            : "bg-background text-muted"
        }`}
      >
        👍
      </button>
      <button
        onClick={() => rate(-1)}
        className={`w-9 h-9 rounded-xl text-base flex items-center justify-center ${
          myRating === -1
            ? "bg-red-500/20 text-red-500"
            : "bg-background text-muted"
        }`}
      >
        👎
      </button>
    </div>
  );
}
