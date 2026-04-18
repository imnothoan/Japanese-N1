import fs from "node:fs";
import path from "node:path";

const [,, sourcePath, contentType, sourceName, sourceLicenseArg] = process.argv;

if (!sourcePath || !contentType || !sourceName) {
  console.error("Usage: node scripts/import-content.mjs <file.json> <content-type> <source-name> [source-license]");
  process.exit(1);
}

const approvedLicenseTokens = ["CC0", "CC BY", "CC-BY", "CC BY-SA", "CC-BY-SA", "EDRDG", "MIT"];
const sourceLicense = sourceLicenseArg ?? "Unknown";
const normalizedLicense = sourceLicense.trim().toUpperCase();
const licenseApproved = approvedLicenseTokens.some((token) => normalizedLicense.includes(token));

const normalizeText = (value) => (typeof value === "string" ? value.trim() : "");
const normalizeLevel = (value) => {
  const level = normalizeText(value).toUpperCase();
  return ["N5", "N4", "N3", "N2", "N1"].includes(level) ? level : "";
};

const normalizers = {
  kana: (row) => {
    const script = normalizeText(row.script).toLowerCase();
    const kana = normalizeText(row.kana);
    const romaji = normalizeText(row.romaji).toLowerCase();
    if (!["hiragana", "katakana"].includes(script) || !kana || !romaji) return null;
    return { script, kana, romaji };
  },
  vocabulary: (row) => {
    const term = normalizeText(row.term);
    const reading = normalizeText(row.reading);
    const meaning = normalizeText(row.meaning);
    const jlpt_level = normalizeLevel(row.jlpt_level);
    if (!term || !meaning || !jlpt_level) return null;
    return { term, reading, meaning, jlpt_level, tags: Array.isArray(row.tags) ? row.tags : [] };
  },
  kanji: (row) => {
    const character = normalizeText(row.character);
    const onyomi = normalizeText(row.onyomi);
    const kunyomi = normalizeText(row.kunyomi);
    const meaning = normalizeText(row.meaning);
    const jlpt_level = normalizeLevel(row.jlpt_level);
    if (!character || !meaning || !jlpt_level) return null;
    return { character, onyomi, kunyomi, meaning, jlpt_level };
  },
  grammar: (row) => {
    const pattern = normalizeText(row.pattern);
    const meaning = normalizeText(row.meaning);
    const explanation = normalizeText(row.explanation);
    const jlpt_level = normalizeLevel(row.jlpt_level);
    if (!pattern || !meaning || !explanation || !jlpt_level) return null;
    return { pattern, meaning, explanation, jlpt_level };
  },
  reading: (row) => {
    const title = normalizeText(row.title);
    const content = normalizeText(row.content);
    const jlpt_level = normalizeLevel(row.jlpt_level);
    if (!title || !content || !jlpt_level) return null;
    return { title, content, jlpt_level, questions: Array.isArray(row.questions) ? row.questions : [] };
  },
  listening: (row) => {
    const title = normalizeText(row.title);
    const transcript = normalizeText(row.transcript);
    const audio_url = normalizeText(row.audio_url);
    const jlpt_level = normalizeLevel(row.jlpt_level);
    if (!title || !transcript || !jlpt_level) return null;
    return { title, transcript, audio_url, jlpt_level, questions: Array.isArray(row.questions) ? row.questions : [] };
  },
};

if (!normalizers[contentType]) {
  console.error(`Unsupported content type: ${contentType}`);
  process.exit(1);
}

const payload = JSON.parse(fs.readFileSync(path.resolve(sourcePath), "utf-8"));
if (!Array.isArray(payload)) {
  console.error("Input must be an array of records.");
  process.exit(1);
}

const stats = {
  sourceName,
  sourcePath: path.resolve(sourcePath),
  contentType,
  totalRecords: payload.length,
  acceptedRecords: 0,
  missingRequired: 0,
  duplicateCollisions: 0,
  license: sourceLicense,
  licenseApproved,
  qualityScore: 0,
  qualityGatePassed: false,
  byLevel: {},
};

const seen = new Set();
const rows = [];

for (const row of payload) {
  const normalized = normalizers[contentType](row);
  if (!normalized) {
    stats.missingRequired += 1;
    continue;
  }
  const key = JSON.stringify(normalized);
  if (seen.has(key)) {
    stats.duplicateCollisions += 1;
    continue;
  }
  seen.add(key);
  rows.push(normalized);
  if (normalized.jlpt_level) {
    stats.byLevel[normalized.jlpt_level] = (stats.byLevel[normalized.jlpt_level] ?? 0) + 1;
  }
}

stats.acceptedRecords = rows.length;
if (!licenseApproved) {
  stats.acceptedRecords = 0;
}

const qualityScore = (() => {
  if (stats.totalRecords === 0) return 0;
  const missingPenalty = Math.round((stats.missingRequired / stats.totalRecords) * 50);
  const duplicatePenalty = Math.round((stats.duplicateCollisions / stats.totalRecords) * 20);
  const levelPenalty = Object.keys(stats.byLevel).length === 0 ? 10 : 0;
  const licensePenalty = licenseApproved ? 0 : 60;
  return Math.max(0, 100 - missingPenalty - duplicatePenalty - levelPenalty - licensePenalty);
})();
stats.qualityScore = qualityScore;
stats.qualityGatePassed = stats.licenseApproved && (stats.acceptedRecords / Math.max(1, stats.totalRecords)) >= 0.6 && stats.qualityScore >= 70;

const outputDir = path.resolve("data/import");
const reportDir = path.resolve("data/reports");
fs.mkdirSync(outputDir, { recursive: true });
fs.mkdirSync(reportDir, { recursive: true });

const acceptedRows = licenseApproved ? rows : [];
const ndjsonOutput = acceptedRows.map((row) => JSON.stringify(row)).join("\n");
const outputPath = path.resolve(outputDir, `${contentType}.ndjson`);
const reportPath = path.resolve(reportDir, `${contentType}-${sourceName.toLowerCase().replaceAll(/\s+/g, "-")}.json`);

fs.writeFileSync(outputPath, ndjsonOutput + (ndjsonOutput.length ? "\n" : ""));
fs.writeFileSync(reportPath, `${JSON.stringify(stats, null, 2)}\n`);

console.log(`Prepared ${acceptedRows.length}/${payload.length} records for ${contentType} at ${outputPath}`);
if (!licenseApproved) {
  console.warn(`Blocked import because source license is not approved: ${sourceLicense}`);
}
console.log(`Quality gate: ${stats.qualityGatePassed ? "PASS" : "FAIL"} (score=${stats.qualityScore})`);
console.log(`Validation report written to ${reportPath}`);
