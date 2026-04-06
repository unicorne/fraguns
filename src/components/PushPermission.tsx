"use client";

import { useState, useEffect } from "react";

interface PushPermissionProps {
  memberId: string;
}

export default function PushPermission({ memberId }: PushPermissionProps) {
  const [supported, setSupported] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const isSupported =
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      "PushManager" in window;
    setSupported(isSupported);

    if (isSupported) {
      navigator.serviceWorker.ready.then((reg) => {
        reg.pushManager.getSubscription().then((sub) => {
          if (sub) setSubscribed(true);
        });
      });
    }
  }, []);

  async function subscribe() {
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      });

      await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          member_id: memberId,
          subscription: sub.toJSON(),
        }),
      });

      setSubscribed(true);
    } catch (err) {
      console.error("Push subscription failed:", err);
    }
  }

  if (!supported || subscribed || dismissed) return null;

  return (
    <div className="bg-card rounded-2xl border border-card-border p-4 shadow-sm mt-4">
      <p className="text-sm font-medium mb-1">Benachrichtigungen</p>
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
          onClick={() => setDismissed(true)}
          className="h-10 px-4 rounded-2xl text-sm text-muted bg-background border border-card-border"
        >
          Später
        </button>
      </div>
    </div>
  );
}
