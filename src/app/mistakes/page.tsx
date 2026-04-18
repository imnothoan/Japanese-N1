"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/app-shell";
import { supabase } from "@/lib/client";

export default function MistakesPage() {
  const mistakes = useQuery({
    queryKey: ["mistakes"],
    queryFn: async () => {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) return [];
      const { data, error } = await supabase.from("mistake_logs").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(100);
      if (error) throw error;
      return data ?? [];
    },
  });

  const grouped = useMemo(() => {
    const map: Record<string, number> = {};
    for (const row of mistakes.data ?? []) map[row.error_type] = (map[row.error_type] ?? 0) + 1;
    return map;
  }, [mistakes.data]);

  return (
    <AppShell title="Mistake Notebook">
      <section className="card p-4 space-y-2">
        <h2 className="font-semibold">Grouped patterns</h2>
        {Object.entries(grouped).map(([type, count]) => (
          <p key={type} className="text-sm">{type}: {count}</p>
        ))}
      </section>
      <section className="card p-4">
        <h2 className="font-semibold">Recent mistakes</h2>
        <ul className="mt-2 space-y-2 text-sm">
          {(mistakes.data ?? []).map((m: Record<string, unknown>) => (
            <li key={String(m.id)} className="rounded-lg border p-2">[{String(m.module)}] {String(m.question_context)} → {String(m.correct_answer)}</li>
          ))}
        </ul>
      </section>
    </AppShell>
  );
}
