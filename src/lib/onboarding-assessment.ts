export type DiagnosticSkill = "kana" | "vocabulary" | "grammar" | "reading" | "listening";
import { mapCefrToJlpt, type CefrLevel, type JlptLevel } from "@/lib/jlpt-cefr";

type OnboardingQuestion = {
  id: string;
  prompt: string;
  answer: string;
  skill: DiagnosticSkill;
  tier: "foundation" | "core" | "stretch";
};

type PlacementBand = "absolute-beginner" | "foundation" | "beginner" | "intermediate-plus" | "advanced";

type OnboardingAssessment = {
  placementScore: number;
  placementBand: PlacementBand;
  cefrLevel: CefrLevel;
  suggestedJlptLevel: JlptLevel;
  forceKanaPath: boolean;
  skillScores: Record<DiagnosticSkill, number>;
  focusSkills: DiagnosticSkill[];
  assessedTiers: Array<"foundation" | "core" | "stretch">;
  recommendation: string;
};

export const onboardingQuestions: OnboardingQuestion[] = [
  { id: "kana-1", prompt: "Read this kana: き", answer: "ki", skill: "kana", tier: "foundation" },
  { id: "vocab-1", prompt: "Meaning of 約束", answer: "promise", skill: "vocabulary", tier: "foundation" },
  { id: "grammar-1", prompt: "Choose particle: 駅__着いたら連絡してください。", answer: "に", skill: "grammar", tier: "foundation" },
  { id: "reading-1", prompt: "「会議は午後三時に延期された。」What time is the meeting now?", answer: "3pm", skill: "reading", tier: "foundation" },
  { id: "listening-1", prompt: "A says: 「資料は明日の朝までです。」Deadline?", answer: "tomorrow morning", skill: "listening", tier: "foundation" },
  { id: "grammar-2", prompt: "Choose grammar for unavoidable feeling: 眠くて___。", answer: "たまらない", skill: "grammar", tier: "foundation" },
  { id: "vocab-2", prompt: "Meaning of 傾向", answer: "trend", skill: "vocabulary", tier: "core" },
  { id: "reading-2", prompt: "「売上は先月比で5%増加した。」The change was?", answer: "5% increase", skill: "reading", tier: "core" },
  { id: "kana-2", prompt: "Read this kana: ぴ", answer: "pi", skill: "kana", tier: "core" },
  { id: "listening-2", prompt: "A says: 「会場は一階から三階に変更です。」New floor?", answer: "third floor", skill: "listening", tier: "core" },
  { id: "grammar-3", prompt: "Choose grammar: 終電に間に合う__急いだ。", answer: "ように", skill: "grammar", tier: "core" },
  { id: "vocab-3", prompt: "Meaning of 妥当", answer: "reasonable", skill: "vocabulary", tier: "core" },
  { id: "reading-3", prompt: "「契約は自動更新される。」What happens if nothing is done?", answer: "it auto renews", skill: "reading", tier: "stretch" },
  { id: "listening-3", prompt: "A says: 「来週の会議は見送りになりました。」What happened to the meeting?", answer: "it was postponed", skill: "listening", tier: "stretch" },
  { id: "grammar-4", prompt: "Choose grammar: 彼の説明は分かり__。", answer: "かねる", skill: "grammar", tier: "stretch" },
  { id: "vocab-4", prompt: "Meaning of 乖離", answer: "gap", skill: "vocabulary", tier: "stretch" },
  { id: "kana-3", prompt: "Read this kana: づ", answer: "zu", skill: "kana", tier: "stretch" },
  { id: "reading-4", prompt: "「施策の実効性が問われる。」What is being questioned?", answer: "effectiveness of measures", skill: "reading", tier: "stretch" },
];

const normalize = (value: string) => value.trim().toLowerCase().replaceAll(/\s+/g, " ");

const toPercent = (value: number, total: number) => (total === 0 ? 0 : Math.round((value / total) * 100));

