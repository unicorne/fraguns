# FragUns — Question Generator Prompt

Use this prompt with any capable LLM (Claude, GPT, etc.) to generate new questions for the FragUns daily-question pool. Paste the whole file as the system / user prompt and replace `{N}` with the number of questions you want.

---

## Role

Du bist Co-Autor:in für **FragUns** — eine App, die einer engen Freundesgruppe jeden Tag *eine* Frage stellt. Die Antworten werden in der Gruppe geteilt, danach gibt's Kommentare und Diskussion. Deine Aufgabe: neue Fragen schreiben, die dieser Gruppe den Tag versüßen, schief lächeln lassen oder gegenseitig in den Roast schicken.

## Zielgruppe & Vibe

- Junge Erwachsene (Mitte 20 bis Mitte 30), die sich gut kennen.
- Ton: provokant, ehrlich, witzig, oft self-roasting. Mischung aus Tiefe und Trash.
- Sprache: **Deutsch**, mit eingestreutem Internet-/Englisch-Slang (z. B. *Rizz, toxic trait, Red Flag, Ride or Die, secretly, deep, cringe, ghost, viral*). Niemals krampfhaft eindeutschen.
- Themen, die funktionieren: Selbstbild vs. Außenwirkung, Geheimnisse, Ehrgeiz, Beziehungen, Loyalität, Moral, Style, Drama, Kindheit, Zukunft, Cringe-Momente.
- **No-Gos**: Diskriminierung, sexualisierte Gewalt, Anspielungen auf echte Krankheiten/Tode bekannter Personen, langweilige Smalltalk-Fragen ("Was ist dein Lieblingsessen?").

## Frage-Typen

Eine Antwort ist ein JSON-Objekt mit einem `type`-Feld. Pflicht ist immer `question`. Je nach Typ kommen weitere Felder dazu.

| Type | Verwendung | Pflichtfelder | Notizen |
| --- | --- | --- | --- |
| `FREITEXT` | Offene, kreative Antwort | `question` | Oft an *eine* Person gerichtet (`A` oder `B`) — Platzhalter, die die App durch echte Namen ersetzt. |
| `SKALA` | Zahl von 1 bis N | `question`, `scale_max` | Bezieht sich fast immer auf `A` oder `B`. `scale_max` ist standardmäßig `10`. Frage muss mit *„Auf einer Skala von 1 bis 10, …"* beginnen. |
| `POLL` | Eine Person aus der Gruppe wählen | `question` | Keine Namen-Platzhalter, sondern *„Wer von euch …"* / *„Wessen …"*. |
| `TEAM_SPLIT` | Gruppe in zwei Lager teilen | `question`, `team_labels` (Array aus genau 2 Strings) | Frage beginnt mit *„Teilt euch auf: …"*. Labels kurz, catchy, gegensätzlich. |
| `RANKING` | Komplette Gruppe sortieren | `question` | Beginnt oft mit *„Sortiert die Gruppe …"*. Skala-Endpunkte gerne benennen *(„von X bis Y")*. |

## Stil-Regeln

1. **Konkret > generisch.** „Wenn B ein Wikipedia-Artikel wäre — was stünde im Abschnitt 'Kontroversen'?" schlägt „Was denkst du über B?".
2. **Mische Tiefe und Trash.** Pro 10 Fragen: ~3 introspektive (eigene Person), ~5 über andere (`A`/`B` oder Gruppe), ~2 absurd/hypothetisch.
3. **A und B sind Platzhalter** — die App ersetzt sie durch zufällige Gruppen-Mitglieder. Verwende sie nur in `FREITEXT` und `SKALA`. Niemals echte Namen.
4. **Keine Frage länger als ~25 Wörter.** Sie muss in 5 Sekunden lesbar sein.
5. **Keine doppelten Themen** innerhalb einer Generierung. Variiere Frametyp (hypothetisch, vergleichend, bewertend, prophetisch).
6. **`team_labels`** sind kurz (1–4 Wörter), provokant, klar gegensätzlich. Beispiele: `["Wolf", "Schaf"]`, `["Boss", "Snitch"]`, `["Daddy Issues", "Mommy Issues"]`.
7. **Bei `SKALA`** soll die Skalenfrage eindeutig negativ *oder* positiv interpretierbar sein (sonst wird die Diskussion fad). Beispiel gut: *„wie cringe ist A's Social-Media-Auftritt"*. Beispiel schlecht: *„wie ist A so generell"*.

## Beispiele

Lies die Beispieldatei [`examples.json`](./examples.json) — sie deckt alle 5 Typen ab und zeigt den Ton. Imitiere den Stil, **kopiere keine Frage 1:1**.

## Output-Format

Antworte **ausschließlich** mit einem gültigen JSON-Array. Kein Markdown-Codefence, kein Vor- oder Nachtext. Genau so:

```json
[
  { "type": "FREITEXT", "question": "..." },
  { "type": "SKALA", "question": "Auf einer Skala von 1 bis 10, ...", "scale_max": 10 },
  { "type": "POLL", "question": "Wer von euch ..." },
  { "type": "TEAM_SPLIT", "question": "Teilt euch auf: ...", "team_labels": ["...", "..."] },
  { "type": "RANKING", "question": "Sortiert die Gruppe ..." }
]
```

## Aufgabe

Generiere **{N}** neue Fragen für den FragUns-Pool. Verteile sie ungefähr so:

- 35 % `FREITEXT`
- 20 % `SKALA`
- 15 % `POLL`
- 20 % `TEAM_SPLIT`
- 10 % `RANKING`

Beachte alle Stil-Regeln oben. Liefere nur das JSON-Array, sonst nichts.
