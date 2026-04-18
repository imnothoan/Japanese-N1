"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { saveOnboarding } from "@/lib/user";

const questions = [
  { id: 1, prompt: "Read this kana: あ", answer: "a" },
  { id: 2, prompt: "Meaning of 学生", answer: "student" },
  { id: 3, prompt: "Choose particle for destination: 学校__行く", answer: "へ" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [targetLevel, setTargetLevel] = useState<"N3" | "N2" | "N1">("N2");
  const [targetExamDate, setTargetExamDate] = useState("");
  const [dailyMinutes, setDailyMinutes] = useState(60);
  const [preferredSchedule, setPreferredSchedule] = useState<"morning" | "afternoon" | "evening" | "mixed">("mixed");
  const [answers, setAnswers] = useState<string[]>(["", "", ""]);
  const [status, setStatus] = useState<string>("");

  const placementScore = useMemo(
    () => answers.reduce((sum, value, index) => sum + (value.trim().toLowerCase() === questions[index].answer ? 33 : 0), 0),
    [answers],
  );

  const onSubmit = async () => {
    setStatus("Saving...");
    try {
      await saveOnboarding({ targetLevel, targetExamDate, dailyMinutes, preferredSchedule, placementScore });
      setStatus("Saved. Redirecting...");
      router.push(placementScore < 40 ? "/learn/kana" : "/dashboard");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Failed");
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-4 p-4">
      <div className="card p-4 space-y-3">
        <h1 className="text-2xl font-semibold">Onboarding & Diagnostic</h1>
        <div className="grid gap-2 md:grid-cols-2">
          <label className="grid gap-1">Target JLPT
            <select className="rounded-lg border p-2" value={targetLevel} onChange={(e) => setTargetLevel(e.target.value as "N3" | "N2" | "N1")}>
              <option>N3</option><option>N2</option><option>N1</option>
            </select>
          </label>
          <label className="grid gap-1">Exam date
            <input type="date" className="rounded-lg border p-2" value={targetExamDate} onChange={(e) => setTargetExamDate(e.target.value)} />
          </label>
          <label className="grid gap-1">Daily minutes
            <input type="number" className="rounded-lg border p-2" value={dailyMinutes} onChange={(e) => setDailyMinutes(Number(e.target.value))} />
          </label>
          <label className="grid gap-1">Preferred schedule
            <select className="rounded-lg border p-2" value={preferredSchedule} onChange={(e) => setPreferredSchedule(e.target.value as "morning" | "afternoon" | "evening" | "mixed")}>
              <option value="morning">Morning</option><option value="afternoon">Afternoon</option><option value="evening">Evening</option><option value="mixed">Mixed</option>
            </select>
          </label>
        </div>
      </div>

      <div className="card p-4 space-y-2">
        <h2 className="text-xl font-semibold">Diagnostic Placement (adaptive short)</h2>
        {questions.map((q, index) => (
          <label key={q.id} className="grid gap-1 text-sm">
            {q.prompt}
            <input className="rounded-lg border p-2" value={answers[index]} onChange={(e) => setAnswers((prev) => prev.map((x, i) => (i === index ? e.target.value : x)))} />
          </label>
        ))}
        <p className="text-sm">Estimated placement: {placementScore >= 66 ? "N4+" : placementScore >= 33 ? "Beginner" : "Absolute beginner (Kana path required)"}</p>
        <button className="rounded-xl bg-blue-600 px-4 py-2 text-white" onClick={onSubmit}>Save onboarding</button>
        {status ? <p className="text-sm">{status}</p> : null}
      </div>
    </div>
  );
}
