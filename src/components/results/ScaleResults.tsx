import Avatar from "@/components/Avatar";

interface ScaleResultsProps {
  answers: Array<{
    value: Record<string, unknown>;
    members: { name: string };
  }>;
  config: Record<string, unknown>;
}

export default function ScaleResults({ answers, config }: ScaleResultsProps) {
  const min = (config.min as number) || 1;
  const max = (config.max as number) || 10;

  const values = answers.map((a) => a.value.scale as number);
  const average = values.length
    ? values.reduce((a, b) => a + b, 0) / values.length
    : 0;

  return (
    <div className="flex flex-col gap-4">
      <div className="text-center bg-orange/10 rounded-2xl py-4">
        <p className="text-xs text-muted">Durchschnitt</p>
        <p className="text-4xl font-bold text-orange">{average.toFixed(1)}</p>
        <p className="text-xs text-muted">
          von {min} bis {max}
        </p>
      </div>

      <div className="flex flex-col gap-2">
        {answers.map((answer, i) => {
          const val = answer.value.scale as number;
          const pct = ((val - min) / (max - min)) * 100;
          return (
            <div key={i} className="flex items-center gap-3">
              <Avatar name={answer.members.name} size="sm" />
              <div className="flex-1 h-7 rounded-xl bg-background overflow-hidden">
                <div
                  className="h-full bg-orange/30 rounded-xl"
                  style={{ width: `${Math.max(pct, 5)}%` }}
                />
              </div>
              <span className="text-sm font-bold w-8 text-right text-orange">
                {val}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
