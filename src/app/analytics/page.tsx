"use client";

import { useQuery } from "@tanstack/react-query";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AppShell } from "@/components/app-shell";
import { supabase } from "@/lib/client";
import { summarizeSkillProgress } from "@/lib/skill-progress";

const MAX_ANALYTICS_DAYS = 30;

export default function AnalyticsPage() {
  const data = useQuery({
    queryKey: ["analytics"],
    queryFn: async () => {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) return { metrics: [], attempts: [] };
      const [metricsResult, attemptsResult] = await Promise.all([
        supabase.from("learning_metrics").select("metric_date,retention_rate,study_minutes").eq("user_id", user.id).order("metric_date", { ascending: true }).limit(MAX_ANALYTICS_DAYS),
        supabase.from("quiz_attempts").select("module,jlpt_level,score,total").eq("user_id", user.id).order("created_at", { ascending: false }).limit(300),
      ]);
      if (metricsResult.error) throw metricsResult.error;
      if (attemptsResult.error) throw attemptsResult.error;
      return {
        metrics: metricsResult.data ?? [],
        attempts: attemptsResult.data ?? [],
      };
    },
  });

  const skillCards = summarizeSkillProgress(data.data?.attempts ?? []);

  return (
    <AppShell title="Analytics">
      <section className="card p-4 space-y-3">
        <h2 className="font-semibold">Retention trend</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.data?.metrics ?? []}>
              <XAxis dataKey="metric_date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="retention_rate" stroke="#2563eb" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="card p-4 space-y-3">
        <h2 className="font-semibold">Skill progress (JLPT ↔ CEFR)</h2>
        <div className="grid gap-3 md:grid-cols-2">
          {skillCards.map((card) => (
            <article key={card.skill} className="rounded border p-3 text-sm space-y-1">
              <p className="font-medium capitalize">{card.skill}</p>
              <p>Accuracy: {card.accuracy}% · Attempts: {card.attempts}</p>
              <p>Estimated CEFR band: {card.cefrBand}</p>
              <p className="text-xs opacity-80">
                {card.levels.length
                  ? card.levels.map((level) => `${level.jlptLevel}(${level.cefrLevel}) ${level.accuracy}%`).join(" · ")
                  : "No attempts yet"}
              </p>
            </article>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
