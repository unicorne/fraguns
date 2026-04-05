"use client";

import Link from "next/link";

interface NavigationProps {
  inviteCode: string;
  active: "heute" | "fragen" | "verlauf" | "gruppe";
}

const tabs = [
  { key: "heute", label: "Heute", path: "" },
  { key: "fragen", label: "Fragen", path: "/fragen" },
  { key: "verlauf", label: "Verlauf", path: "/verlauf" },
] as const;

export default function Navigation({ inviteCode, active }: NavigationProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-card-border">
      <div className="flex justify-around max-w-lg mx-auto">
        {tabs.map((tab) => (
          <Link
            key={tab.key}
            href={`/gruppe/${inviteCode}${tab.path}`}
            className={`flex-1 py-3 text-center text-xs font-medium ${
              active === tab.key ? "text-accent" : "text-muted"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
