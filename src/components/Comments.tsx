"use client";

import { useState, useEffect, useRef } from "react";
import Avatar from "./Avatar";

interface Comment {
  id: string;
  text: string;
  created_at: string;
  members: { id: string; name: string };
}

interface CommentsProps {
  questionId: string;
  memberId: string;
  initialComments?: Comment[];
}

export default function Comments({ questionId, memberId, initialComments }: CommentsProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments || []);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!initialComments) fetchComments(); // Skip initial fetch if provided
    const interval = setInterval(fetchComments, 10000);
    return () => clearInterval(interval);
  }, [questionId]);

  async function fetchComments() {
    const res = await fetch(`/api/comments?question_id=${questionId}`);
    if (res.ok) {
      setComments(await res.json());
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!newComment.trim() || submitting) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question_id: questionId,
          member_id: memberId,
          text: newComment.trim(),
        }),
      });
      if (res.ok) {
        setNewComment("");
        await fetchComments();
        setTimeout(() => {
          bottomRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    } finally {
      setSubmitting(false);
    }
  }

  function formatTime(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / 86400000);

    const time = date.toLocaleTimeString("de-DE", {
      hour: "2-digit",
      minute: "2-digit",
    });

    if (diffDays === 0) return time;
    if (diffDays === 1) return `Gestern ${time}`;
    return `${date.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit" })} ${time}`;
  }

  return (
    <div className="mt-5 flex flex-col gap-3">
      {/* Comments list — always visible */}
      {comments.length > 0 && (
        <div className="flex flex-col gap-3">
          {comments.map((comment) => {
            const isOwn = comment.members.id === memberId;
            return (
              <div
                key={comment.id}
                className={`flex gap-2.5 ${isOwn ? "flex-row-reverse" : ""}`}
              >
                {!isOwn && (
                  <Avatar name={comment.members.name} size="sm" />
                )}
                <div
                  className={`max-w-[80%] ${
                    isOwn ? "items-end" : "items-start"
                  }`}
                >
                  {!isOwn && (
                    <span className="text-xs font-semibold text-muted mb-0.5 block">
                      {comment.members.name}
                    </span>
                  )}
                  <div
                    className={`rounded-2xl px-3.5 py-2.5 ${
                      isOwn
                        ? "bg-accent/15 rounded-tr-sm"
                        : "bg-background border border-card-border rounded-tl-sm"
                    }`}
                  >
                    <p className="text-sm break-words">{comment.text}</p>
                  </div>
                  <span
                    className={`text-[11px] text-muted mt-1 block ${
                      isOwn ? "text-right" : ""
                    }`}
                  >
                    {formatTime(comment.created_at)}
                  </span>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>
      )}

      {/* Input — always visible */}
      <form onSubmit={handleSubmit} className="flex gap-2 items-center">
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder={`Reagieren (${comments.length}/${comments.length})`}
          className="flex-1 h-11 rounded-full bg-background border border-card-border px-4 text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-accent"
        />
        <button
          type="submit"
          disabled={submitting || !newComment.trim()}
          className="w-11 h-11 rounded-full bg-accent text-white text-lg font-semibold disabled:opacity-30 flex items-center justify-center shrink-0"
        >
          ↑
        </button>
      </form>
    </div>
  );
}
