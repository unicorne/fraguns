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
      <div className="text-center">
        <p className="text-sm text-muted">Durchschnitt</p>
        <p className="text-4xl font-bold text-accent">{average.toFixed(1)}</p>
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
              <span className="text-sm w-20 truncate">{answer.members.name}</span>
              <div className="flex-1 h-6 rounded-lg bg-background overflow-hidden">
                <div
                  className="h-full bg-accent/30 rounded-lg"
                  style={{ width: `${Math.max(pct, 3)}%` }}
                />
              </div>
              <span className="text-sm font-medium w-8 text-right">{val}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
