"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function GruppeErstellen() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      router.push(`/gruppe/${data.invite_code}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Fehler beim Erstellen");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col flex-1 min-h-screen">
      <div className="bg-gradient-to-b from-accent to-accent-light px-6 pt-10 pb-12">
        <button
          onClick={() => router.push("/")}
          className="text-white/70 text-sm mb-4 hover:text-white"
        >
          &larr; Zurück
        </button>
        <h1 className="text-2xl font-bold text-white">
          Neue Gruppe erstellen
        </h1>
      </div>

      <div className="px-6 -mt-4">
        <form
          onSubmit={handleSubmit}
          className="bg-card rounded-2xl border border-card-border p-5 shadow-sm flex flex-col gap-4"
        >
          <input
            type="text"
            placeholder="Gruppenname (z.B. Die Jungs)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-12 rounded-2xl bg-background border border-card-border px-4 text-foreground placeholder:text-muted focus:outline-none focus:border-accent"
            autoFocus
          />

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading || !name.trim()}
            className="h-12 rounded-2xl bg-accent text-white font-semibold hover:bg-accent-dark disabled:opacity-50"
          >
            {loading ? "Erstelle..." : "Gruppe erstellen"}
          </button>
        </form>
      </div>
    </div>
  );
}
