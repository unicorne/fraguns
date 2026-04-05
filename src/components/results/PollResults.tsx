interface PollResultsProps {
  answers: Array<{
    value: Record<string, unknown>;
    members: { name: string };
  }>;
  config: Record<string, unknown>;
}

export default function PollResults({ answers, config }: PollResultsProps) {
  // Count votes per option
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

  // Try to resolve option labels
  const getLabel = (key: string) => {
    if (customOptions?.includes(key)) return key;
    // For member votes, the key is a UUID — we'll show who voted for whom
    return key;
  };

  return (
    <div className="flex flex-col gap-3">
      {sorted.map(([option, data]) => {
        const pct = total > 0 ? Math.round((data.count / total) * 100) : 0;
        return (
          <div key={option}>
            <div className="flex justify-between text-sm mb-1">
              <span>{getLabel(option)}</span>
              <span className="text-muted">
                {data.count} ({pct}%)
              </span>
            </div>
            <div className="h-8 rounded-lg bg-background overflow-hidden">
              <div
                className="h-full bg-accent/30 rounded-lg flex items-center px-3"
                style={{ width: `${Math.max(pct, 5)}%` }}
              >
                <span className="text-xs text-muted truncate">
                  {data.voters.join(", ")}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
