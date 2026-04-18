"use client";

import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/app-shell";
import { supabase } from "@/lib/client";

export default function DashboardPage() {
  const metrics = useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) return null;
      const [reviews, mistakes, goals] = await Promise.all([
        supabase.from("review_items").select("id", { count: "exact", head: true }).lte("due_date", new Date().toISOString()).eq("user_id", user.id),
        supabase.from("mistake_logs").select("id", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("study_goals").select("*").eq("user_id", user.id).maybeSingle(),
      ]);

      return { dueCount: reviews.count ?? 0, mistakes: mistakes.count ?? 0, goal: goals.data };
    },
  });

  return (
    <AppShell title="Dashboard">
      <section className="grid gap-3 md:grid-cols-3">
        <div className="card p-4"><p className="text-sm">Today’s highest impact task</p><p className="text-xl font-semibold">{metrics.data?.dueCount ?? 0} Due reviews</p></div>
        <div className="card p-4"><p className="text-sm">Predicted score trend</p><p className="text-xl font-semibold">{Math.max(45, 80 - (metrics.data?.mistakes ?? 0))}%</p></div>
        <div className="card p-4"><p className="text-sm">At-risk areas</p><p className="text-xl font-semibold">{metrics.data?.mistakes ?? 0} logged mistakes</p></div>
      </section>
      <section className="card p-4 text-sm">
        <h2 className="font-semibold">Daily auto-plan</h2>
        <ul className="mt-2 list-disc pl-5">
          <li>Complete due SRS queue first.</li>
          <li>Do one targeted quiz for weakest module.</li>
          <li>Read one short passage and mine unknown terms.</li>
        </ul>
        <p className="mt-2 opacity-80">Goal: {metrics.data?.goal?.target_jlpt_level ?? "Not set"} · {metrics.data?.goal?.daily_minutes ?? 0} mins/day</p>
      </section>
    </AppShell>
  );
}
