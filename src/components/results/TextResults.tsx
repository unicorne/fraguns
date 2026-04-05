interface TextResultsProps {
  answers: Array<{
    value: Record<string, unknown>;
    members: { name: string };
  }>;
}

export default function TextResults({ answers }: TextResultsProps) {
  return (
    <div className="flex flex-col gap-3">
      {answers.map((answer, i) => (
        <div key={i} className="bg-background rounded-xl p-4">
          <p className="text-sm">{answer.value.text as string}</p>
          <p className="text-xs text-muted mt-2">— {answer.members.name}</p>
        </div>
      ))}
      {answers.length === 0 && (
        <p className="text-muted text-sm text-center">Noch keine Antworten</p>
      )}
    </div>
  );
}
