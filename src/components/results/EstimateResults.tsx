import Avatar from "@/components/Avatar";

interface EstimateResultsProps {
  answers: Array<{
    value: Record<string, unknown>;
    members: { name: string };
  }>;
  config: Record<string, unknown>;
}

export default function EstimateResults({
  answers,
  config,
}: EstimateResultsProps) {
  const correctAnswer = config.correct_answer as number;
  const unit = (config.unit as string) || "";

  const guesses = answers.map((a) => ({
    name: a.members.name,
    value: a.value.estimate as number,
    diff: Math.abs((a.value.estimate as number) - correctAnswer),
  }));

  // Sort by accuracy
  const ranked = [...guesses].sort((a, b) => a.diff - b.diff);

  // Number line range
  const allValues = [...guesses.map((g) => g.value), correctAnswer];
  const minVal = Math.min(...allValues);
  const maxVal = Math.max(...allValues);
  const padding = Math.max((maxVal - minVal) * 0.1, 1);
  const lineMin = minVal - padding;
  const lineMax = maxVal + padding;
  const range = lineMax - lineMin;

  function getPosition(val: number): number {
    if (range === 0) return 50;
    return ((val - lineMin) / range) * 100;
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Correct answer display */}
      <div className="text-center bg-green-500/10 rounded-2xl py-4">
        <p className="text-xs text-muted">Richtige Antwort</p>
        <p className="text-4xl font-bold text-green-500">
          {correctAnswer}
          {unit && (
            <span className="text-lg ml-1 font-normal text-muted">{unit}</span>
          )}
        </p>
      </div>

      {/* Number line visualization */}
      <div className="px-2 pt-8 pb-4">
        <div className="relative h-2 bg-card-border rounded-full">
          {/* Correct answer marker */}
          <div
            className="absolute -top-6 flex flex-col items-center"
            style={{ left: `${getPosition(correctAnswer)}%`, transform: "translateX(-50%)" }}
          >
            <span className="text-xs font-bold text-green-500">{correctAnswer}</span>
            <div className="w-3 h-3 rounded-full bg-green-500 border-2 border-white mt-1" />
          </div>

          {/* Guess markers */}
          {guesses.map((guess, i) => (
            <div
              key={i}
              className="absolute top-3 flex flex-col items-center"
              style={{
                left: `${getPosition(guess.value)}%`,
                transform: "translateX(-50%)",
              }}
            >
              <div className="w-2.5 h-2.5 rounded-full bg-orange border-2 border-white" />
              <span className="text-[10px] text-muted mt-1 whitespace-nowrap">
                {guess.name}
              </span>
              <span className="text-[10px] font-semibold text-orange">
                {guess.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Ranking */}
      <div className="flex flex-col gap-2">
        {ranked.map((guess, i) => (
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
            <Avatar name={guess.name} size="sm" />
            <span className="text-sm font-medium flex-1">{guess.name}</span>
            <span className="text-sm text-muted">
              {guess.value}
              {unit && ` ${unit}`}
            </span>
            <span
              className={`text-xs font-semibold ${
                i === 0 ? "text-orange" : "text-muted"
              }`}
            >
              Δ{guess.diff}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
