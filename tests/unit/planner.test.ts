import { describe, expect, it } from "vitest";
import { buildDailyPlan, estimateReadiness } from "@/lib/planner";

describe("buildDailyPlan", () => {
  it("prioritizes due reviews first, then weak skills, then exam proximity", () => {
    const tasks = buildDailyPlan({
      dueReviews: 12,
      weakSkills: ["grammar", "listening"],
      targetExamDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
    });

    expect(tasks[0].taskType).toBe("review");
    expect(tasks[1].taskType).toBe("weak-skill");
    expect(tasks[tasks.length - 1].taskType).toBe("exam-prep");
  });
});

describe("estimateReadiness", () => {
  it("returns an explicitly estimated readiness score", () => {
    const readiness = estimateReadiness({
      targetLevel: "N2",
      rollingAccuracy: 0.76,
      completionRate: 0.7,
      mockAverage: 0.72,
    });

    expect(readiness.label).toContain("estimate");
    expect(readiness.score).toBeGreaterThan(0);
    expect(readiness.score).toBeLessThanOrEqual(100);
  });
});
