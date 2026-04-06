"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getStoredUser, storeUser, setAllMembers } from "@/lib/storage";
import Avatar, { AvatarData } from "@/components/Avatar";

export default function Einstellungen() {
  const router = useRouter();
  const [user, setUser] = useState<{ userId: string; username: string } | null>(
    null
  );
  const [avatarData, setAvatarData] = useState<AvatarData>({});
  const [newName, setNewName] = useState("");
  const [editingName, setEditingName] = useState(false);
  const [renameError, setRenameError] = useState("");
  const [renaming, setRenaming] = useState(false);
  const [pushStatus, setPushStatus] = useState<
    "loading" | "unsupported" | "needs-pwa" | "denied" | "off" | "on"
  >("loading");

  useEffect(() => {
    const stored = getStoredUser();
    if (!stored) {
      router.push("/");
      return;
    }
    setUser(stored);

    // Fetch avatar
    fetch(`/api/users?username=${encodeURIComponent(stored.username)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.user) {
          setAvatarData({
            avatar_type: data.user.avatar_type,
            avatar_url: data.user.avatar_url,
          });
        }
      });

    // Check push status
    checkPushStatus();
  }, []);

  async function checkPushStatus() {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      const isIOS = /iPhone|iPad/.test(navigator.userAgent);
      const isStandalone =
        window.matchMedia("(display-mode: standalone)").matches ||
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (navigator as any).standalone === true;
      if (isIOS && !isStandalone) {
        setPushStatus("needs-pwa");
      } else {
        setPushStatus("unsupported");
      }
      return;
    }

    if (Notification.permission === "denied") {
      setPushStatus("denied");
      return;
    }

    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    setPushStatus(sub ? "on" : "off");
  }

  async function enablePush() {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      setPushStatus("denied");
      return;
    }

    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(
        process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
      ) as BufferSource,
    });

    // Save subscription for all groups this user is in
    const stored = getStoredUser();
    if (stored) {
      const res = await fetch(
        `/api/users?username=${encodeURIComponent(stored.username)}`
      );
      const data = await res.json();
      if (data.memberships) {
        await Promise.all(
          data.memberships.map((m: { id: string }) =>
            fetch("/api/push/subscribe", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                member_id: m.id,
                subscription: sub.toJSON(),
              }),
            })
          )
        );
      }
    }

    setPushStatus("on");
  }

  async function disablePush() {
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    if (sub) {
      await sub.unsubscribe();
    }
    setPushStatus("off");
  }

  async function handleRename(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim() || !user) return;
    setRenaming(true);
    setRenameError("");

    try {
      const res = await fetch("/api/users/rename", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: user.userId, new_username: newName }),
      });
      const data = await res.json();
      if (!res.ok) {
        setRenameError(data.error);
        return;
      }

      // Update localStorage
      storeUser({ userId: user.userId, username: data.username });
      setUser({ userId: user.userId, username: data.username });

      // Refresh memberships in localStorage
      const groupsRes = await fetch(
        `/api/users?username=${encodeURIComponent(data.username)}`
      );
      const groupsData = await groupsRes.json();
      if (groupsData.memberships) {
        setAllMembers(
          groupsData.memberships.map(
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
          )
        );
      }

      setEditingName(false);
      setNewName("");
    } catch {
      setRenameError("Verbindungsfehler");
    } finally {
      setRenaming(false);
    }
  }

  if (!user) return null;

  return (
    <div className="flex flex-col flex-1 min-h-screen">
      <div className="bg-gradient-to-b from-accent to-accent-light px-6 pt-8 pb-12">
        <button
          onClick={() => router.push("/")}
          className="text-white bg-white/20 text-sm font-semibold px-3 py-1.5 rounded-xl hover:bg-white/30 mb-4"
        >
          &larr; Zurück
        </button>
        <h1 className="text-xl font-bold text-white">Einstellungen</h1>
      </div>

      <div className="px-4 -mt-4 pb-8 flex flex-col gap-4">
        {/* Profile picture */}
        <button
          onClick={() => router.push("/profil")}
          className="bg-card rounded-2xl border border-card-border p-4 shadow-sm flex items-center gap-4 active:scale-[0.98]"
        >
          <Avatar name={user.username} size="lg" avatarData={avatarData} />
          <div className="flex-1 text-left">
            <p className="font-semibold">@{user.username}</p>
            <p className="text-xs text-muted">Profilbild ändern</p>
          </div>
          <span className="text-muted">&rsaquo;</span>
        </button>

        {/* Change name */}
        <div className="bg-card rounded-2xl border border-card-border p-4 shadow-sm">
          <p className="font-semibold mb-1">Benutzername</p>
          {!editingName ? (
            <div className="flex items-center justify-between mt-2">
              <p className="text-sm text-muted">@{user.username}</p>
              <button
                onClick={() => {
                  setNewName(user.username);
                  setEditingName(true);
                }}
                className="text-xs text-accent font-semibold px-3 py-1.5 rounded-xl bg-accent/10"
              >
                Ändern
              </button>
            </div>
          ) : (
            <form onSubmit={handleRename} className="flex flex-col gap-3 mt-2">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="h-10 rounded-2xl bg-background border border-card-border px-4 text-foreground focus:outline-none focus:border-accent"
                autoFocus
              />
              {renameError && (
                <p className="text-xs text-red-500">{renameError}</p>
              )}
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={renaming || !newName.trim() || newName.trim().toLowerCase() === user.username}
                  className="flex-1 h-10 rounded-2xl bg-accent text-white text-sm font-semibold disabled:opacity-50"
                >
                  {renaming ? "Speichern..." : "Speichern"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditingName(false);
                    setRenameError("");
                  }}
                  className="h-10 px-4 rounded-2xl text-sm text-muted bg-background border border-card-border"
                >
                  Abbrechen
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Push notifications */}
        <div className="bg-card rounded-2xl border border-card-border p-4 shadow-sm">
          <p className="font-semibold mb-1">Benachrichtigungen</p>

          {pushStatus === "loading" && (
            <p className="text-xs text-muted">Prüfe...</p>
          )}

          {pushStatus === "on" && (
            <div className="flex items-center justify-between mt-2">
              <p className="text-sm text-accent font-medium">Aktiviert</p>
              <button
                onClick={disablePush}
                className="text-xs text-muted px-3 py-1.5 rounded-xl bg-background border border-card-border"
              >
                Deaktivieren
              </button>
            </div>
          )}

          {pushStatus === "off" && (
            <div className="mt-2">
              <p className="text-xs text-muted mb-3">
                Erhalte eine Benachrichtigung wenn eine neue Frage kommt
              </p>
              <button
                onClick={enablePush}
                className="w-full h-10 rounded-2xl bg-accent text-white text-sm font-semibold"
              >
                Aktivieren
              </button>
            </div>
          )}

          {pushStatus === "denied" && (
            <p className="text-xs text-muted mt-2">
              Benachrichtigungen sind blockiert. Ändere dies in den
              Geräte-Einstellungen für FragUns.
            </p>
          )}

          {pushStatus === "needs-pwa" && (
            <p className="text-xs text-muted mt-2">
              Füge die App zum Home-Bildschirm hinzu um Benachrichtigungen zu
              erhalten: Teilen → &quot;Zum Home-Bildschirm&quot;
            </p>
          )}

          {pushStatus === "unsupported" && (
            <p className="text-xs text-muted mt-2">
              Benachrichtigungen werden in diesem Browser nicht unterstützt.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
