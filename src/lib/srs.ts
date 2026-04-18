export type ReviewGrade = "again" | "hard" | "good" | "easy";

export type Sm2State = {
  easinessFactor: number;
  interval: number;
  repetitions: number;
};

const gradeToQuality: Record<ReviewGrade, number> = {
  again: 1,
  hard: 3,
  good: 4,
  easy: 5,
};

export const calculateNextReview = (state: Sm2State, grade: ReviewGrade) => {
  const q = gradeToQuality[grade];

  if (q < 3) {
    return {
      easinessFactor: Math.max(1.3, state.easinessFactor - 0.2),
      interval: 1,
      repetitions: 0,
      dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
      isLeech: state.repetitions >= 3,
    };
  }

  const ef = Math.max(
    1.3,
    state.easinessFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)),
  );

  let nextInterval = 1;
  if (state.repetitions === 0) nextInterval = 1;
  else if (state.repetitions === 1) nextInterval = 6;
  else nextInterval = Math.round(state.interval * ef * (grade === "easy" ? 1.3 : grade === "hard" ? 0.8 : 1));

  return {
    easinessFactor: ef,
    interval: Math.max(1, nextInterval),
    repetitions: state.repetitions + 1,
    dueDate: new Date(Date.now() + Math.max(1, nextInterval) * 24 * 60 * 60 * 1000),
    isLeech: false,
  };
};
