import { mapJlptToCefr, type CefrLevel, type JlptLevel } from "@/lib/jlpt-cefr";

export type SkillName = "vocabulary" | "kanji" | "grammar" | "reading" | "listening";

export type SkillAttempt = {
  module: string;
  jlpt_level: JlptLevel;
  score: number;
  total: number;
};

type SkillLevelSummary = {
  jlptLevel: JlptLevel;
  cefrLevel: CefrLevel;
  attempts: number;
  accuracy: number;
};

export type SkillProgressCard = {
  skill: SkillName;
  attempts: number;
  accuracy: number;
  cefrBand: CefrLevel;
  levels: SkillLevelSummary[];
};

const skills: SkillName[] = ["vocabulary", "kanji", "grammar", "reading", "listening"];
const levelWeight: Record<JlptLevel, number> = { N5: 1, N4: 2, N3: 3, N2: 4, N1: 5 };

const calculatePercentage = (numerator: number, denominator: number) => (denominator > 0 ? Math.round((numerator / denominator) * 100) : 0);

const asSkill = (value: string): SkillName | null => {
  if (skills.includes(value as SkillName)) return value as SkillName;
  return null;
};

const pickCefrBand = (levels: SkillLevelSummary[]): CefrLevel => {
  if (!levels.length) return "A1";
  const weightedScore = levels.reduce((sum, row) => sum + (levelWeight[row.jlptLevel] * row.attempts), 0);
  const totalWeight = levels.reduce((sum, row) => sum + row.attempts, 0);
  const avg = totalWeight ? weightedScore / totalWeight : 1;
  if (avg >= 4.5) return "C1";
  if (avg >= 3.5) return "B2";
  if (avg >= 2.5) return "B1";
  if (avg >= 1.5) return "A2";
  return "A1";
};

export const summarizeSkillProgress = (attempts: SkillAttempt[]): SkillProgressCard[] => {
  const grouped = new Map<SkillName, SkillAttempt[]>();

  for (const attempt of attempts) {
    const skill = asSkill(attempt.module);
    if (!skill || !attempt.total) continue;
    const existing = grouped.get(skill) ?? [];
    existing.push(attempt);
    grouped.set(skill, existing);
  }

  return skills.map((skill) => {
    const rows = grouped.get(skill) ?? [];
    const correct = rows.reduce((sum, row) => sum + row.score, 0);
    const total = rows.reduce((sum, row) => sum + row.total, 0);

    const levels = (["N1", "N2", "N3", "N4", "N5"] as JlptLevel[])
      .map((level) => {
        const levelRows = rows.filter((row) => row.jlpt_level === level);
        if (!levelRows.length) return null;
        const levelCorrect = levelRows.reduce((sum, row) => sum + row.score, 0);
        const levelTotal = levelRows.reduce((sum, row) => sum + row.total, 0);
        return {
          jlptLevel: level,
          cefrLevel: mapJlptToCefr(level),
          attempts: levelRows.length,
          accuracy: calculatePercentage(levelCorrect, levelTotal),
        };
      })
      .filter((value): value is SkillLevelSummary => Boolean(value));

    return {
      skill,
      attempts: rows.length,
      accuracy: calculatePercentage(correct, total),
      cefrBand: pickCefrBand(levels),
      levels,
    };
  });
};
