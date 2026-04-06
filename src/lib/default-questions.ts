export interface DefaultQuestion {
  text: string;
  type: "poll" | "text" | "scale" | "estimate" | "timeline" | "two_truths_one_lie" | "team_split" | "ranking";
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
  {
    text: "Wer von euch hat den besseren Körper?",
    type: "poll",
    config: { options_type: "members" },
  },
  {
    text: "Wer von euch gibt in der Gruppe am meisten an, hat aber am wenigsten dahinter?",
    type: "poll",
    config: { options_type: "members" },
  },
  {
    text: "Wessen Eltern wären am meisten enttäuscht, wenn sie wüssten, was ihr Kind wirklich so treibt?",
    type: "poll",
    config: { options_type: "members" },
  },
  {
    text: "Wer von euch würde am ehesten ein komplettes Doppelleben führen können, ohne dass es auffliegt?",
    type: "poll",
    config: { options_type: "members" },
  },
  {
    text: "Wer von euch wäre der bessere Cult Leader?",
    type: "poll",
    config: { options_type: "members" },
  },
  {
    text: "Wer von euch hat die meisten Red Flags, sieht aber von außen am normalsten aus?",
    type: "poll",
    config: { options_type: "members" },
  },
  {
    text: "Wenn die Gruppe in einem Flugzeugabsturz strandet — wer übernimmt die Führung?",
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
  {
    text: "Wenn A ein Restaurant eröffnen würde — was für eins wäre es und wie würde es heißen?",
    type: "text",
    config: {},
  },
  {
    text: "Was ist eine Meinung, die du hast, von der du weißt, dass sie in dieser Gruppe Stress auslösen würde?",
    type: "text",
    config: {},
  },
  {
    text: "Beschreib den Moment, in dem du dich in deinem Leben am meisten geschämt hast — in einem Satz.",
    type: "text",
    config: {},
  },
  {
    text: "Was ist A's beste Eigenschaft — und welche Eigenschaft steht ihr am meisten im Weg?",
    type: "text",
    config: {},
  },
  {
    text: "Wenn B ein Wikipedia-Artikel wäre — was stünde im Abschnitt 'Kontroversen'?",
    type: "text",
    config: {},
  },
  {
    text: "Welche Phase deines Lebens würdest du komplett aus deiner Erinnerung löschen, wenn du könntest?",
    type: "text",
    config: {},
  },
  {
    text: "Was ist das Krasseste, das du mal getan hast, von dem niemand in dieser Gruppe weiß?",
    type: "text",
    config: {},
  },
  {
    text: "Wenn du eine Version von dir aus einem Paralleluniversum treffen könntest, die eine andere Lebensentscheidung getroffen hat — welche Entscheidung wäre es?",
    type: "text",
    config: {},
  },
  {
    text: "Was ist die größte Red Flag an dir, die du selbst kennst, aber einfach nicht änderst?",
    type: "text",
    config: {},
  },
  {
    text: "Wenn B einen Skandal hätte, der auf der Titelseite landet — was wäre die Schlagzeile?",
    type: "text",
    config: {},
  },
  {
    text: "Wenn du A's Tinder-Profil schreiben müsstest, aber brutal ehrlich — was steht drin?",
    type: "text",
    config: {},
  },
  {
    text: "Was ist A's toxic trait, den alle in der Gruppe kennen, aber keiner anspricht?",
    type: "text",
    config: {},
  },
  {
    text: "Wenn B's Lebensentscheidungen bisher ein Yelp-Review wären — wie viele Sterne und was steht in der Bewertung?",
    type: "text",
    config: {},
  },
  {
    text: "Wenn du 10 Jahre in die Zukunft reisen könntest und nur eine einzige Sache über dein Leben erfahren dürftest — was würdest du wissen wollen?",
    type: "text",
    config: {},
  },
  {
    text: "Wenn du B's Grabstein-Spruch schreiben müsstest — was steht drauf?",
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
  {
    text: "Auf einer Skala von 1 bis 10, wie gut kann B ein Geheimnis für sich behalten?",
    type: "scale",
    config: { min: 1, max: 10 },
  },
  {
    text: "Auf einer Skala von 1 bis 10, wie gut wäre A als Elternteil?",
    type: "scale",
    config: { min: 1, max: 10 },
  },
  {
    text: "Auf einer Skala von 1 bis 10, wie cringe ist A's Social-Media-Auftritt?",
    type: "scale",
    config: { min: 1, max: 10 },
  },
  {
    text: "Auf einer Skala von 1 bis 10, wie sehr lebt B unter seinem/ihrem Potenzial?",
    type: "scale",
    config: { min: 1, max: 10 },
  },
  {
    text: "Auf einer Skala von 1 bis 10, wie emotional abhängig ist B von Bestätigung durch andere?",
    type: "scale",
    config: { min: 1, max: 10 },
  },
  {
    text: "Auf einer Skala von 1 bis 10, wie toxisch ist B auf Dating-Apps?",
    type: "scale",
    config: { min: 1, max: 10 },
  },
  {
    text: "Auf einer Skala von 1 bis 10, wie sehr ist A ein People Pleaser?",
    type: "scale",
    config: { min: 1, max: 10 },
  },
  {
    text: "Auf einer Skala von 1 bis 10, wie petty kann A werden, wenn er/sie sich ungerecht behandelt fühlt?",
    type: "scale",
    config: { min: 1, max: 10 },
  },
  {
    text: "Auf einer Skala von 1 bis 10, wie scary ist B wenn er/sie richtig wütend wird?",
    type: "scale",
    config: { min: 1, max: 10 },
  },

  // Team-Aufteilung
  {
    text: "Teilt euch auf: Wer ist secretly deep und wer hat die emotionale Tiefe einer Pfütze?",
    type: "team_split",
    config: { team_labels: ["Stille Wasser", "Pfützen-Tiefe"] },
  },
  {
    text: "Teilt euch auf: Wer hat Rizz und wer hat Anti-Rizz?",
    type: "team_split",
    config: { team_labels: ["Rizz-Lord", "Anti-Rizz"] },
  },
  {
    text: "Teilt euch auf: Wer hat die Streetsmarts und wer hat die Booksmarts?",
    type: "team_split",
    config: { team_labels: ["Straße", "Bücher"] },
  },
  {
    text: "Teilt euch auf: Wer würde den anderen für 100.000€ verraten und wer bleibt loyal?",
    type: "team_split",
    config: { team_labels: ["Judas", "Ride or Die"] },
  },
  {
    text: "Teilt euch auf: Wer hat echtes Selbstbewusstsein und wer faked es nur extrem gut?",
    type: "team_split",
    config: { team_labels: ["Echt confident", "Oscar-reife Performance"] },
  },
  {
    text: "Teilt euch auf: Wer hat echte Prinzipien und wer biegt sich die Moral zurecht, wie es gerade passt?",
    type: "team_split",
    config: { team_labels: ["Echte Prinzipien", "Moralischer Gymnast"] },
  },
  {
    text: "Teilt euch auf: Wer wäre bei der Mafia der Boss und wer der Verräter, der als Erstes zur Polizei rennt?",
    type: "team_split",
    config: { team_labels: ["Boss", "Snitch"] },
  },
  {
    text: "Teilt euch auf: Wer hat Daddy Issues und wer hat Mommy Issues?",
    type: "team_split",
    config: { team_labels: ["Daddy Issues", "Mommy Issues"] },
  },
  {
    text: "Teilt euch auf: Wer altert wie Wein und wer altert wie Milch?",
    type: "team_split",
    config: { team_labels: ["Altert wie Wein", "Altert wie Milch"] },
  },
  {
    text: "Teilt euch auf: Wer ist der Wolf und wer das Schaf in dieser Gruppe?",
    type: "team_split",
    config: { team_labels: ["Wolf", "Schaf"] },
  },
  {
    text: "Teilt euch auf: Wer lebt um zu arbeiten und wer arbeitet um zu leben?",
    type: "team_split",
    config: { team_labels: ["Lebt um zu arbeiten", "Arbeitet um zu leben"] },
  },

  // Ranking-Fragen
  {
    text: "Sortiert die Gruppe: Wer hat die meisten Leute geghostet — von Serientäter bis treue Seele?",
    type: "ranking",
    config: {},
  },
  {
    text: "Sortiert die Gruppe: Wer verträgt am meisten Alkohol — von Fass ohne Boden bis One-Beer-Wonder?",
    type: "ranking",
    config: {},
  },
  {
    text: "Sortiert die Gruppe danach, wer den schlimmsten Filmgeschmack hat.",
    type: "ranking",
    config: {},
  },
  {
    text: "Sortiert die Gruppe danach, wen ihr als Erstes anruft, wenn ihr eine Leiche im Keller habt.",
    type: "ranking",
    config: {},
  },
  {
    text: "Sortiert die Gruppe danach, wer am schlechtesten lügen kann — von Glasgesicht bis Profi-Bluffer.",
    type: "ranking",
    config: {},
  },
  {
    text: "Sortiert die Gruppe danach, wer am meisten Geheimnisse vor den anderen hat.",
    type: "ranking",
    config: {},
  },
  {
    text: "Sortiert die Gruppe: Wer hat den besten Kleidungsstil — von Fashion Icon bis Jogginghosen-Leiche?",
    type: "ranking",
    config: {},
  },
  {
    text: "Sortiert die Gruppe danach, wer am ehesten mal viral geht — von Internet-Fame bis digitaler Geist.",
    type: "ranking",
    config: {},
  },
];
