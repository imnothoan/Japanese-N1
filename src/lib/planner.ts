export type DailyTaskType = "review" | "weak-skill" | "exam-prep";

export type DailyPlanTask = {
  title: string;
  taskType: DailyTaskType;
  priority: number;
  estimatedMinutes: number;
};

type PlannerInput = {
  dueReviews: number;
  weakSkills: string[];
  targetExamDate?: string;
};

type ReadinessInput = {
  targetLevel: "N3" | "N2" | "N1";
  rollingAccuracy: number;
  completionRate: number;
  mockAverage: number;
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export const buildDailyPlan = (input: PlannerInput): DailyPlanTask[] => {
  const tasks: DailyPlanTask[] = [];

  if (input.dueReviews > 0) {
    tasks.push({
      title: `Complete ${input.dueReviews} due reviews`,
      taskType: "review",
      priority: 1,
      estimatedMinutes: clamp(input.dueReviews * 2, 10, 60),
    });
  }

  for (const skill of input.weakSkills.slice(0, 2)) {
    tasks.push({
      title: `Targeted ${skill} recovery quiz`,
      taskType: "weak-skill",
      priority: 2,
      estimatedMinutes: 20,
    });
  }

  if (input.targetExamDate) {
    const daysLeft = Math.ceil((new Date(input.targetExamDate).getTime() - Date.now()) / (24 * 60 * 60 * 1000));
    if (daysLeft <= 60) {
      tasks.push({
        title: "Timed exam section practice",
        taskType: "exam-prep",
        priority: 3,
        estimatedMinutes: daysLeft <= 30 ? 45 : 30,
      });
    }
  }

  return tasks.sort((a, b) => a.priority - b.priority);
};

export const estimateReadiness = (input: ReadinessInput) => {
  const weighted = (input.rollingAccuracy * 0.45) + (input.completionRate * 0.2) + (input.mockAverage * 0.35);
  const levelPenalty = input.targetLevel === "N1" ? 0.92 : input.targetLevel === "N2" ? 0.96 : 1;
  const score = Math.round(clamp(weighted * levelPenalty * 100, 0, 100));

  return {
    score,
    label: `Estimated readiness for ${input.targetLevel}: ${score}% (estimate, not guarantee)`,
  };
};
