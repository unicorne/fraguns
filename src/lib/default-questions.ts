export interface DefaultQuestion {
  text: string;
  type: "poll" | "text" | "scale";
  config: Record<string, unknown>;
}

export const defaultQuestions: DefaultQuestion[] = [
  // Poll-Fragen (Mitglieder als Optionen)
  {
    text: "Wer wird eher Millionär?",
    type: "poll",
    config: { options_type: "members" },
  },
  {
    text: "Wer würde am längsten auf einer einsamen Insel überleben?",
    type: "poll",
    config: { options_type: "members" },
  },
  {
    text: "Wer kommt am ehesten zu spät zur eigenen Hochzeit?",
    type: "poll",
    config: { options_type: "members" },
  },
  {
    text: "Wer würde eher einen viralen TikTok-Hit landen?",
    type: "poll",
    config: { options_type: "members" },
  },
  {
    text: "Wer wäre der beste Reality-TV-Teilnehmer?",
    type: "poll",
    config: { options_type: "members" },
  },
  {
    text: "Wer würde am ehesten aus Versehen berühmt werden?",
    type: "poll",
    config: { options_type: "members" },
  },
  {
    text: "Wer hätte die beste Überlebenschance in einem Zombie-Apokalypse?",
    type: "poll",
    config: { options_type: "members" },
  },
  {
    text: "Wer wird als erstes Kinder haben?",
    type: "poll",
    config: { options_type: "members" },
  },
  {
    text: "Wer würde am ehesten einen Marathon laufen?",
    type: "poll",
    config: { options_type: "members" },
  },
  {
    text: "Wer hätte den schlechtesten Geschmack bei einem Filmabend?",
    type: "poll",
    config: { options_type: "members" },
  },

  // Freitext-Fragen
  {
    text: "Was ist das Peinlichste, das dir je passiert ist?",
    type: "text",
    config: {},
  },
  {
    text: "Wenn du einen Tag lang jemand anderes aus der Gruppe sein könntest — wer und warum?",
    type: "text",
    config: {},
  },
  {
    text: "Was ist dein guilty pleasure, das niemand weiß?",
    type: "text",
    config: {},
  },
  {
    text: "Was wäre dein Traumberuf, wenn Geld keine Rolle spielen würde?",
    type: "text",
    config: {},
  },
  {
    text: "Was ist die schlechteste Ausrede, die du je benutzt hast?",
    type: "text",
    config: {},
  },

  // Skala-Fragen
  {
    text: "Wie zufrieden bist du gerade mit deinem Leben? (1-10)",
    type: "scale",
    config: { min: 1, max: 10, labels: { "1": "Mies", "10": "Perfekt" } },
  },
  {
    text: "Wie gut kannst du kochen? (1-10)",
    type: "scale",
    config: { min: 1, max: 10, labels: { "1": "Nudeln mit Ketchup", "10": "Sternekoch" } },
  },
  {
    text: "Wie spontan bist du? (1-10)",
    type: "scale",
    config: { min: 1, max: 10, labels: { "1": "Planer", "10": "YOLO" } },
  },
  {
    text: "Wie ehrlich sind deine Antworten in dieser App? (1-10)",
    type: "scale",
    config: { min: 1, max: 10, labels: { "1": "Alles gelogen", "10": "Brutale Ehrlichkeit" } },
  },
  {
    text: "Wie gut kennst du die anderen in dieser Gruppe? (1-10)",
    type: "scale",
    config: { min: 1, max: 10, labels: { "1": "Kaum", "10": "Wie mich selbst" } },
  },
];
