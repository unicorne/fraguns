"use client";

import Avatar from "@/components/Avatar";

interface PollAnswerProps {
  config: Record<string, unknown>;
  members: { id: string; name: string }[];
  onAnswer: (value: Record<string, unknown>) => void;
  submitting: boolean;
}

export default function PollAnswer({
  config,
  members,
  onAnswer,
  submitting,
}: PollAnswerProps) {
  const optionsType = config.options_type as string;
  const customOptions = config.options as string[] | undefined;

  const options =
    optionsType === "members"
      ? members.map((m) => ({ value: m.id, label: m.name }))
      : (customOptions || []).map((o) => ({ value: o, label: o }));

  return (
    <div className="flex flex-col gap-2">
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onAnswer({ vote: option.value })}
          disabled={submitting}
          className="w-full py-3 px-4 rounded-2xl bg-background border border-card-border text-left hover:border-accent active:scale-[0.98] disabled:opacity-50 flex items-center gap-3"
        >
          <Avatar name={option.label} size="sm" />
          <span className="font-medium">{option.label}</span>
        </button>
      ))}
    </div>
  );
}
