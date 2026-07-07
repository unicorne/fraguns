interface Member {
  id: string;
  name: string;
}

function hashString(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 31 + input.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

// Deterministic per question so every viewer/answer sees the same A/B pairing.
export function resolveQuestionText(
  text: string,
  questionId: string,
  members: Member[]
): string {
  if (members.length < 2) return text;

  const sorted = [...members].sort((a, b) => a.id.localeCompare(b.id));
  const seed = hashString(questionId);
  const indexA = seed % sorted.length;
  const indexB = (indexA + 1 + (seed % (sorted.length - 1))) % sorted.length;

  return text
    .replace(/\bA\b/g, sorted[indexA].name)
    .replace(/\bB\b/g, sorted[indexB].name);
}
