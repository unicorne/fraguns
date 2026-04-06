import Avatar from "@/components/Avatar";

interface TeamSplitResultsProps {
  answers: Array<{
    value: Record<string, unknown>;
    members: { name: string };
  }>;
  config: Record<string, unknown>;
}

export default function TeamSplitResults({
  answers,
  config,
}: TeamSplitResultsProps) {
  const teamLabels = (config.team_labels as string[]) || ["Team A", "Team B"];

  const teams: { name: string }[][] = [[], []];
  for (const answer of answers) {
    const teamIndex = answer.value.team as number;
    if (teamIndex === 0 || teamIndex === 1) {
      teams[teamIndex].push({ name: answer.members.name });
    }
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      {teamLabels.map((label, i) => (
        <div
          key={i}
          className="bg-background rounded-2xl border border-card-border p-4"
        >
          <h3 className="text-sm font-bold text-center mb-3">{label}</h3>
          <p className="text-xs text-muted text-center mb-3">
            {teams[i].length} {teams[i].length === 1 ? "Person" : "Personen"}
          </p>
          <div className="flex flex-col gap-2">
            {teams[i].map((member, j) => (
              <div key={j} className="flex items-center gap-2">
                <Avatar name={member.name} size="sm" />
                <span className="text-sm font-medium">{member.name}</span>
              </div>
            ))}
            {teams[i].length === 0 && (
              <p className="text-xs text-muted text-center">Noch niemand</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
