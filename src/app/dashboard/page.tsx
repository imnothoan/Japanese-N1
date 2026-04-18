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
      const [reviews, mistakes, goals, metrics, planner] = await Promise.all([
        supabase.from("review_items").select("id", { count: "exact", head: true }).lte("due_date", new Date().toISOString()).eq("user_id", user.id),
        supabase.from("mistake_logs").select("id", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("study_goals").select("*").eq("user_id", user.id).maybeSingle(),
        supabase.from("learning_metrics").select("due_forecast_7,due_forecast_30,module_accuracy").eq("user_id", user.id).order("metric_date", { ascending: false }).limit(1).maybeSingle(),
        (async () => {
          const session = await supabase.auth.getSession();
          const response = await fetch("/api/planner", {
            headers: { Authorization: `Bearer ${session.data.session?.access_token ?? ""}` },
          });
          if (!response.ok) return null;
          return response.json();
        })(),
      ]);

      return {
        dueCount: reviews.count ?? 0,
        mistakes: mistakes.count ?? 0,
        goal: goals.data,
        dueForecast7: (metrics.data?.due_forecast_7 as number[] | null) ?? [],
        dueForecast30: (metrics.data?.due_forecast_30 as number[] | null) ?? [],
        weaknesses: Object.entries((metrics.data?.module_accuracy as Record<string, number> | null) ?? {})
          .sort((a, b) => a[1] - b[1])
          .slice(0, 3),
        planner,
      };
    },
  });

  if (metrics.isLoading) {
    return <AppShell title="Dashboard"><section className="card p-4 text-sm">Loading dashboard...</section></AppShell>;
  }

  if (metrics.isError) {
    return <AppShell title="Dashboard"><section className="card p-4 text-sm text-red-600">Failed to load dashboard data.</section></AppShell>;
  }

  if (!metrics.data) {
    return <AppShell title="Dashboard"><section className="card p-4 text-sm">Sign in to view your study dashboard.</section></AppShell>;
  }

  return (
    <AppShell title="Dashboard">
      <section className="grid gap-3 md:grid-cols-3">
        <div className="card p-4"><p className="text-sm">Today’s highest impact task</p><p className="text-xl font-semibold">{metrics.data.dueCount} Due reviews</p></div>
        <div className="card p-4"><p className="text-sm">Readiness trend</p><p className="text-xl font-semibold">{metrics.data.planner?.readiness?.score ?? Math.max(45, 80 - metrics.data.mistakes)}%</p><p className="text-xs opacity-70">Estimate only, not guarantee.</p></div>
        <div className="card p-4"><p className="text-sm">At-risk areas</p><p className="text-xl font-semibold">{metrics.data.mistakes} logged mistakes</p></div>
      </section>

      <section className="grid gap-3 md:grid-cols-2">
        <article className="card p-4 text-sm">
          <h2 className="font-semibold">Today tasks</h2>
          <ul className="mt-2 list-disc pl-5">
            {(metrics.data.planner?.plan ?? []).map((task: { title: string }, index: number) => (
              <li key={`${task.title}-${index}`}>{task.title}</li>
            ))}
          </ul>
          {!(metrics.data.planner?.plan?.length) ? <p className="mt-2 opacity-80">No tasks generated yet.</p> : null}
          <p className="mt-2 opacity-80">Goal: {metrics.data.goal?.target_jlpt_level ?? "Not set"} · {metrics.data.goal?.daily_minutes ?? 0} mins/day</p>
        </article>

        <article className="card p-4 text-sm">
          <h2 className="font-semibold">Due forecast 7/30 days</h2>
          <p className="mt-2">7 days: {metrics.data.dueForecast7.length ? metrics.data.dueForecast7.join(", ") : "No forecast yet"}</p>
          <p className="mt-1">30 days: {metrics.data.dueForecast30.length ? `${metrics.data.dueForecast30.slice(0, 10).join(", ")}...` : "No forecast yet"}</p>
        </article>
      </section>

      <section className="card p-4 text-sm">
        <h2 className="font-semibold">Weakness cards</h2>
        <div className="mt-2 grid gap-2 md:grid-cols-3">
          {metrics.data.weaknesses.length
            ? metrics.data.weaknesses.map(([module, accuracy]) => (
              <div key={module} className="rounded border p-2">
                <p className="font-medium">{module}</p>
                <p className="text-xs opacity-80">Accuracy: {Math.round(accuracy * 100)}%</p>
              </div>
            ))
            : <p className="opacity-80">No weakness data yet.</p>}
        </div>
      </section>
    </AppShell>
  );
}
