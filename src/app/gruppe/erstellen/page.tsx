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
    <div className="flex flex-col flex-1 items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <button
          onClick={() => router.push("/")}
          className="text-muted text-sm mb-8 hover:text-foreground"
        >
          &larr; Zurück
        </button>

        <h1 className="text-2xl font-bold mb-6">Neue Gruppe erstellen</h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Gruppenname (z.B. Die Jungs)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-12 rounded-xl bg-card border border-card-border px-4 text-foreground placeholder:text-muted focus:outline-none focus:border-accent"
            autoFocus
          />

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading || !name.trim()}
            className="h-12 rounded-xl bg-accent text-white font-medium hover:bg-accent-light disabled:opacity-50"
          >
            {loading ? "Erstelle..." : "Gruppe erstellen"}
          </button>
        </form>
      </div>
    </div>
  );
}
