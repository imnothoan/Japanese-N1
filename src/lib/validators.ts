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
