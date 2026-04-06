import Avatar from "@/components/Avatar";

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
        <div
          key={i}
          className="bg-background rounded-2xl p-4 flex items-start gap-3"
        >
          <Avatar name={answer.members.name} size="sm" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-muted">
              {answer.members.name}
            </p>
            <p className="text-sm mt-1">{answer.value.text as string}</p>
          </div>
        </div>
      ))}
      {answers.length === 0 && (
        <p className="text-muted text-sm text-center py-4">
          Noch keine Antworten
        </p>
      )}
    </div>
  );
}
