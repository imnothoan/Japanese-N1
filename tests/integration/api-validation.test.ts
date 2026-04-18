import { describe, expect, it } from "vitest";
import { mockTestActionSchema, quizSubmissionSchema } from "@/lib/validators";

describe("API validation schemas", () => {
  it("accepts valid quiz submission payload", () => {
    const parsed = quizSubmissionSchema.safeParse({
      userId: "550e8400-e29b-41d4-a716-446655440000",
      quizTemplateId: null,
      module: "grammar",
      jlptLevel: "N3",
      score: 8,
      total: 10,
      responses: [{ question: "q1", chosen: "A", correct: "B" }],
    });
    expect(parsed.success).toBe(true);
  });

  it("accepts mock section submission action payload", () => {
    const parsed = mockTestActionSchema.safeParse({
      action: "submit_section",
      userId: "550e8400-e29b-41d4-a716-446655440000",
      attemptId: "550e8400-e29b-41d4-a716-446655440001",
      sectionName: "Reading",
      score: 5,
      total: 10,
      elapsedSeconds: 600,
    });
    expect(parsed.success).toBe(true);
  });
});
