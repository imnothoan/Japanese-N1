export type ReviewGrade = "again" | "hard" | "good" | "easy";

export type Sm2State = {
  easinessFactor: number;
  interval: number;
  repetitions: number;
  lapses?: number;
  dueDate?: Date;
};

const gradeToQuality: Record<ReviewGrade, number> = {
  again: 1,
  hard: 3,
  good: 4,
  easy: 5,
};

// Mark as leech after this many accumulated failed repetitions.
const LEECH_THRESHOLD = 3;

const DAY_MS = 24 * 60 * 60 * 1000;

const getOverduePenalty = (state: Sm2State, now: Date) => {
  if (!state.dueDate) return 1;
  const overdueDays = Math.floor((now.getTime() - state.dueDate.getTime()) / DAY_MS);
  if (overdueDays <= 0) return 1;

  // Balance overdue debt without fully discarding stability.
  return Math.max(0.4, 1 - overdueDays / 90);
};

export const calculateNextReview = (state: Sm2State, grade: ReviewGrade, options?: { now?: Date }) => {
  const q = gradeToQuality[grade];
  const now = options?.now ?? new Date();
  const lapses = state.lapses ?? 0;

  if (q < 3) {
    return {
      easinessFactor: Math.max(1.3, state.easinessFactor - 0.2),
      interval: 1,
      repetitions: 0,
      lapses: lapses + 1,
      dueDate: new Date(now.getTime() + DAY_MS),
      isLeech: Math.max(lapses + 1, state.repetitions) >= LEECH_THRESHOLD,
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

  const overduePenalty = getOverduePenalty(state, now);
  nextInterval = Math.round(nextInterval * overduePenalty);

  return {
    easinessFactor: ef,
    interval: Math.max(1, nextInterval),
    repetitions: state.repetitions + 1,
    lapses,
    dueDate: new Date(now.getTime() + Math.max(1, nextInterval) * DAY_MS),
    isLeech: false,
  };
};
