"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { getMemberForGroup } from "@/lib/storage";
import Avatar from "@/components/Avatar";

type QuestionType = "poll" | "text" | "scale" | "estimate" | "timeline" | "two_truths_one_lie" | "team_split" | "ranking";

interface Member {
  id: string;
  name: string;
}

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
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [scaleMin, setScaleMin] = useState(1);
  const [scaleMax, setScaleMax] = useState(10);
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [unit, setUnit] = useState("");
  const [teamLabel1, setTeamLabel1] = useState("");
  const [teamLabel2, setTeamLabel2] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [groupId, setGroupId] = useState<string | null>(null);
  const [memberId, setMemberId] = useState<string | null>(null);
  const [groupName, setGroupName] = useState("");

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/groups/${inviteCode}`);
      if (!res.ok) return;
      const group = await res.json();
      setGroupId(group.id);
      setGroupName(group.name);
      setMembers(group.members || []);
      // All members selected by default
      setSelectedMembers((group.members || []).map((m: Member) => m.id));

      const stored = getMemberForGroup(group.id);
      if (!stored) {
        router.push(`/gruppe/${inviteCode}`);
        return;
      }
      setMemberId(stored.memberId);
    }
    load();
  }, [inviteCode]);

  function toggleMember(id: string) {
    setSelectedMembers((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim() || !groupId) return;

    setSubmitting(true);

    let config: Record<string, unknown> = {};
    if (type === "poll") {
      if (pollUsesMembers) {
        config = {
          options_type: "members",
          options: selectedMembers,
        };
      } else {
        config = { options: pollOptions.filter((o) => o.trim()) };
      }
    } else if (type === "scale") {
      config = { min: scaleMin, max: scaleMax };
    } else if (type === "estimate") {
      config = { correct_answer: Number(correctAnswer), unit: unit || undefined };
    } else if (type === "team_split") {
      config = { team_labels: [teamLabel1.trim(), teamLabel2.trim()] };
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
        router.push(`/gruppe/${inviteCode}`);
      }
    } finally {
      setSubmitting(false);
    }
  }

  const types: { key: QuestionType; label: string }[] = [
    { key: "poll", label: "Abstimmung" },
    { key: "text", label: "Freitext" },
    { key: "scale", label: "Skala" },
    { key: "estimate", label: "Schätzfrage" },
    { key: "team_split", label: "Team-Aufteilung" },
    { key: "ranking", label: "Ranking" },
  ];

  return (
    <div className="flex flex-col flex-1 min-h-screen">
      <div className="bg-gradient-to-b from-accent to-accent-light px-6 pt-8 pb-12">
        <button
          onClick={() => router.push(`/gruppe/${inviteCode}`)}
          className="text-white bg-white/20 text-sm font-semibold px-3 py-1.5 rounded-xl hover:bg-white/30 mb-4"
        >
          &larr; {groupName || "Zurück"}
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
            <div className="grid grid-cols-3 gap-2">
              {types.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setType(t.key)}
                  className={`py-2.5 rounded-2xl text-xs font-semibold border ${
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
                    : type === "scale"
                      ? "z.B. Wie gut kocht Tim?"
                      : type === "estimate"
                        ? "z.B. Wie viele Länder habe ich besucht?"
                        : type === "team_split"
                          ? "z.B. Wer hat Rizz und wer hat Anti-Rizz?"
                          : type === "ranking"
                            ? "z.B. Sortiert die Gruppe nach Tanzskills"
                            : type === "timeline"
                              ? "z.B. Wann hattest du deinen ersten Kuss?"
                              : "z.B. Erzähle 2 Wahrheiten und 1 Lüge über dich!"
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

              {pollUsesMembers && (
                <div className="flex flex-col gap-2">
                  {members.map((m) => {
                    const selected = selectedMembers.includes(m.id);
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => toggleMember(m.id)}
                        className={`flex items-center gap-3 py-2.5 px-3 rounded-2xl border ${
                          selected
                            ? "border-accent bg-accent/10"
                            : "border-card-border bg-background opacity-50"
                        }`}
                      >
                        <Avatar name={m.name} size="sm" />
                        <span className="text-sm font-medium flex-1 text-left">
                          {m.name}
                        </span>
                        <div
                          className={`w-5 h-5 rounded-md border-2 flex items-center justify-center ${
                            selected
                              ? "bg-accent border-accent"
                              : "border-card-border"
                          }`}
                        >
                          {selected && (
                            <span className="text-white text-xs">✓</span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                  <p className="text-xs text-muted text-center mt-1">
                    {selectedMembers.length} von {members.length} ausgewählt
                  </p>
                </div>
              )}

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

          {/* Estimate config */}
          {type === "estimate" && (
            <div className="flex flex-col gap-3">
              <div>
                <label className="text-sm text-muted mb-2 block">
                  Richtige Antwort
                </label>
                <input
                  type="number"
                  value={correctAnswer}
                  onChange={(e) => setCorrectAnswer(e.target.value)}
                  placeholder="z.B. 12"
                  className="w-full h-10 rounded-2xl bg-background border border-card-border px-4 text-foreground placeholder:text-muted focus:outline-none focus:border-accent"
                />
              </div>
              <div>
                <label className="text-sm text-muted mb-2 block">
                  Einheit (optional)
                </label>
                <input
                  type="text"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  placeholder="z.B. Länder, km, Stunden"
                  className="w-full h-10 rounded-2xl bg-background border border-card-border px-4 text-foreground placeholder:text-muted focus:outline-none focus:border-accent"
                />
              </div>
            </div>
          )}

          {/* Team Split config */}
          {type === "team_split" && (
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="text-sm text-muted mb-2 block">Team 1</label>
                <input
                  type="text"
                  value={teamLabel1}
                  onChange={(e) => setTeamLabel1(e.target.value)}
                  placeholder="z.B. Rizz-Lord"
                  className="w-full h-10 rounded-2xl bg-background border border-card-border px-4 text-foreground placeholder:text-muted focus:outline-none focus:border-accent"
                />
              </div>
              <div className="flex-1">
                <label className="text-sm text-muted mb-2 block">Team 2</label>
                <input
                  type="text"
                  value={teamLabel2}
                  onChange={(e) => setTeamLabel2(e.target.value)}
                  placeholder="z.B. Anti-Rizz"
                  className="w-full h-10 rounded-2xl bg-background border border-card-border px-4 text-foreground placeholder:text-muted focus:outline-none focus:border-accent"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={
              submitting ||
              !text.trim() ||
              (type === "poll" && pollUsesMembers && selectedMembers.length < 2) ||
              (type === "estimate" && correctAnswer === "") ||
              (type === "team_split" && (!teamLabel1.trim() || !teamLabel2.trim()))
            }
            className="h-12 rounded-2xl bg-accent text-white font-semibold hover:bg-accent-dark disabled:opacity-50"
          >
            {submitting ? "Erstelle..." : "Frage hinzufügen"}
          </button>
        </form>
      </div>
    </div>
  );
}
