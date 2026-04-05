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
    <div className="bg-card rounded-xl border border-card-border p-4 mb-4">
      <p className="text-sm mb-3">
        Möchtest du täglich an neue Fragen erinnert werden?
      </p>
      <div className="flex gap-2">
        <button
          onClick={subscribe}
          className="flex-1 py-2 rounded-xl bg-accent text-white text-sm font-medium"
        >
          Ja, erinnere mich
        </button>
        <button
          onClick={() => setDismissed(true)}
          className="py-2 px-4 rounded-xl text-sm text-muted"
        >
          Nein
        </button>
      </div>
    </div>
  );
}
