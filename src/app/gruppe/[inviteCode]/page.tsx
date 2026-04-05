"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { getMemberForGroup, storeMember } from "@/lib/storage";
import Navigation from "@/components/Navigation";
import QuestionCard from "@/components/QuestionCard";

interface Member {
  id: string;
  name: string;
}

interface Question {
  id: string;
  text: string;
  type: string;
  config: Record<string, unknown>;
  is_active: boolean;
  scheduled_date: string | null;
  answers: { count: number }[];
}

interface Group {
  id: string;
  name: string;
  invite_code: string;
  members: Member[];
}

export default function GruppePage({
  params,
}: {
  params: Promise<{ inviteCode: string }>;
}) {
  const { inviteCode } = use(params);
  const router = useRouter();
  const [group, setGroup] = useState<Group | null>(null);
  const [memberName, setMemberName] = useState("");
  const [joining, setJoining] = useState(false);
  const [currentMember, setCurrentMember] = useState<{
    memberId: string;
    memberName: string;
  } | null>(null);
  const [activeQuestion, setActiveQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);

  useEffect(() => {
    fetchGroup();
  }, [inviteCode]);

  async function fetchGroup() {
    try {
      const res = await fetch(`/api/groups/${inviteCode}`);
      if (!res.ok) {
        router.push("/");
        return;
      }
      const data = await res.json();
      setGroup(data);

      // Check if user is already a member
      const stored = getMemberForGroup(data.id);
      if (stored) {
        setCurrentMember({
          memberId: stored.memberId,
          memberName: stored.memberName,
        });
        fetchActiveQuestion(data.id);
      }
    } catch {
      router.push("/");
    } finally {
      setLoading(false);
    }
  }

  async function fetchActiveQuestion(groupId: string) {
    const res = await fetch(`/api/questions?group_id=${groupId}`);
    if (res.ok) {
      const questions = await res.json();
      const active = questions.find((q: Question) => q.is_active);
      setActiveQuestion(active || null);
    }
  }

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    if (!memberName.trim() || !group) return;

    setJoining(true);
    try {
      const res = await fetch("/api/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: memberName.trim(), group_id: group.id }),
      });
      const member = await res.json();
      if (!res.ok) throw new Error(member.error);

      storeMember({
        memberId: member.id,
        memberName: member.name,
        groupId: group.id,
        groupName: group.name,
      });

      setCurrentMember({ memberId: member.id, memberName: member.name });
      // Refresh group to get updated member list
      fetchGroup();
    } catch {
      // Error joining
    } finally {
      setJoining(false);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="text-muted">Laden...</div>
      </div>
    );
  }

  if (!group) return null;

  // Join screen if not a member
  if (!currentMember) {
    return (
      <div className="flex flex-col flex-1 items-center justify-center px-6">
        <div className="w-full max-w-sm flex flex-col items-center gap-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold">{group.name}</h1>
            <p className="text-muted text-sm mt-1">
              {group.members.length} Mitglieder
            </p>
          </div>

          <div className="w-full bg-card rounded-xl border border-card-border p-4">
            <p className="text-sm text-muted mb-3">Mitglieder:</p>
            <div className="flex flex-wrap gap-2">
              {group.members.map((m) => (
                <span
                  key={m.id}
                  className="px-3 py-1 rounded-full bg-background text-sm"
                >
                  {m.name}
                </span>
              ))}
              {group.members.length === 0 && (
                <span className="text-muted text-sm">
                  Noch keine Mitglieder
                </span>
              )}
            </div>
          </div>

          <form onSubmit={handleJoin} className="w-full flex flex-col gap-3">
            <input
              type="text"
              placeholder="Dein Name"
              value={memberName}
              onChange={(e) => setMemberName(e.target.value)}
              className="h-12 rounded-xl bg-card border border-card-border px-4 text-foreground placeholder:text-muted focus:outline-none focus:border-accent"
              autoFocus
            />
            <button
              type="submit"
              disabled={joining || !memberName.trim()}
              className="h-12 rounded-xl bg-accent text-white font-medium hover:bg-accent-light disabled:opacity-50"
            >
              {joining ? "Beitreten..." : "Gruppe beitreten"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Main group dashboard
  return (
    <div className="flex flex-col flex-1">
      <header className="px-6 pt-6 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">{group.name}</h1>
            <p className="text-muted text-xs">
              Hallo, {currentMember.memberName}
            </p>
          </div>
          <button
            onClick={() => setShowInvite(!showInvite)}
            className="text-xs px-3 py-1.5 rounded-lg bg-card border border-card-border text-muted hover:text-foreground"
          >
            Einladen
          </button>
        </div>

        {showInvite && (
          <div className="mt-3 p-3 rounded-xl bg-card border border-card-border">
            <p className="text-xs text-muted mb-2">Einladungslink:</p>
            <div className="flex gap-2">
              <input
                readOnly
                value={`${typeof window !== "undefined" ? window.location.origin : ""}/gruppe/${group.invite_code}`}
                className="flex-1 text-xs bg-background rounded-lg px-3 py-2 text-foreground"
              />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(
                    `${window.location.origin}/gruppe/${group.invite_code}`
                  );
                }}
                className="text-xs px-3 py-2 rounded-lg bg-accent text-white"
              >
                Kopieren
              </button>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1 px-6 pb-24">
        <h2 className="text-sm font-medium text-muted mb-3">
          Heutige Frage
        </h2>

        {activeQuestion ? (
          <QuestionCard
            question={activeQuestion}
            groupId={group.id}
            memberId={currentMember.memberId}
            members={group.members}
            inviteCode={inviteCode}
          />
        ) : (
          <div className="bg-card rounded-xl border border-card-border p-6 text-center">
            <p className="text-muted">Heute keine Frage aktiv</p>
            <button
              onClick={() => router.push(`/gruppe/${inviteCode}/fragen/neu`)}
              className="mt-3 text-sm text-accent hover:text-accent-light"
            >
              Frage vorschlagen
            </button>
          </div>
        )}
      </main>

      <Navigation inviteCode={inviteCode} active="heute" />
    </div>
  );
}
