"use client";

import { supabase } from "@/lib/client";
import { onboardingSchema } from "@/lib/validators";

export const ensureSignedIn = async () => {
  const existing = await supabase.auth.getUser();
  if (existing.data.user) return existing.data.user;

  const { data, error } = await supabase.auth.signInAnonymously();
  if (error || !data.user) throw new Error(error?.message ?? "Unable to sign in");
  return data.user;
};

export const saveOnboarding = async (payload: unknown) => {
  const parsed = onboardingSchema.parse(payload);
  const user = await ensureSignedIn();
  const kanaMastered = parsed.placementScore >= 40;

  const { error: profileError } = await supabase
    .from("profiles")
    .upsert({ id: user.id, display_name: "Learner", kana_mastered: kanaMastered });

  if (profileError) throw profileError;

  const { error } = await supabase.from("study_goals").upsert({
    user_id: user.id,
    target_jlpt_level: parsed.targetLevel,
    target_exam_date: parsed.targetExamDate,
    daily_minutes: parsed.dailyMinutes,
    preferred_schedule: parsed.preferredSchedule,
  });

  if (error) throw error;

  await supabase.from("audit_events").insert({
    user_id: user.id,
    action: "onboarding_saved",
    entity_type: "study_goals",
    payload: parsed,
  });
};
