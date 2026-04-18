export type ContentType = "kana" | "vocabulary" | "kanji" | "grammar" | "reading" | "listening";

type NormalizationReport = {
  total: number;
  accepted: number;
  missingRequired: number;
  duplicates: number;
  licenseApproved: boolean;
  qualityScore: number;
  qualityGatePassed: boolean;
  byLevel: Partial<Record<"N5" | "N4" | "N3" | "N2" | "N1", number>>;
};

type NormalizedRecord = Record<string, unknown>;

const normalizeText = (value: unknown) => (typeof value === "string" ? value.trim() : "");

const normalizeLevel = (value: unknown) => {
  const level = normalizeText(value).toUpperCase();
  if (["N5", "N4", "N3", "N2", "N1"].includes(level)) return level as "N5" | "N4" | "N3" | "N2" | "N1";
  return "";
};

const normalizeVocabulary = (input: Record<string, unknown>) => {
  const term = normalizeText(input.term);
  const reading = normalizeText(input.reading);
  const meaning = normalizeText(input.meaning);
  const jlpt_level = normalizeLevel(input.jlpt_level);
  if (!term || !meaning || !jlpt_level) return null;
  return { term, reading, meaning, jlpt_level, tags: Array.isArray(input.tags) ? input.tags : [] };
};

const normalizeKanji = (input: Record<string, unknown>) => {
  const character = normalizeText(input.character);
  const meaning = normalizeText(input.meaning);
  const onyomi = normalizeText(input.onyomi);
  const kunyomi = normalizeText(input.kunyomi);
  const jlpt_level = normalizeLevel(input.jlpt_level);
  if (!character || !meaning || !jlpt_level) return null;
  return { character, meaning, onyomi, kunyomi, jlpt_level };
};

const normalizeGrammar = (input: Record<string, unknown>) => {
  const pattern = normalizeText(input.pattern);
  const meaning = normalizeText(input.meaning);
  const explanation = normalizeText(input.explanation);
  const jlpt_level = normalizeLevel(input.jlpt_level);
  if (!pattern || !meaning || !explanation || !jlpt_level) return null;
  return { pattern, meaning, explanation, jlpt_level };
};

const normalizeReading = (input: Record<string, unknown>) => {
  const title = normalizeText(input.title);
  const content = normalizeText(input.content);
  const jlpt_level = normalizeLevel(input.jlpt_level);
  const questions = Array.isArray(input.questions) ? input.questions : [];
  if (!title || !content || !jlpt_level) return null;
  return { title, content, jlpt_level, questions };
};

const normalizeListening = (input: Record<string, unknown>) => {
  const title = normalizeText(input.title);
  const transcript = normalizeText(input.transcript);
  const audio_url = normalizeText(input.audio_url);
  const jlpt_level = normalizeLevel(input.jlpt_level);
  const questions = Array.isArray(input.questions) ? input.questions : [];
  if (!title || !transcript || !jlpt_level) return null;
  return { title, transcript, audio_url, jlpt_level, questions };
};

const normalizeKana = (input: Record<string, unknown>) => {
  const script = normalizeText(input.script).toLowerCase();
  const kana = normalizeText(input.kana);
  const romaji = normalizeText(input.romaji).toLowerCase();
  if (!["hiragana", "katakana"].includes(script) || !kana || !romaji) return null;
  return { script, kana, romaji };
};

const normalizers: Record<ContentType, (input: Record<string, unknown>) => NormalizedRecord | null> = {
  kana: normalizeKana,
  vocabulary: normalizeVocabulary,
  kanji: normalizeKanji,
  grammar: normalizeGrammar,
  reading: normalizeReading,
  listening: normalizeListening,
};

const approvedLicenseTokens = [
  "CC0",
  "CC BY",
  "CC-BY",
  "CC BY-SA",
  "CC-BY-SA",
  "EDRDG",
  "MIT",
];

const isOpenLicenseApproved = (license?: string) => {
  if (!license) return true;
  const normalized = license.trim().toUpperCase();
  return approvedLicenseTokens.some((token) => normalized.includes(token));
};

const toQualityScore = (report: Pick<NormalizationReport, "total" | "missingRequired" | "duplicates" | "licenseApproved" | "byLevel">) => {
  if (report.total === 0) return 0;
  const missingPenalty = Math.round((report.missingRequired / report.total) * 50);
  const duplicatePenalty = Math.round((report.duplicates / report.total) * 20);
  const levelCount = Object.keys(report.byLevel).length;
  const levelPenalty = levelCount === 0 ? 10 : 0;
  const licensePenalty = report.licenseApproved ? 0 : 60;
  return Math.max(0, 100 - missingPenalty - duplicatePenalty - levelPenalty - licensePenalty);
};

type NormalizeOptions = {
  sourceLicense?: string;
};

export const normalizeContentBatch = (contentType: ContentType, items: unknown[], options: NormalizeOptions = {}) => {
  const dedupe = new Set<string>();
  const rows: NormalizedRecord[] = [];
  const licenseApproved = isOpenLicenseApproved(options.sourceLicense);
  const report: NormalizationReport = {
    total: items.length,
    accepted: 0,
    missingRequired: 0,
    duplicates: 0,
    licenseApproved,
    qualityScore: 0,
    qualityGatePassed: false,
    byLevel: {},
  };

  if (!licenseApproved) {
    report.qualityScore = toQualityScore(report);
    report.qualityGatePassed = false;
    return { rows: [], report };
  }

  for (const rawItem of items) {
    if (!rawItem || typeof rawItem !== "object") {
      report.missingRequired += 1;
      continue;
    }

    const normalized = normalizers[contentType](rawItem as Record<string, unknown>);
    if (!normalized) {
      report.missingRequired += 1;
      continue;
    }

    const dedupeKey = JSON.stringify(normalized);
    if (dedupe.has(dedupeKey)) {
      report.duplicates += 1;
      continue;
    }

    dedupe.add(dedupeKey);
    rows.push(normalized);

    const level = normalized.jlpt_level;
    if (typeof level === "string" && ["N5", "N4", "N3", "N2", "N1"].includes(level)) {
      report.byLevel[level as "N5" | "N4" | "N3" | "N2" | "N1"] = (report.byLevel[level as "N5" | "N4" | "N3" | "N2" | "N1"] ?? 0) + 1;
    }
  }

  report.accepted = rows.length;
  report.qualityScore = toQualityScore(report);
  const acceptanceRatio = report.total > 0 ? report.accepted / report.total : 0;
  report.qualityGatePassed = report.licenseApproved && acceptanceRatio >= 0.6 && report.qualityScore >= 70;
  return { rows, report };
};