const rankFocusSkills = (skillScores: Record<DiagnosticSkill, number>) =>
  (() => {
    const ordered = (Object.keys(skillScores) as DiagnosticSkill[]).sort((a, b) => skillScores[a] - skillScores[b]);
    const weakSkills = ordered.filter((skill) => skillScores[skill] < 80);
    if (weakSkills.length > 0) return weakSkills.slice(0, 3);
    return ["listening", "reading"] as DiagnosticSkill[];
  })();

const placementBandFromScore = (score: number): PlacementBand => {
  if (score < 30) return "absolute-beginner";
  if (score < 50) return "foundation";
  if (score < 70) return "beginner";
  if (score < 85) return "intermediate-plus";
  return "advanced";
};

const cefrFromBand = (band: PlacementBand): CefrLevel => {
  if (band === "absolute-beginner") return "A1";
  if (band === "foundation") return "A2";
  if (band === "beginner") return "B1";
  if (band === "intermediate-plus") return "B2";
  return "C1";
};

const allowedTiers = (answers: string[]) => {
  const unlocked: Array<"foundation" | "core" | "stretch"> = ["foundation"];

  const scoreByTier = (tier: "foundation" | "core" | "stretch") => {
    const tierQuestions = onboardingQuestions.filter((question) => question.tier === tier);
    let correct = 0;
    tierQuestions.forEach((question) => {
      const index = onboardingQuestions.findIndex((q) => q.id === question.id);
      const userAnswer = normalize(answers[index] ?? "");
      if (userAnswer && userAnswer === normalize(question.answer)) correct += 1;
    });
    return toPercent(correct, tierQuestions.length);
  };

  const foundationScore = scoreByTier("foundation");
  if (foundationScore >= 50) unlocked.push("core");

  const coreScore = scoreByTier("core");
  if (unlocked.includes("core") && coreScore >= 65) unlocked.push("stretch");

  return unlocked;
};

export const assessOnboarding = (answers: string[]): OnboardingAssessment => {
  const assessedTiers = allowedTiers(answers);

  const skillTotals: Record<DiagnosticSkill, number> = {
    kana: 0,
    vocabulary: 0,
    grammar: 0,
    reading: 0,
    listening: 0,
  };

  const skillCorrect: Record<DiagnosticSkill, number> = {
    kana: 0,
    vocabulary: 0,
    grammar: 0,
    reading: 0,
    listening: 0,
  };

  onboardingQuestions.forEach((question, index) => {
    if (!assessedTiers.includes(question.tier)) return;
    skillTotals[question.skill] += 1;
    const userAnswer = normalize(answers[index] ?? "");
    if (userAnswer && userAnswer === normalize(question.answer)) {
      skillCorrect[question.skill] += 1;
    }
  });

  const totalCorrect = Object.values(skillCorrect).reduce((sum, value) => sum + value, 0);
  const assessedQuestionCount = onboardingQuestions.filter((question) => assessedTiers.includes(question.tier)).length;
  const placementScore = toPercent(totalCorrect, assessedQuestionCount);
  const skillScores = (Object.keys(skillTotals) as DiagnosticSkill[]).reduce<Record<DiagnosticSkill, number>>((scores, skill) => {
    scores[skill] = toPercent(skillCorrect[skill], skillTotals[skill]);
    return scores;
  }, {
    kana: 0,
    vocabulary: 0,
    grammar: 0,
    reading: 0,
    listening: 0,
  });

  const placementBand = placementBandFromScore(placementScore);
  const cefrLevel = cefrFromBand(placementBand);
  const suggestedJlptLevel = mapCefrToJlpt(cefrLevel);
  const forceKanaPath = skillScores.kana < 60 || placementScore < 45;
  const focusSkills = rankFocusSkills(skillScores);
  const recommendation = `Adaptive plan: prioritize ${focusSkills.join(", ")} recovery, continue ${assessedTiers.join(" → ")} tier practice, and review daily for 7 days.`;

  return {
    placementScore,
    placementBand,
    cefrLevel,
    suggestedJlptLevel,
    forceKanaPath,
    skillScores,
    focusSkills,
    assessedTiers,
    recommendation,
  };
};
