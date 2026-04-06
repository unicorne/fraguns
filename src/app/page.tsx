"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAllGroups, MemberInfo } from "@/lib/storage";

export default function Home() {
  const router = useRouter();
  const [inviteCode, setInviteCode] = useState("");
  const [groups, setGroups] = useState<MemberInfo[]>([]);

  useEffect(() => {
    setGroups(getAllGroups());
  }, []);

  return (
    <div className="flex flex-col flex-1 items-center justify-center px-6">
      <div className="w-full max-w-sm flex flex-col items-center gap-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight">
            Frag<span className="text-accent">Uns</span>
          </h1>
          <p className="mt-2 text-muted text-sm">
            Tägliche Fragen für deine Freundesgruppe
          </p>
        </div>

        {/* Show existing groups */}
        {groups.length > 0 && (
          <div className="w-full flex flex-col gap-2">
            <p className="text-sm text-muted">Deine Gruppen</p>
            {groups.map((g) => (
              <button
                key={g.groupId}
                onClick={() => router.push(`/gruppe/${g.inviteCode}`)}
                className="w-full bg-card rounded-xl border border-card-border p-4 text-left hover:border-accent"
              >
                <p className="font-medium">{g.groupName}</p>
                <p className="text-xs text-muted mt-0.5">
                  Angemeldet als {g.memberName}
                </p>
              </button>
            ))}
          </div>
        )}

        <div className="w-full flex flex-col gap-3">
          <button
            onClick={() => router.push("/gruppe/erstellen")}
            className="w-full h-12 rounded-xl bg-accent text-white font-medium hover:bg-accent-light"
          >
            Neue Gruppe erstellen
          </button>

          <div className="flex items-center gap-3 text-muted text-xs">
            <div className="flex-1 h-px bg-card-border" />
            <span>oder</span>
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
              className="flex-1 h-12 rounded-xl bg-card border border-card-border px-4 text-foreground placeholder:text-muted focus:outline-none focus:border-accent"
            />
            <button
              type="submit"
              className="h-12 px-5 rounded-xl bg-card border border-card-border text-foreground font-medium hover:border-accent"
            >
              Beitreten
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
