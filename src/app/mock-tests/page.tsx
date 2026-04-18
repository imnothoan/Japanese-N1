"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/app-shell";
import { supabase } from "@/lib/client";

export default function MockTestsPage() {
  const [status, setStatus] = useState("");
  const [activeAttemptId, setActiveAttemptId] = useState<string>("");
  const tests = useQuery({
    queryKey: ["mock-tests"],
    queryFn: async () => {
      const { data, error } = await supabase.from("mock_tests").select("*").limit(10);
      if (error) throw error;
      return data ?? [];
    },
  });

  const history = useQuery({
    queryKey: ["mock-tests-history"],
    queryFn: async () => {
      const session = await supabase.auth.getSession();
      const response = await fetch("/api/mock-tests", {
        headers: {
          Authorization: `Bearer ${session.data.session?.access_token ?? ""}`,
        },
      });
      if (!response.ok) return [];
      const payload = await response.json();
      return payload.attempts ?? [];
    },
  });

  const gate = useQuery({
    queryKey: ["kana-gate"],
    queryFn: async () => {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) return false;
      const { data } = await supabase.from("profiles").select("kana_mastered").eq("id", user.id).maybeSingle();
      return Boolean(data?.kana_mastered);
    },
  });

  const start = async (mockTestId: string) => {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) return;
    const session = await supabase.auth.getSession();
    const response = await fetch("/api/mock-tests", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.data.session?.access_token ?? ""}`,
      },
      body: JSON.stringify({ action: "start", userId: user.id, mockTestId }),
    });
    const payload = await response.json();
    setActiveAttemptId(payload.attemptId ?? "");
    setStatus("Mock test started with persisted timer state.");
  };

  const pause = async () => {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user || !activeAttemptId) return;
    const session = await supabase.auth.getSession();
    await fetch("/api/mock-tests", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.data.session?.access_token ?? ""}`,
      },
      body: JSON.stringify({
        action: "pause",
        userId: user.id,
        attemptId: activeAttemptId,
        remainingSeconds: 900,
        currentSection: "Language Knowledge",
        sectionState: { currentQuestion: 4 },
        responses: {},
      }),
    });
    setStatus("Paused and persisted.");
  };

  const resume = async () => {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user || !activeAttemptId) return;
    const session = await supabase.auth.getSession();
    await fetch("/api/mock-tests", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.data.session?.access_token ?? ""}`,
      },
      body: JSON.stringify({ action: "resume", userId: user.id, attemptId: activeAttemptId }),
    });
    setStatus("Resumed.");
  };

  const submitSection = async () => {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user || !activeAttemptId) return;
    const session = await supabase.auth.getSession();
    await fetch("/api/mock-tests", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.data.session?.access_token ?? ""}`,
      },
      body: JSON.stringify({
        action: "submit_section",
        userId: user.id,
        attemptId: activeAttemptId,
        sectionName: "Language Knowledge",
        score: 7,
        total: 10,
        elapsedSeconds: 600,
      }),
    });
    setStatus("Section submitted.");
  };

  const finish = async () => {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user || !activeAttemptId) return;
    const session = await supabase.auth.getSession();
    await fetch("/api/mock-tests", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.data.session?.access_token ?? ""}`,
      },
      body: JSON.stringify({
        action: "finish",
        userId: user.id,
        attemptId: activeAttemptId,
        totalScore: 18,
        totalQuestions: 25,
        sectionScores: { "Language Knowledge": 7, Reading: 6, Listening: 5 },
      }),
    });
    setStatus("Mock finished. Summary stored for trend tracking.");
  };

  return (
    <AppShell title="Full Mock Tests">
      <section className="card p-4 space-y-3">
        <p className="text-sm">Timed sections with pause/resume and per-section submissions.</p>
        {gate.data === false ? <p className="rounded border border-amber-300 bg-amber-50 p-2 text-sm">Kana gate is required before mock tests. Complete <a className="underline" href="/learn/kana">Kana Foundation</a>.</p> : null}
        {tests.isLoading ? <p className="text-sm">Loading mock tests...</p> : null}
        {tests.isError ? <p className="text-sm text-red-600">Failed to load mock tests.</p> : null}
        {!tests.isLoading && !tests.isError && !(tests.data ?? []).length ? <p className="text-sm">No mock tests available yet.</p> : null}
        {(tests.data ?? []).map((t: Record<string, unknown>) => (
          <div key={String(t.id)} className="rounded-lg border p-3">
            <p className="font-semibold">{String(t.title)}</p>
            <p className="text-sm">Duration: {String(t.duration_seconds)} sec</p>
            <button className="mt-2 rounded-lg border px-3 py-1 disabled:opacity-50" onClick={() => start(String(t.id))} disabled={gate.data === false}>Start</button>
          </div>
        ))}
        <div className="flex flex-wrap gap-2">
          <button className="rounded-lg border px-3 py-1" onClick={pause} disabled={!activeAttemptId}>Pause</button>
          <button className="rounded-lg border px-3 py-1" onClick={resume} disabled={!activeAttemptId}>Resume</button>
          <button className="rounded-lg border px-3 py-1" onClick={submitSection} disabled={!activeAttemptId}>Submit section</button>
          <button className="rounded-lg border px-3 py-1" onClick={finish} disabled={!activeAttemptId}>Finish</button>
        </div>
        <div className="rounded border p-3 text-sm">
          <p className="font-semibold">History trend (latest attempts)</p>
          {history.isLoading ? <p>Loading history...</p> : null}
          {history.isError ? <p className="text-red-600">Failed to load history.</p> : null}
          {(history.data ?? []).slice(0, 5).map((attempt: Record<string, unknown>) => (
            <p key={String(attempt.id)}>
              {String(attempt.status)} · {String(attempt.total_score)}/{String(attempt.total_questions)}
            </p>
          ))}
        </div>
        {status ? <p>{status}</p> : null}
      </section>
    </AppShell>
  );
}
