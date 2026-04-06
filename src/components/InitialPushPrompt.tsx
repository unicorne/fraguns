"use client";

import { useState, useEffect } from "react";

interface InitialPushPromptProps {
  onDone: () => void;
}

export default function InitialPushPrompt({ onDone }: InitialPushPromptProps) {
  const [visible, setVisible] = useState(false);
  const [enabling, setEnabling] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("fraguns_push_prompted")) {
      onDone();
      return;
    }

    const supported =
      "serviceWorker" in navigator && "PushManager" in window;
    if (!supported) {
      onDone();
      return;
    }

    setVisible(true);
  }, []);

  async function enable() {
    setEnabling(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        const reg = await navigator.serviceWorker.ready;
        await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(
            process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
          ) as BufferSource,
        });
      }
    } catch (e) {
      console.error("Push setup failed:", e);
    }
    localStorage.setItem("fraguns_push_prompted", "1");
    setVisible(false);
    onDone();
  }

  function skip() {
    localStorage.setItem("fraguns_push_prompted", "1");
    setVisible(false);
    onDone();
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end justify-center">
      <div className="bg-card rounded-t-3xl w-full max-w-lg p-6 pb-10 shadow-xl">
        <div className="text-center mb-6">
          <div className="text-4xl mb-3">🔔</div>
          <h2 className="text-lg font-bold">Benachrichtigungen</h2>
          <p className="text-sm text-muted mt-2">
            Erhalte eine Nachricht wenn eine neue Frage in deiner Gruppe kommt
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={enable}
            disabled={enabling}
            className="w-full h-12 rounded-2xl bg-accent text-white font-semibold hover:bg-accent-dark disabled:opacity-50"
          >
            {enabling ? "Aktiviere..." : "Aktivieren"}
          </button>
          <button
            onClick={skip}
            className="w-full h-10 rounded-2xl text-muted text-sm font-medium"
          >
            Später
          </button>
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
