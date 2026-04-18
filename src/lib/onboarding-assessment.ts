export type DiagnosticSkill = "kana" | "vocabulary" | "grammar" | "reading" | "listening";

type OnboardingQuestion = {
  id: string;
  prompt: string;
  answer: string;
  skill: DiagnosticSkill;
};

type PlacementBand = "absolute-beginner" | "foundation" | "beginner" | "intermediate-plus";

type OnboardingAssessment = {
  placementScore: number;
  placementBand: PlacementBand;
  forceKanaPath: boolean;
  skillScores: Record<DiagnosticSkill, number>;
  focusSkills: DiagnosticSkill[];
  recommendation: string;
};

export const onboardingQuestions: OnboardingQuestion[] = [
  { id: "kana-1", prompt: "Read this kana: き", answer: "ki", skill: "kana" },
  { id: "vocab-1", prompt: "Meaning of 約束", answer: "promise", skill: "vocabulary" },
  { id: "grammar-1", prompt: "Choose particle: 駅__着いたら連絡してください。", answer: "に", skill: "grammar" },
  { id: "reading-1", prompt: "「会議は午後三時に延期された。」What time is the meeting now?", answer: "3pm", skill: "reading" },
  { id: "listening-1", prompt: "A says: 「資料は明日の朝までです。」Deadline?", answer: "tomorrow morning", skill: "listening" },
  { id: "grammar-2", prompt: "Choose grammar for unavoidable feeling: 眠くて___。", answer: "たまらない", skill: "grammar" },
  { id: "vocab-2", prompt: "Meaning of 傾向", answer: "trend", skill: "vocabulary" },
  { id: "reading-2", prompt: "「売上は先月比で5%増加した。」The change was?", answer: "5% increase", skill: "reading" },
];

const normalize = (value: string) => value.trim().toLowerCase().replaceAll(/\s+/g, " ");

const toPercent = (value: number, total: number) => (total === 0 ? 0 : Math.round((value / total) * 100));

const rankFocusSkills = (skillScores: Record<DiagnosticSkill, number>) =>
  (() => {
    const ordered = (Object.keys(skillScores) as DiagnosticSkill[]).sort((a, b) => skillScores[a] - skillScores[b]);
    const weakSkills = ordered.filter((skill) => skillScores[skill] < 80);
    if (weakSkills.length > 0) return weakSkills.slice(0, 3);
    return ["listening", "reading"];
  })();

const placementBandFromScore = (score: number): PlacementBand => {
  if (score < 35) return "absolute-beginner";
  if (score < 55) return "foundation";
  if (score < 75) return "beginner";
  return "intermediate-plus";
};

export const assessOnboarding = (answers: string[]): OnboardingAssessment => {
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
    skillTotals[question.skill] += 1;
    const userAnswer = normalize(answers[index] ?? "");
    if (userAnswer && userAnswer === normalize(question.answer)) {
      skillCorrect[question.skill] += 1;
    }
  });

  const totalCorrect = Object.values(skillCorrect).reduce((sum, value) => sum + value, 0);
  const placementScore = toPercent(totalCorrect, onboardingQuestions.length);
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
  const forceKanaPath = skillScores.kana < 50 || placementScore < 40;
  const focusSkills = rankFocusSkills(skillScores);
  const recommendation = `Adaptive plan: prioritize ${focusSkills.join(", ")} recovery and review daily for 7 days.`;

  return {
    placementScore,
    placementBand,
    forceKanaPath,
    skillScores,
    focusSkills,
    recommendation,
  };
};
