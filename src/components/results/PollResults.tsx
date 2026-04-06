import Avatar from "@/components/Avatar";

interface PollResultsProps {
  answers: Array<{
    value: Record<string, unknown>;
    members: { name: string };
  }>;
  config: Record<string, unknown>;
  groupMembers?: { id: string; name: string }[];
}

export default function PollResults({ answers, config, groupMembers }: PollResultsProps) {
  const voteCounts: Record<string, { count: number; voters: string[] }> = {};
  const customOptions = config.options as string[] | undefined;

  for (const answer of answers) {
    const vote = answer.value.vote as string;
    if (!voteCounts[vote]) {
      voteCounts[vote] = { count: 0, voters: [] };
    }
    voteCounts[vote].count++;
    voteCounts[vote].voters.push(answer.members.name);
  }

  const total = answers.length;
  const sorted = Object.entries(voteCounts).sort(
    ([, a], [, b]) => b.count - a.count
  );

  const getLabel = (key: string) => {
    if (customOptions?.includes(key)) return key;
    // Resolve member UUID to name
    const member = groupMembers?.find((m) => m.id === key);
    if (member) return member.name;
    return key;
  };

  return (
    <div className="flex flex-col gap-3">
      {sorted.map(([option, data], i) => {
        const pct = total > 0 ? Math.round((data.count / total) * 100) : 0;
        const isTop = i === 0;
        return (
          <div key={option} className="relative">
            <div
              className={`rounded-2xl overflow-hidden ${
                isTop ? "bg-orange/20" : "bg-background"
              }`}
            >
              <div
                className={`py-3 px-4 rounded-2xl flex items-center gap-3 ${
                  isTop ? "bg-orange" : "bg-card-border"
                }`}
                style={{ width: `${Math.max(pct, 15)}%` }}
              >
                <span
                  className={`text-sm font-bold ${isTop ? "text-white" : "text-foreground"}`}
                >
                  {pct}%
                </span>
              </div>
            </div>
            <div className="absolute inset-0 flex items-center px-4 pointer-events-none">
              <span className="text-sm font-bold ml-14">{getLabel(option)}</span>
            </div>
            {/* Voter avatars on the right */}
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex -space-x-1">
              {data.voters.slice(0, 3).map((name) => (
                <Avatar key={name} name={name} size="sm" />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
