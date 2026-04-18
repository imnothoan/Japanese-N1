"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/app-shell";
import { supabase } from "@/lib/client";

export default function QuizPage() {
  const [selected, setSelected] = useState<Record<string, string>>({});
  const [result, setResult] = useState<string>("");

  const templates = useQuery({
    queryKey: ["quiz-templates"],
    queryFn: async () => {
      const { data, error } = await supabase.from("quiz_templates").select("*").limit(10);
      if (error) throw error;
      return data ?? [];
    },
  });

  const current = templates.data?.[0];
  const questions = (current?.questions as Array<{ id: string; prompt: string; options: string[]; answer: string }>) ?? [];

  const submit = async () => {
    const score = questions.reduce((sum, q) => sum + (selected[q.id] === q.answer ? 1 : 0), 0);
    const user = (await supabase.auth.getUser()).data.user;
    if (!user || !current) return;

    const session = await supabase.auth.getSession();
    await fetch("/api/quiz", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.data.session?.access_token ?? ""}`,
      },
      body: JSON.stringify({
        userId: user.id,
        quizTemplateId: current.id,
        module: current.module,
        jlptLevel: current.jlpt_level,
        score,
        total: questions.length,
        responses: questions.map((q) => ({
          question: q.prompt,
          chosen: selected[q.id] ?? "",
          correct: q.answer,
        })),
      }),
    });

    setResult(`${score}/${questions.length}`);
  };

  return (
    <AppShell title="Topic Quizzes">
      <section className="card p-4 space-y-3">
        <p className="text-sm">Timed drills and JLPT-style section quizzes.</p>
        {questions.map((q) => (
          <div key={q.id} className="rounded-lg border p-3">
            <p className="font-medium">{q.prompt}</p>
            <div className="mt-2 grid gap-2">
              {q.options.map((option) => (
                <button key={option} className="rounded-lg border px-3 py-2 text-left" onClick={() => setSelected((prev) => ({ ...prev, [q.id]: option }))}>
                  {option} {selected[q.id] === option ? "✓" : ""}
                </button>
              ))}
            </div>
          </div>
        ))}
        <button className="rounded-lg bg-blue-600 px-4 py-2 text-white" onClick={submit}>Submit quiz</button>
        {result ? <p>Score: {result}</p> : null}
      </section>
    </AppShell>
  );
}
