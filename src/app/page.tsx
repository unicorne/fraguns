"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAllGroups, MemberInfo } from "@/lib/storage";
import { AvatarGroup } from "@/components/Avatar";

export default function Home() {
  const router = useRouter();
  const [inviteCode, setInviteCode] = useState("");
  const [groups, setGroups] = useState<MemberInfo[]>([]);

  useEffect(() => {
    setGroups(getAllGroups());
  }, []);

  return (
    <div className="flex flex-col flex-1 min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-b from-accent to-accent-light px-6 pt-10 pb-8">
        <h1 className="text-3xl font-bold text-white tracking-tight">
          FragUns
        </h1>
      </div>

      <div className="flex-1 px-4 -mt-4">
        {/* Groups list */}
        {groups.length > 0 && (
          <div className="flex flex-col gap-3 mb-6">
            {groups.map((g) => (
              <button
                key={g.groupId}
                onClick={() => router.push(`/gruppe/${g.inviteCode}`)}
                className="w-full bg-card rounded-2xl border border-card-border p-4 text-left shadow-sm active:scale-[0.98]"
              >
                <div className="flex items-center gap-3">
                  <AvatarGroup names={[g.memberName]} size="md" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground truncate">
                      {g.groupName}
                    </p>
                    <p className="text-xs text-muted mt-0.5">
                      Angemeldet als {g.memberName}
                    </p>
                  </div>
                </div>
              </button>
            ))}
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
