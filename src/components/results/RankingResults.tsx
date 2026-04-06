import Avatar from "@/components/Avatar";

interface RankingResultsProps {
  answers: Array<{
    value: Record<string, unknown>;
    members: { name: string };
  }>;
  groupMembers: { id: string; name: string }[];
}

export default function RankingResults({
  answers,
  groupMembers,
}: RankingResultsProps) {
  // Calculate average position for each member
  const positionSums: Record<string, { total: number; count: number }> = {};

  for (const answer of answers) {
    const ranking = answer.value.ranking as string[];
    if (!ranking) continue;
    ranking.forEach((memberId, index) => {
      if (!positionSums[memberId]) {
        positionSums[memberId] = { total: 0, count: 0 };
      }
      positionSums[memberId].total += index + 1; // 1-based position
      positionSums[memberId].count += 1;
    });
  }

  const ranked = Object.entries(positionSums)
    .map(([memberId, { total, count }]) => {
      const member = groupMembers.find((m) => m.id === memberId);
      return {
        name: member?.name || "Unbekannt",
        avgPosition: total / count,
      };
    })
    .sort((a, b) => a.avgPosition - b.avgPosition);

  if (ranked.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      <div className="text-center mb-2">
        <p className="text-xs text-muted">Durchschnittliches Ranking</p>
      </div>

      {ranked.map((entry, i) => {
        const barWidth = ranked.length > 1
          ? ((ranked[ranked.length - 1].avgPosition - entry.avgPosition) /
              (ranked[ranked.length - 1].avgPosition - ranked[0].avgPosition)) *
            100
          : 100;

        return (
          <div
            key={i}
            className={`flex items-center gap-3 px-3 py-2 rounded-2xl ${
              i === 0 ? "bg-orange/10" : ""
            }`}
          >
            <span
              className={`text-sm font-bold w-6 text-center ${
                i === 0 ? "text-orange" : "text-muted"
              }`}
            >
              {i === 0 ? "🏆" : `${i + 1}.`}
            </span>
            <Avatar name={entry.name} size="sm" />
            <div className="flex-1">
              <span className="text-sm font-medium">{entry.name}</span>
              <div className="h-2 rounded-full bg-background mt-1 overflow-hidden">
                <div
                  className="h-full bg-orange/40 rounded-full"
                  style={{ width: `${Math.max(barWidth, 8)}%` }}
                />
              </div>
            </div>
            <span className="text-xs text-muted font-semibold">
              Ø {entry.avgPosition.toFixed(1)}
            </span>
          </div>
        );
      })}
    </div>
  );
}
