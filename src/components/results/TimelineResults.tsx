import Avatar from "@/components/Avatar";

interface TimelineResultsProps {
  answers: Array<{
    value: Record<string, unknown>;
    members: { name: string };
  }>;
}

export default function TimelineResults({ answers }: TimelineResultsProps) {
  const entries = answers
    .map((a) => ({
      name: a.members.name,
      year: a.value.year as number,
    }))
    .sort((a, b) => a.year - b.year);

  if (entries.length === 0) return null;

  const minYear = entries[0].year;
  const maxYear = entries[entries.length - 1].year;
  const range = maxYear - minYear;

  function getPosition(year: number): number {
    if (range === 0) return 50;
    return ((year - minYear) / range) * 100;
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Timeline visualization */}
      <div className="px-2 pt-4 pb-16 relative">
        <div className="relative h-1 bg-card-border rounded-full">
          {/* Year markers at start and end */}
          <div className="absolute -bottom-5 left-0 text-xs text-muted">
            {minYear}
          </div>
          {range > 0 && (
            <div className="absolute -bottom-5 right-0 text-xs text-muted">
              {maxYear}
            </div>
          )}

          {/* Entry dots */}
          {entries.map((entry, i) => (
            <div
              key={i}
              className="absolute top-1/2 flex flex-col items-center"
              style={{
                left: `${getPosition(entry.year)}%`,
                transform: "translate(-50%, -50%)",
              }}
            >
              <div className="mb-1">
                <Avatar name={entry.name} size="sm" />
              </div>
              <div className="w-2 h-2 rounded-full bg-orange border-2 border-white" />
              <div className="mt-1 flex flex-col items-center">
                <span className="text-[10px] font-semibold text-orange">
                  {entry.year}
                </span>
                <span className="text-[10px] text-muted whitespace-nowrap">
                  {entry.name}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* List view */}
      <div className="flex flex-col gap-2">
        {entries.map((entry, i) => (
          <div key={i} className="flex items-center gap-3 px-3 py-2">
            <Avatar name={entry.name} size="sm" />
            <span className="text-sm font-medium flex-1">{entry.name}</span>
            <span className="text-sm font-bold text-orange">{entry.year}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
