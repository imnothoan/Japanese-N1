"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { assessOnboarding, onboardingQuestions } from "@/lib/onboarding-assessment";
import { saveOnboarding } from "@/lib/user";

export default function OnboardingPage() {
  const router = useRouter();
  const minExamDate = new Date().toISOString().slice(0, 10);
  const [targetLevel, setTargetLevel] = useState<"N3" | "N2" | "N1">("N2");
  const [targetExamDate, setTargetExamDate] = useState("");
  const [dailyMinutes, setDailyMinutes] = useState(60);
  const [preferredSchedule, setPreferredSchedule] = useState<"morning" | "afternoon" | "evening" | "mixed">("mixed");
  const [answers, setAnswers] = useState<string[]>(() => onboardingQuestions.map(() => ""));
  const [status, setStatus] = useState<string>("");

  const assessment = useMemo(() => assessOnboarding(answers), [answers]);

  const onSubmit = async () => {
    setStatus("Saving...");
    try {
      await saveOnboarding({ targetLevel, targetExamDate, dailyMinutes, preferredSchedule, placementScore: assessment.placementScore });
      setStatus("Saved. Redirecting...");
      router.push(assessment.forceKanaPath ? "/learn/kana" : "/dashboard");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Failed");
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-4 p-4">
      <div className="card p-4 space-y-3">
        <h1 className="text-2xl font-semibold">Onboarding & Diagnostic</h1>
        <div className="grid gap-2 md:grid-cols-2">
          <label className="grid gap-1" htmlFor="target-level">Target JLPT
            <select id="target-level" className="rounded-lg border p-2" value={targetLevel} onChange={(e) => setTargetLevel(e.target.value as "N3" | "N2" | "N1")}>
              <option>N3</option><option>N2</option><option>N1</option>
            </select>
          </label>
          <label className="grid gap-1" htmlFor="exam-date">Exam date
            <input id="exam-date" type="date" min={minExamDate} className="rounded-lg border p-2" value={targetExamDate} onChange={(e) => setTargetExamDate(e.target.value)} />
          </label>
          <label className="grid gap-1" htmlFor="daily-minutes">Daily minutes
            <input id="daily-minutes" type="number" className="rounded-lg border p-2" value={dailyMinutes} onChange={(e) => setDailyMinutes(Number(e.target.value))} />
          </label>
          <label className="grid gap-1" htmlFor="preferred-schedule">Preferred schedule
            <select id="preferred-schedule" className="rounded-lg border p-2" value={preferredSchedule} onChange={(e) => setPreferredSchedule(e.target.value as "morning" | "afternoon" | "evening" | "mixed")}>
              <option value="morning">Morning</option><option value="afternoon">Afternoon</option><option value="evening">Evening</option><option value="mixed">Mixed</option>
            </select>
          </label>
        </div>
      </div>

      <div className="card p-4 space-y-2">
        <h2 className="text-xl font-semibold">Diagnostic Placement (multi-tier adaptive)</h2>
        {onboardingQuestions.map((question, index) => (
          <label key={question.id} className="grid gap-1 text-sm" htmlFor={question.id}>
            <span>{question.prompt}</span>
            <span className="text-xs opacity-70">Tier: {question.tier}</span>
            <input id={question.id} className="rounded-lg border p-2" value={answers[index]} onChange={(e) => setAnswers((prev) => prev.map((x, i) => (i === index ? e.target.value : x)))} />
          </label>
        ))}
        <p className="text-sm">Estimated placement: {assessment.placementBand} ({assessment.placementScore}%)</p>
        <p className="text-sm">Estimated CEFR/JLPT: {assessment.cefrLevel} / {assessment.suggestedJlptLevel}</p>
        <p className="text-sm">Assessed tiers: {assessment.assessedTiers.join(" → ")}</p>
        <p className="text-sm">Focus next: {assessment.focusSkills.join(", ")}</p>
        <p className="text-xs opacity-80">{assessment.recommendation}</p>
        <button className="rounded-xl bg-blue-600 px-4 py-2 text-white" onClick={onSubmit}>Save onboarding</button>
        {status ? <p className="text-sm">{status}</p> : null}
      </div>
    </div>
  );
}
