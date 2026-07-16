#!/usr/bin/env node
// Tiny local review app for the question pool: label questions good/bad,
// labels are saved to create_question/labels.json (keyed by question text).
//
// Usage (from repo root):
//   node create_question/review.mjs
// then open http://localhost:4321
//
// ponytail: node:http + one inline HTML page, no deps. If this ever needs
// auth/multi-user, move it into the Next.js app instead.

import { createServer } from "node:http";
import { readdir, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const BATCH_DIR = join(__dirname, "questions");
const LABELS_FILE = join(__dirname, "labels.json");
const PORT = 4321;

async function loadQuestions() {
  const sources = [["questions.json (seed)", join(__dirname, "..", "questions.json")]];
  for (const f of (await readdir(BATCH_DIR)).filter((f) => f.endsWith(".json")).sort()) {
    sources.push([f, join(BATCH_DIR, f)]);
  }
  const seen = new Set();
  const questions = [];
  for (const [name, path] of sources) {
    for (const q of JSON.parse(await readFile(path, "utf8"))) {
      if (seen.has(q.question)) continue;
      seen.add(q.question);
      questions.push({ ...q, source: name });
    }
  }
  return questions;
}

async function loadLabels() {
  try {
    return JSON.parse(await readFile(LABELS_FILE, "utf8"));
  } catch {
    return {};
  }
}

const HTML = `<!doctype html>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>FragUns Review</title>
<style>
  body { font-family: system-ui, sans-serif; max-width: 560px; margin: 40px auto; padding: 0 16px; background: #111; color: #eee; }
  .card { background: #1c1c1e; border-radius: 16px; padding: 32px 24px; min-height: 140px; display: flex; flex-direction: column; gap: 12px; }
  .meta { font-size: 12px; color: #888; display: flex; gap: 8px; }
  .badge { background: #333; border-radius: 6px; padding: 2px 8px; }
  .q { font-size: 20px; line-height: 1.4; }
  .labels { font-size: 13px; color: #aaa; }
  .btns { display: flex; gap: 12px; margin-top: 20px; }
  button { flex: 1; font-size: 16px; padding: 14px; border: 0; border-radius: 12px; cursor: pointer; color: #fff; }
  .bad { background: #b3261e; } .good { background: #2e7d32; } .skip { background: #333; flex: 0.5; }
  progress { width: 100%; margin-top: 16px; }
  .done { text-align: center; font-size: 18px; margin-top: 40px; }
  .hint { color: #666; font-size: 12px; text-align: center; margin-top: 12px; }
</style>
<div id="app"></div>
<script>
let questions = [], labels = {}, idx = 0;

async function load() {
  const d = await (await fetch("/data")).json();
  questions = d.questions; labels = d.labels;
  idx = questions.findIndex(q => !(q.question in labels));
  render();
}

async function label(value) {
  const q = questions[idx];
  labels[q.question] = { label: value, type: q.type, source: q.source };
  fetch("/label", { method: "POST", body: JSON.stringify({ question: q.question, label: value, type: q.type, source: q.source }) });
  next();
}

function next() {
  for (let i = idx + 1; i < questions.length; i++) {
    if (!(questions[i].question in labels)) { idx = i; return render(); }
  }
  idx = -1; render();
}

function render() {
  const total = questions.length, done = Object.keys(labels).length;
  const good = Object.values(labels).filter(l => l.label === "good").length;
  const app = document.getElementById("app");
  if (idx === -1 || done === total) {
    app.innerHTML = '<div class="done">Alles gelabelt 🎉<br><span class="labels">' + good + ' good / ' + (done - good) + ' bad</span></div>';
    return;
  }
  const q = questions[idx];
  app.innerHTML =
    '<div class="card"><div class="meta"><span class="badge">' + q.type + '</span><span>' + q.source + '</span></div>' +
    '<div class="q">' + q.question.replace(/</g, "&lt;") + '</div>' +
    (q.team_labels ? '<div class="labels">' + q.team_labels.join(" vs. ") + '</div>' : '') + '</div>' +
    '<div class="btns"><button class="bad" onclick="label(\\'bad\\')">👎 Bad</button>' +
    '<button class="skip" onclick="next()">Skip</button>' +
    '<button class="good" onclick="label(\\'good\\')">👍 Good</button></div>' +
    '<progress max="' + total + '" value="' + done + '"></progress>' +
    '<div class="hint">' + done + '/' + total + ' — Tasten: G = good, B = bad, S = skip</div>';
}

document.addEventListener("keydown", e => {
  if (idx === -1) return;
  if (e.key === "g") label("good");
  if (e.key === "b") label("bad");
  if (e.key === "s") next();
});
load();
</script>`;

const server = createServer(async (req, res) => {
  if (req.method === "GET" && req.url === "/") {
    res.writeHead(200, { "content-type": "text/html; charset=utf-8" }).end(HTML);
  } else if (req.method === "GET" && req.url === "/data") {
    const body = JSON.stringify({ questions: await loadQuestions(), labels: await loadLabels() });
    res.writeHead(200, { "content-type": "application/json" }).end(body);
  } else if (req.method === "POST" && req.url === "/label") {
    let raw = "";
    for await (const chunk of req) raw += chunk;
    const { question, ...rest } = JSON.parse(raw);
    const labels = await loadLabels();
    labels[question] = rest;
    await writeFile(LABELS_FILE, JSON.stringify(labels, null, 2) + "\n");
    res.writeHead(204).end();
  } else {
    res.writeHead(404).end();
  }
});

server.listen(PORT, () => {
  console.log(`Review app: http://localhost:${PORT}`);
});
