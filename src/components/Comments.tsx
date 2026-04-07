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
}

export default function Comments({ questionId, memberId }: CommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchComments();
  }, [questionId]);

  // Poll for new comments when expanded
  useEffect(() => {
    if (!expanded) return;
    const interval = setInterval(fetchComments, 10000);
    return () => clearInterval(interval);
  }, [expanded, questionId]);

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

  function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "gerade eben";
    if (mins < 60) return `vor ${mins}m`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `vor ${hours}h`;
    const days = Math.floor(hours / 24);
    return `vor ${days}d`;
  }

  return (
    <div className="mt-4 border-t border-card-border pt-3">
      {/* Toggle button */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-center gap-2 py-2 text-sm text-muted"
      >
        <span>💬</span>
        <span className="font-medium">
          {comments.length > 0
            ? `${comments.length} ${comments.length === 1 ? "Kommentar" : "Kommentare"}`
            : "Kommentieren"}
        </span>
        <span className="text-xs">{expanded ? "▲" : "▼"}</span>
      </button>

      {expanded && (
        <div className="mt-2 flex flex-col gap-3">
          {/* Comments list */}
          {comments.length > 0 && (
            <div className="flex flex-col gap-2.5 max-h-[300px] overflow-y-auto">
              {comments.map((comment) => (
                <div key={comment.id} className="flex gap-2.5">
                  <Avatar name={comment.members.name} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2">
                      <span className="text-sm font-semibold">
                        {comment.members.name}
                      </span>
                      <span className="text-xs text-muted">
                        {timeAgo(comment.created_at)}
                      </span>
                    </div>
                    <p className="text-sm mt-0.5 break-words">
                      {comment.text}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>
          )}

          {/* Input */}
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Kommentar schreiben..."
              className="flex-1 h-10 rounded-2xl bg-background border border-card-border px-4 text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-accent"
            />
            <button
              type="submit"
              disabled={submitting || !newComment.trim()}
              className="h-10 px-4 rounded-2xl bg-accent text-white text-sm font-semibold disabled:opacity-50"
            >
              {submitting ? "..." : "↑"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
