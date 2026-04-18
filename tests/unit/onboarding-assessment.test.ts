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
    expect(result.cefrLevel).toBe("A1");
    expect(result.assessedTiers).toEqual(["foundation"]);
  });

  it("returns advanced placement for high multi-skill performance", () => {
    const answers = onboardingQuestions.map((question) => question.answer);
    const result = assessOnboarding(answers);

    expect(result.placementScore).toBe(100);
    expect(result.placementBand).toBe("advanced");
    expect(result.forceKanaPath).toBe(false);
    expect(result.focusSkills).toContain("listening");
    expect(result.cefrLevel).toBe("C1");
    expect(result.suggestedJlptLevel).toBe("N1");
    expect(result.assessedTiers).toEqual(["foundation", "core", "stretch"]);
  });

  it("surfaces weak skills in priority order for targeted study", () => {
    const answers = onboardingQuestions.map((question) => question.answer);
    answers[0] = "";
    answers[2] = "";
    answers[5] = "";

    const result = assessOnboarding(answers);
    expect(result.focusSkills[0]).toBe("grammar");
    expect(result.focusSkills).toContain("kana");
    expect(result.focusSkills).toContain("grammar");
    expect(result.recommendation).toContain("Adaptive plan");
  });

  it("stops at foundation tier when performance is too weak", () => {
    const answers = onboardingQuestions.map((question) => question.answer);
    answers[0] = "";
    answers[1] = "";
    answers[2] = "";
    answers[3] = "";
    answers[4] = "";
    answers[5] = "";

    const result = assessOnboarding(answers);
    expect(result.assessedTiers).toEqual(["foundation"]);
  });
});
