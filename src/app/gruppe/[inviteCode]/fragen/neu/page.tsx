"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { getMemberForGroup } from "@/lib/storage";

type QuestionType = "poll" | "text" | "scale";

export default function NeueFrage({
  params,
}: {
  params: Promise<{ inviteCode: string }>;
}) {
  const { inviteCode } = use(params);
  const router = useRouter();
  const [type, setType] = useState<QuestionType>("poll");
  const [text, setText] = useState("");
  const [pollOptions, setPollOptions] = useState<string[]>(["", ""]);
  const [pollUsesMembers, setPollUsesMembers] = useState(true);
  const [scaleMin, setScaleMin] = useState(1);
  const [scaleMax, setScaleMax] = useState(10);
  const [submitting, setSubmitting] = useState(false);
  const [groupId, setGroupId] = useState<string | null>(null);
  const [memberId, setMemberId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/groups/${inviteCode}`);
      if (!res.ok) return;
      const group = await res.json();
      setGroupId(group.id);

      const stored = getMemberForGroup(group.id);
      if (!stored) {
        router.push(`/gruppe/${inviteCode}`);
        return;
      }
      setMemberId(stored.memberId);
    }
    load();
  }, [inviteCode]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim() || !groupId) return;

    setSubmitting(true);

    let config: Record<string, unknown> = {};
    if (type === "poll") {
      if (pollUsesMembers) {
        config = { options_type: "members" };
      } else {
        config = { options: pollOptions.filter((o) => o.trim()) };
      }
    } else if (type === "scale") {
      config = { min: scaleMin, max: scaleMax };
    }

    try {
      const res = await fetch("/api/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          group_id: groupId,
          type,
          text: text.trim(),
          config,
          created_by: memberId,
        }),
      });

      if (res.ok) {
        router.push(`/gruppe/${inviteCode}/fragen`);
      }
    } finally {
      setSubmitting(false);
    }
  }

  const types: { key: QuestionType; label: string }[] = [
    { key: "poll", label: "Abstimmung" },
    { key: "text", label: "Freitext" },
    { key: "scale", label: "Skala" },
  ];

  return (
    <div className="flex flex-col flex-1 min-h-screen">
      <div className="bg-gradient-to-b from-accent to-accent-light px-6 pt-8 pb-12">
        <button
          onClick={() => router.push(`/gruppe/${inviteCode}/fragen`)}
          className="text-white/70 text-sm mb-4 hover:text-white"
        >
          &larr; Zurück
        </button>
        <h1 className="text-2xl font-bold text-white">Neue Frage</h1>
      </div>

      <div className="px-4 -mt-4 pb-8">
        <form
          onSubmit={handleSubmit}
          className="bg-card rounded-2xl border border-card-border p-5 shadow-sm flex flex-col gap-5"
        >
          {/* Type selector */}
          <div>
            <label className="text-sm text-muted mb-2 block">Fragetyp</label>
            <div className="flex gap-2">
              {types.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setType(t.key)}
                  className={`flex-1 py-2.5 rounded-2xl text-sm font-semibold border ${
                    type === t.key
                      ? "bg-accent text-white border-accent"
                      : "bg-background border-card-border text-muted"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Question text */}
          <div>
            <label className="text-sm text-muted mb-2 block">Frage</label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={
                type === "poll"
                  ? "z.B. Wer wird eher reich?"
                  : type === "text"
                    ? "z.B. Was ist deine peinlichste Geschichte?"
                    : "z.B. Wie gut kocht Tim?"
              }
              rows={2}
              className="w-full rounded-2xl bg-background border border-card-border px-4 py-3 text-foreground placeholder:text-muted focus:outline-none focus:border-accent resize-none"
            />
          </div>

          {/* Poll options */}
          {type === "poll" && (
            <div>
              <label className="text-sm text-muted mb-2 block">
                Antwortoptionen
              </label>
              <div className="flex gap-2 mb-3">
                <button
                  type="button"
                  onClick={() => setPollUsesMembers(true)}
                  className={`flex-1 py-2 rounded-2xl text-sm font-semibold border ${
                    pollUsesMembers
                      ? "bg-accent text-white border-accent"
                      : "bg-background border-card-border text-muted"
                  }`}
                >
                  Mitglieder
                </button>
                <button
                  type="button"
                  onClick={() => setPollUsesMembers(false)}
                  className={`flex-1 py-2 rounded-2xl text-sm font-semibold border ${
                    !pollUsesMembers
                      ? "bg-accent text-white border-accent"
                      : "bg-background border-card-border text-muted"
                  }`}
                >
                  Eigene Optionen
                </button>
              </div>

              {!pollUsesMembers && (
                <div className="flex flex-col gap-2">
                  {pollOptions.map((opt, i) => (
                    <input
                      key={i}
                      type="text"
                      placeholder={`Option ${i + 1}`}
                      value={opt}
                      onChange={(e) => {
                        const next = [...pollOptions];
                        next[i] = e.target.value;
                        setPollOptions(next);
                      }}
                      className="h-10 rounded-2xl bg-background border border-card-border px-4 text-foreground placeholder:text-muted focus:outline-none focus:border-accent"
                    />
                  ))}
                  <button
                    type="button"
                    onClick={() => setPollOptions([...pollOptions, ""])}
                    className="text-sm text-accent font-medium hover:text-accent-dark"
                  >
                    + Option hinzufügen
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Scale config */}
          {type === "scale" && (
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="text-sm text-muted mb-2 block">Min</label>
                <input
                  type="number"
                  value={scaleMin}
                  onChange={(e) => setScaleMin(Number(e.target.value))}
                  className="w-full h-10 rounded-2xl bg-background border border-card-border px-4 text-foreground focus:outline-none focus:border-accent"
                />
              </div>
              <div className="flex-1">
                <label className="text-sm text-muted mb-2 block">Max</label>
                <input
                  type="number"
                  value={scaleMax}
                  onChange={(e) => setScaleMax(Number(e.target.value))}
                  className="w-full h-10 rounded-2xl bg-background border border-card-border px-4 text-foreground focus:outline-none focus:border-accent"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting || !text.trim()}
            className="h-12 rounded-2xl bg-accent text-white font-semibold hover:bg-accent-dark disabled:opacity-50"
          >
            {submitting ? "Erstelle..." : "Frage hinzufügen"}
          </button>
        </form>
      </div>
    </div>
  );
}
