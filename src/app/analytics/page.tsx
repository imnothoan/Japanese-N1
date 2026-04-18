"use client";

import { useQuery } from "@tanstack/react-query";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AppShell } from "@/components/app-shell";
import { supabase } from "@/lib/client";

const MAX_ANALYTICS_DAYS = 30;

export default function AnalyticsPage() {
  const data = useQuery({
    queryKey: ["analytics"],
    queryFn: async () => {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) return [];
      const { data, error } = await supabase.from("learning_metrics").select("metric_date,retention_rate,study_minutes").eq("user_id", user.id).order("metric_date", { ascending: true }).limit(MAX_ANALYTICS_DAYS);
      if (error) throw error;
      return data ?? [];
    },
  });

  return (
    <AppShell title="Analytics">
      <section className="card p-4 space-y-3">
        <h2 className="font-semibold">Retention trend</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.data ?? []}>
              <XAxis dataKey="metric_date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="retention_rate" stroke="#2563eb" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>
    </AppShell>
  );
}
