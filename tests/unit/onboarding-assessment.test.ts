import { describe, expect, it } from "vitest";
import { assessOnboarding, onboardingQuestions } from "@/lib/onboarding-assessment";

describe("assessOnboarding", () => {
  it("returns absolute beginner placement when core foundations are weak", () => {
    const answers = onboardingQuestions.map(() => "");
    const result = assessOnboarding(answers);

    expect(result.placementScore).toBe(0);
    expect(result.placementBand).toBe("absolute-beginner");
    expect(result.forceKanaPath).toBe(true);
    expect(result.focusSkills).toContain("kana");
  });

  it("returns advanced placement for high multi-skill performance", () => {
    const answers = onboardingQuestions.map((question) => question.answer);
    const result = assessOnboarding(answers);

    expect(result.placementScore).toBe(100);
    expect(result.placementBand).toBe("intermediate-plus");
    expect(result.forceKanaPath).toBe(false);
    expect(result.focusSkills).toContain("listening");
  });

  it("surfaces weak skills in priority order for targeted study", () => {
    const answers = onboardingQuestions.map((question) => question.answer);
    answers[0] = "";
    answers[2] = "";
    answers[5] = "";

    const result = assessOnboarding(answers);
    expect(result.focusSkills[0]).toBe("kana");
    expect(result.focusSkills).toContain("grammar");
    expect(result.recommendation).toContain("Adaptive plan");
  });
});
