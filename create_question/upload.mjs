#!/usr/bin/env node
// Uploads every JSON batch in create_question/questions/ into the Supabase
// `questions` table for every existing group. Idempotent: skips any question
// whose text already exists in that group.
//
// Usage (from repo root):
//   node --env-file=.env.local create_question/upload.mjs
//
// Required env vars: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY

import { readdir, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { createClient } from "@supabase/supabase-js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const BATCH_DIR = join(__dirname, "questions");

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. " +
      "Run with: node --env-file=.env.local create_question/upload.mjs"
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

// Maps the human-readable JSON pool format to the DB row shape used by
// src/lib/default-questions.ts and the questions table.
function toDbRow(q) {
  switch (q.type) {
    case "FREITEXT":
      return { text: q.question, type: "text", config: {} };
    case "SKALA":
      return {
        text: q.question,
        type: "scale",
        config: { min: 1, max: q.scale_max ?? 10 },
      };
    case "POLL":
      return {
        text: q.question,
        type: "poll",
        config: { options_type: "members" },
      };
    case "TEAM_SPLIT":
      if (!Array.isArray(q.team_labels) || q.team_labels.length !== 2) {
        throw new Error(
          `TEAM_SPLIT needs team_labels of length 2: ${JSON.stringify(q)}`
        );
      }
      return {
        text: q.question,
        type: "team_split",
        config: { team_labels: q.team_labels },
      };
    case "RANKING":
      return { text: q.question, type: "ranking", config: {} };
    default:
      throw new Error(`Unknown question type: ${q.type}`);
  }
}

async function loadBatches() {
  const files = (await readdir(BATCH_DIR))
    .filter((f) => f.endsWith(".json"))
    .sort();

  const all = [];
  for (const file of files) {
    const raw = await readFile(join(BATCH_DIR, file), "utf8");
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      throw new Error(`${file} is not a JSON array`);
    }
    for (const q of parsed) all.push({ ...toDbRow(q), _source: file });
  }
  return all;
}

async function main() {
  const newQuestions = await loadBatches();
  if (newQuestions.length === 0) {
    console.log("No batch files found in create_question/questions/. Nothing to do.");
    return;
  }
  console.log(
    `Loaded ${newQuestions.length} question(s) from ${BATCH_DIR}.`
  );

  const { data: groups, error: groupErr } = await supabase
    .from("groups")
    .select("id, name");
  if (groupErr) throw groupErr;

  if (!groups || groups.length === 0) {
    console.log("No groups in the DB — nothing to insert into.");
    return;
  }

  let totalInserted = 0;
  let totalSkipped = 0;

  for (const group of groups) {
    const { data: existing, error: existErr } = await supabase
      .from("questions")
      .select("text")
      .eq("group_id", group.id);
    if (existErr) throw existErr;

    const seen = new Set((existing ?? []).map((r) => r.text));

    const rows = newQuestions
      .filter((q) => !seen.has(q.text))
      .map(({ _source, ...q }) => ({
        ...q,
        group_id: group.id,
        // Pool questions: NULL created_by + NULL scheduled_date so the
        // cron picks them up via its unscheduled rotation.
      }));

    const skipped = newQuestions.length - rows.length;

    if (rows.length === 0) {
      console.log(
        `  ${group.name}: 0 inserted, ${skipped} already present`
      );
      totalSkipped += skipped;
      continue;
    }

    const { error: insertErr } = await supabase
      .from("questions")
      .insert(rows);
    if (insertErr) throw insertErr;

    console.log(
      `  ${group.name}: ${rows.length} inserted, ${skipped} already present`
    );
    totalInserted += rows.length;
    totalSkipped += skipped;
  }

  console.log(
    `\nDone. Inserted ${totalInserted} row(s) across ${groups.length} group(s); ` +
      `skipped ${totalSkipped} duplicate(s).`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
