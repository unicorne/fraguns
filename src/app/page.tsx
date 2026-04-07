"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getStoredUser,
  storeUser,
  getAllGroups,
  setAllMembers,
  MemberInfo,
  UserInfo,
} from "@/lib/storage";
import { AvatarGroup } from "@/components/Avatar";
import InitialPushPrompt from "@/components/InitialPushPrompt";
import { FullPageSpinner } from "@/components/LoadingSpinner";

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [groups, setGroups] = useState<MemberInfo[]>([]);
  const [groupStatus, setGroupStatus] = useState<
    Record<string, boolean>
  >({});
  const [username, setUsername] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [mode, setMode] = useState<"loading" | "register" | "push-prompt" | "dashboard">(
    "loading"
  );
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [isLogin, setIsLogin] = useState(false);

  useEffect(() => {
    const stored = getStoredUser();
    if (stored) {
      setUser(stored);
      setGroups(getAllGroups());
      setMode("dashboard");
      fetchGroupStatus(stored.userId);
    } else {
      setMode("register");
    }
  }, []);

  async function fetchGroupStatus(userId: string) {
    try {
      const res = await fetch(`/api/users/groups?user_id=${userId}`);
      if (res.ok) {
        const data = await res.json();
        const status: Record<string, boolean> = {};
        const serverGroups: MemberInfo[] = [];
        for (const g of data) {
          status[g.groupId] = g.hasUnanswered;
          serverGroups.push({
            memberId: g.memberId,
            memberName: g.memberName,
            groupId: g.groupId,
            groupName: g.groupName,
            inviteCode: g.inviteCode,
          });
        }
        setGroupStatus(status);
        // Sync localStorage with server data
        setAllMembers(serverGroups);
        setGroups(serverGroups);
      }
    } catch {
      // Silent fail — use localStorage as fallback
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (!username.trim()) return;
    setSubmitting(true);
    setError("");

    try {
      if (isLogin) {
        // Login: look up existing user
        const res = await fetch(
          `/api/users?username=${encodeURIComponent(username.trim())}`
        );
        const data = await res.json();
        if (!res.ok) {
          setError(
            res.status === 404
              ? "Benutzername nicht gefunden"
              : data.error
          );
          return;
        }

        storeUser({ userId: data.user.id, username: data.user.username });
        setUser({ userId: data.user.id, username: data.user.username });

        // Restore group memberships
        const memberships: MemberInfo[] = (data.memberships || []).map(
          (m: {
            id: string;
            name: string;
            groups: { id: string; name: string; invite_code: string };
          }) => ({
            memberId: m.id,
            memberName: m.name,
            groupId: m.groups.id,
            groupName: m.groups.name,
            inviteCode: m.groups.invite_code,
          })
        );
        setAllMembers(memberships);
        setGroups(memberships);
        showPushOrDashboard();
      } else {
        // Register: create new user
        const res = await fetch("/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: username.trim() }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error);
          return;
        }

        storeUser({ userId: data.id, username: data.username });
        setUser({ userId: data.id, username: data.username });
        showPushOrDashboard();
      }
    } catch {
      setError("Verbindungsfehler");
    } finally {
      setSubmitting(false);
    }
  }

  function showPushOrDashboard() {
    const alreadyPrompted = typeof window !== "undefined" && localStorage.getItem("fraguns_push_prompted");
    if (!alreadyPrompted) {
      setMode("push-prompt");
    } else {
      setMode("dashboard");
    }
  }

  if (mode === "loading") {
    return <FullPageSpinner />;
  }

  // Push notification prompt (shown after registration)
  if (mode === "push-prompt") {
    return (
      <>
        <InitialPushPrompt onDone={() => setMode("dashboard")} />
        <div className="flex flex-1 items-center justify-center min-h-screen">
          <div className="text-muted">...</div>
        </div>
      </>
    );
  }

  // Username registration / login
  if (mode === "register") {
    return (
      <div className="flex flex-col flex-1 min-h-screen">
        <div className="bg-gradient-to-b from-accent to-accent-light px-6 pt-16 pb-12 text-center">
          <h1 className="text-4xl font-bold text-white tracking-tight">
            FragUns
          </h1>
          <p className="mt-2 text-white/70 text-sm">
            Tägliche Fragen für deine Freundesgruppe
          </p>
        </div>

        <div className="px-6 -mt-4">
          <form
            onSubmit={handleRegister}
            className="bg-card rounded-2xl border border-card-border p-5 shadow-sm flex flex-col gap-4"
          >
            <h2 className="text-lg font-semibold text-center">
              {isLogin ? "Anmelden" : "Benutzername wählen"}
            </h2>
            <p className="text-sm text-muted text-center">
              {isLogin
                ? "Gib deinen Benutzernamen ein um dich anzumelden"
                : "Wähle einen einzigartigen Benutzernamen"}
            </p>

            <input
              type="text"
              placeholder="Benutzername"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="h-12 rounded-2xl bg-background border border-card-border px-4 text-foreground placeholder:text-muted focus:outline-none focus:border-accent"
              autoFocus
            />

            {error && <p className="text-red-500 text-sm text-center">{error}</p>}

            <button
              type="submit"
              disabled={submitting || !username.trim()}
              className="h-12 rounded-2xl bg-accent text-white font-semibold hover:bg-accent-dark disabled:opacity-50"
            >
              {submitting
                ? "..."
                : isLogin
                  ? "Anmelden"
                  : "Registrieren"}
            </button>

            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError("");
              }}
              className="text-sm text-accent font-medium"
            >
              {isLogin
                ? "Noch kein Account? Registrieren"
                : "Bereits registriert? Anmelden"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Dashboard
  return (
    <div className="flex flex-col flex-1 min-h-screen">
      <div className="bg-gradient-to-b from-accent to-accent-light px-6 pt-10 pb-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white tracking-tight">
            FragUns
          </h1>
          <button
            onClick={() => router.push("/einstellungen")}
            className="text-white bg-white/20 text-sm font-semibold px-3 py-1.5 rounded-xl hover:bg-white/30"
          >
            @{user?.username}
          </button>
        </div>
      </div>

      <div className="flex-1 px-4 -mt-4">
        {/* Groups list */}
        {groups.length > 0 && (
          <div className="flex flex-col gap-3 mb-6">
            {groups.map((g) => (
              <button
                key={g.groupId}
                onClick={() => router.push(`/gruppe/${g.inviteCode}`)}
                className="w-full bg-card rounded-2xl border border-card-border p-4 text-left shadow-sm active:scale-[0.98] relative"
              >
                <div className="flex items-center gap-3">
                  <AvatarGroup names={[g.memberName]} size="md" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground truncate">
                      {g.groupName}
                    </p>
                    <p className="text-xs text-muted mt-0.5">
                      als {g.memberName}
                    </p>
                  </div>
                  {groupStatus[g.groupId] && (
                    <span className="w-3 h-3 rounded-full bg-orange shrink-0" />
                  )}
                </div>
              </button>
            ))}
          </div>
        )}

        {groups.length === 0 && (
          <div className="bg-card rounded-2xl border border-card-border p-6 text-center shadow-sm mb-6">
            <p className="text-muted">Noch keine Gruppen</p>
            <p className="text-muted text-sm mt-1">
              Erstelle eine Gruppe oder tritt einer bei
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <button
            onClick={() => router.push("/gruppe/erstellen")}
            className="w-full h-12 rounded-2xl bg-accent text-white font-semibold shadow-sm hover:bg-accent-dark active:scale-[0.98]"
          >
            Neue Gruppe erstellen
          </button>

          <div className="flex items-center gap-3 text-muted text-xs my-1">
            <div className="flex-1 h-px bg-card-border" />
            <span>oder beitreten</span>
            <div className="flex-1 h-px bg-card-border" />
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (inviteCode.trim()) {
                router.push(`/gruppe/${inviteCode.trim()}`);
              }
            }}
            className="flex gap-2"
          >
            <input
              type="text"
              placeholder="Einladungscode"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              className="flex-1 h-12 rounded-2xl bg-card border border-card-border px-4 text-foreground placeholder:text-muted focus:outline-none focus:border-accent shadow-sm"
            />
            <button
              type="submit"
              className="h-12 px-5 rounded-2xl bg-card border border-card-border text-foreground font-semibold hover:border-accent shadow-sm"
            >
              Los
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
