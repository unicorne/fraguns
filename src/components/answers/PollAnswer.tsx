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
  const configOptions = config.options as string[] | undefined;

  let options: { value: string; label: string }[];

  if (optionsType === "members") {
    // If specific member IDs are provided, filter to those; otherwise show all
    if (configOptions && configOptions.length > 0) {
      options = configOptions
        .map((id) => {
          const m = members.find((m) => m.id === id);
          return m ? { value: m.id, label: m.name } : null;
        })
        .filter((o): o is { value: string; label: string } => o !== null);
    } else {
      options = members.map((m) => ({ value: m.id, label: m.name }));
    }
  } else {
    options = (configOptions || []).map((o) => ({ value: o, label: o }));
  }

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
