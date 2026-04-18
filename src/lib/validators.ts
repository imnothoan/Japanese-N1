import { z } from "zod";

export const onboardingSchema = z.object({
  targetLevel: z.enum(["N3", "N2", "N1"]),
  targetExamDate: z.string(),
  dailyMinutes: z.number().min(15).max(600),
  preferredSchedule: z.enum(["morning", "afternoon", "evening", "mixed"]),
  placementScore: z.number().min(0).max(100),
});

export const reviewSubmissionSchema = z.object({
  reviewItemId: z.string().uuid(),
  grade: z.enum(["again", "hard", "good", "easy"]),
});

export const miningSchema = z.object({
  sourceText: z.string().min(1).max(5000),
  selectedTokens: z.array(z.string().min(1)).min(1),
});

export const quizSubmissionSchema = z.object({
  userId: z.string().uuid(),
  quizTemplateId: z.string().uuid().nullable().optional(),
  module: z.string().min(1).max(30),
  jlptLevel: z.enum(["N5", "N4", "N3", "N2", "N1"]),
  score: z.number().int().min(0),
  total: z.number().int().positive(),
  responses: z.array(z.object({
    question: z.string().min(1),
    chosen: z.string(),
    correct: z.string().min(1),
  })),
});

const mockActionSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("start"),
    userId: z.string().uuid(),
    mockTestId: z.string().uuid(),
  }),
  z.object({
    action: z.literal("pause"),
    userId: z.string().uuid(),
    attemptId: z.string().uuid(),
    remainingSeconds: z.number().int().nonnegative(),
    currentSection: z.string().min(1),
    sectionState: z.record(z.string(), z.unknown()),
    responses: z.record(z.string(), z.unknown()).default({}),
  }),
  z.object({
    action: z.literal("resume"),
    userId: z.string().uuid(),
    attemptId: z.string().uuid(),
  }),
  z.object({
    action: z.literal("submit_section"),
    userId: z.string().uuid(),
    attemptId: z.string().uuid(),
    sectionName: z.string().min(1),
    score: z.number().int().min(0),
    total: z.number().int().positive(),
    elapsedSeconds: z.number().int().nonnegative(),
  }),
  z.object({
    action: z.literal("finish"),
    userId: z.string().uuid(),
    attemptId: z.string().uuid(),
    totalScore: z.number().int().min(0),
    totalQuestions: z.number().int().nonnegative(),
    sectionScores: z.record(z.string(), z.number()),
  }),
]);

export const mockTestActionSchema = mockActionSchema;
