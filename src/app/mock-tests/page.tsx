"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/app-shell";
import { supabase } from "@/lib/client";

export default function MockTestsPage() {
  const [status, setStatus] = useState("");
  const tests = useQuery({
    queryKey: ["mock-tests"],
    queryFn: async () => {
      const { data, error } = await supabase.from("mock_tests").select("*").limit(10);
      if (error) throw error;
      return data ?? [];
    },
  });

  const start = async (mockTestId: string) => {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) return;
    const session = await supabase.auth.getSession();
    await fetch("/api/mock-tests", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.data.session?.access_token ?? ""}`,
      },
      body: JSON.stringify({ userId: user.id, mockTestId, totalScore: 0, totalQuestions: 0, sectionScores: {} }),
    });
    setStatus("Mock test attempt started and stored.");
  };

  return (
    <AppShell title="Full Mock Tests">
      <section className="card p-4 space-y-3">
        <p className="text-sm">Pause/resume ready attempts with section breakdown storage.</p>
        {(tests.data ?? []).map((t: Record<string, unknown>) => (
          <div key={String(t.id)} className="rounded-lg border p-3">
            <p className="font-semibold">{String(t.title)}</p>
            <p className="text-sm">Duration: {String(t.duration_seconds)} sec</p>
            <button className="mt-2 rounded-lg border px-3 py-1" onClick={() => start(String(t.id))}>Start</button>
          </div>
        ))}
        {status ? <p>{status}</p> : null}
      </section>
    </AppShell>
  );
}
