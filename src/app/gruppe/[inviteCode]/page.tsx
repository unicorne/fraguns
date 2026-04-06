"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { getMemberForGroup, storeMember, getStoredUser } from "@/lib/storage";
import QuestionCard from "@/components/QuestionCard";
import PushPermission from "@/components/PushPermission";
import { AvatarGroup } from "@/components/Avatar";
import Countdown from "@/components/Countdown";

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

    // Re-check for new questions when app becomes visible (e.g. after push notification)
    function onVisibilityChange() {
      if (document.visibilityState === "visible") {
        fetchGroup();
      }
    }
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => document.removeEventListener("visibilitychange", onVisibilityChange);
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

      const stored = getMemberForGroup(data.id);
      if (stored) {
        if (!stored.inviteCode) {
          storeMember({ ...stored, inviteCode });
        }
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
    const storedUser = getStoredUser();
    const nameToUse = storedUser?.username || memberName.trim();
    if (!nameToUse || !group) return;

    setJoining(true);
    try {
      const body: Record<string, string> = {
        name: nameToUse,
        group_id: group.id,
      };
      if (storedUser?.userId) {
        body.user_id = storedUser.userId;
      }

      const res = await fetch("/api/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const member = await res.json();
      if (!res.ok) throw new Error(member.error);

      storeMember({
        memberId: member.id,
        memberName: member.name,
        groupId: group.id,
        groupName: group.name,
        inviteCode,
      });

      setCurrentMember({ memberId: member.id, memberName: member.name });
      fetchGroup();
    } catch {
      // Error joining
    } finally {
      setJoining(false);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center min-h-screen">
        <div className="text-muted">Laden...</div>
      </div>
    );
  }

  if (!group) return null;

  // Join screen
  if (!currentMember) {
    return (
      <div className="flex flex-col flex-1 min-h-screen">
        <div className="bg-gradient-to-b from-accent to-accent-light px-6 pt-10 pb-12 text-center">
          <h1 className="text-2xl font-bold text-white">{group.name}</h1>
          <p className="text-white/70 text-sm mt-1">
            {group.members.length} Mitglieder
          </p>
          {group.members.length > 0 && (
            <div className="flex justify-center mt-4">
              <AvatarGroup
                names={group.members.map((m) => m.name)}
                max={6}
                size="md"
              />
            </div>
          )}
        </div>

        <div className="px-6 -mt-4">
          <div className="bg-card rounded-2xl border border-card-border p-5 shadow-sm">
            {(() => {
              const storedUser = getStoredUser();
              if (storedUser) {
                return (
                  <>
                    <p className="text-sm text-muted mb-4 text-center">
                      Beitreten als <span className="font-semibold text-foreground">@{storedUser.username}</span>
                    </p>
                    <form onSubmit={handleJoin}>
                      <button
                        type="submit"
                        disabled={joining}
                        className="w-full h-12 rounded-2xl bg-accent text-white font-semibold hover:bg-accent-dark disabled:opacity-50"
                      >
                        {joining ? "Beitreten..." : "Gruppe beitreten"}
                      </button>
                    </form>
                  </>
                );
              }
              return (
                <>
                  <p className="text-sm text-muted mb-4 text-center">
                    Tritt der Gruppe bei
                  </p>
                  <form onSubmit={handleJoin} className="flex flex-col gap-3">
                    <input
                      type="text"
                      placeholder="Dein Name"
                      value={memberName}
                      onChange={(e) => setMemberName(e.target.value)}
                      className="h-12 rounded-2xl bg-background border border-card-border px-4 text-foreground placeholder:text-muted focus:outline-none focus:border-accent"
                      autoFocus
                    />
                    <button
                      type="submit"
                      disabled={joining || !memberName.trim()}
                      className="h-12 rounded-2xl bg-accent text-white font-semibold hover:bg-accent-dark disabled:opacity-50"
                    >
                      {joining ? "Beitreten..." : "Gruppe beitreten"}
                    </button>
                  </form>
                </>
              );
            })()}
          </div>
        </div>
      </div>
    );
  }

  // Main group dashboard
  return (
    <div className="flex flex-col flex-1 min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-b from-accent to-accent-light px-6 pt-8 pb-16 text-center">
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={() => router.push("/")}
            className="text-white bg-white/20 text-sm font-semibold px-3 py-1.5 rounded-xl hover:bg-white/30"
          >
            &larr;
          </button>
          <h1 className="text-lg font-bold text-white">{group.name}</h1>
          <button
            onClick={() => setShowInvite(!showInvite)}
            className="text-white bg-white/20 text-sm font-semibold px-3 py-1.5 rounded-xl hover:bg-white/30"
          >
            Einladen
          </button>
        </div>

        <div className="flex justify-center mb-3">
          <AvatarGroup
            names={group.members.map((m) => m.name)}
            max={5}
            size="sm"
          />
        </div>

        {activeQuestion ? (
          <>
            <h2 className="text-xl font-bold text-white leading-snug px-2">
              {activeQuestion.text}
            </h2>
            <div className="mt-3">
              <Countdown />
            </div>
          </>
        ) : (
          <>
            <h2 className="text-lg text-white/80 mt-4">
              Heute keine Frage aktiv
            </h2>
            <div className="mt-3">
              <Countdown />
            </div>
          </>
        )}
      </div>

      {/* Invite bar */}
      {showInvite && (
        <div className="mx-4 -mt-4 mb-4 p-4 rounded-2xl bg-card border border-card-border shadow-md z-20 relative">
          <p className="text-xs text-muted mb-2">Einladungscode:</p>
          <div className="flex gap-2 items-center">
            <span className="flex-1 text-lg font-bold tracking-widest text-foreground text-center">
              {group.invite_code}
            </span>
            <button
              onClick={() => {
                navigator.clipboard.writeText(group.invite_code);
              }}
              className="text-sm px-4 py-2 rounded-xl bg-accent text-white font-semibold"
            >
              Kopieren
            </button>
          </div>
        </div>
      )}

      {/* Content area */}
      <main className="flex-1 px-4 -mt-8 pb-20 relative z-10">
        {activeQuestion ? (
          <QuestionCard
            question={activeQuestion}
            groupId={group.id}
            memberId={currentMember.memberId}
            members={group.members}
            inviteCode={inviteCode}
          />
        ) : (
          <div className="bg-card rounded-2xl border border-card-border p-6 text-center shadow-sm">
            <p className="text-muted">Keine aktive Frage</p>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-3 mt-4">
          <button
            onClick={() => router.push(`/gruppe/${inviteCode}/fragen/neu`)}
            className="flex-1 h-11 rounded-2xl bg-accent text-white font-semibold hover:bg-accent-dark active:scale-[0.98]"
          >
            + Neue Frage
          </button>
          <button
            onClick={() => router.push(`/gruppe/${inviteCode}/verlauf`)}
            className="h-11 px-5 rounded-2xl bg-card border border-card-border text-foreground font-semibold hover:border-accent active:scale-[0.98]"
          >
            Verlauf
          </button>
        </div>

        {/* Push notification prompt */}
        <PushPermission memberId={currentMember.memberId} />

        {/* Test: manually trigger next question */}
        <button
          onClick={async () => {
            await fetch("/api/cron/daily", {
              headers: { Authorization: `Bearer ${process.env.NEXT_PUBLIC_CRON_SECRET}` },
            });
            window.location.reload();
          }}
          className="w-full h-9 rounded-2xl bg-orange/20 text-orange text-xs font-semibold mt-4 active:scale-[0.98]"
        >
          Test: Nächste Frage aktivieren
        </button>
      </main>
    </div>
  );
}
