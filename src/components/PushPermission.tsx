"use client";

import { useState, useEffect } from "react";

interface PushPermissionProps {
  memberId: string;
}

export default function PushPermission({ memberId }: PushPermissionProps) {
  const [status, setStatus] = useState<
    "loading" | "unsupported" | "needs-pwa" | "ready" | "subscribing" | "done" | "error" | "dismissed"
  >("loading");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    checkSupport();
  }, []);

  async function checkSupport() {
    if (typeof window === "undefined") {
      setStatus("unsupported");
      return;
    }

    const hasSW = "serviceWorker" in navigator;
    const hasPush = "PushManager" in window;
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (navigator as any).standalone === true;

    if (!hasSW || !hasPush) {
      // iOS Safari without PWA install
      if (/iPhone|iPad/.test(navigator.userAgent) && !isStandalone) {
        setStatus("needs-pwa");
      } else {
        setStatus("unsupported");
      }
      return;
    }

    // Check if already subscribed
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        setStatus("done");
      } else {
        setStatus("ready");
      }
    } catch {
      setStatus("ready");
    }
  }

  async function subscribe() {
    setStatus("subscribing");
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setErrorMsg("Benachrichtigungen wurden blockiert. Erlaube sie in den Browser-Einstellungen.");
        setStatus("error");
        return;
      }

      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      });

      const res = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          member_id: memberId,
          subscription: sub.toJSON(),
        }),
      });

      if (!res.ok) {
        throw new Error("Server error");
      }

      setStatus("done");
    } catch (err) {
      console.error("Push subscription failed:", err);
      setErrorMsg(err instanceof Error ? err.message : "Fehler beim Aktivieren");
      setStatus("error");
    }
  }

  if (status === "loading" || status === "done" || status === "dismissed") return null;

  return (
    <div className="bg-card rounded-2xl border border-card-border p-4 shadow-sm mt-4">
      <p className="text-sm font-medium mb-1">Benachrichtigungen</p>

      {status === "needs-pwa" && (
        <>
          <p className="text-xs text-muted mb-3">
            Um Benachrichtigungen zu erhalten, füge die App zum Home-Bildschirm hinzu:
            Teilen → &quot;Zum Home-Bildschirm&quot;
          </p>
          <button
            onClick={() => setStatus("dismissed")}
            className="h-10 px-4 rounded-2xl text-sm text-muted bg-background border border-card-border"
          >
            Verstanden
          </button>
        </>
      )}

      {status === "unsupported" && (
        <>
          <p className="text-xs text-muted mb-3">
            Push-Benachrichtigungen werden in diesem Browser leider nicht unterstützt.
          </p>
          <button
            onClick={() => setStatus("dismissed")}
            className="h-10 px-4 rounded-2xl text-sm text-muted bg-background border border-card-border"
          >
            OK
          </button>
        </>
      )}

      {status === "ready" && (
        <>
          <p className="text-xs text-muted mb-3">
            Werde erinnert wenn eine neue Frage kommt
          </p>
          <div className="flex gap-2">
            <button
              onClick={subscribe}
              className="flex-1 h-10 rounded-2xl bg-accent text-white text-sm font-semibold hover:bg-accent-dark"
            >
              Aktivieren
            </button>
            <button
              onClick={() => setStatus("dismissed")}
              className="h-10 px-4 rounded-2xl text-sm text-muted bg-background border border-card-border"
            >
              Später
            </button>
          </div>
        </>
      )}

      {status === "subscribing" && (
        <p className="text-xs text-muted">Aktiviere...</p>
      )}

      {status === "error" && (
        <>
          <p className="text-xs text-red-500 mb-3">{errorMsg}</p>
          <div className="flex gap-2">
            <button
              onClick={subscribe}
              className="flex-1 h-10 rounded-2xl bg-accent text-white text-sm font-semibold"
            >
              Nochmal versuchen
            </button>
            <button
              onClick={() => setStatus("dismissed")}
              className="h-10 px-4 rounded-2xl text-sm text-muted bg-background border border-card-border"
            >
              Abbrechen
            </button>
          </div>
        </>
      )}
    </div>
  );
}
