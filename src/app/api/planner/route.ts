import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createServiceSupabase } from "@/lib/supabase";
import { getRequestUser } from "@/lib/server-auth";
import { buildDailyPlan, estimateReadiness } from "@/lib/planner";

const rebalanceSchema = z.object({
  action: z.literal("weekly_rebalance"),
  userId: z.string().uuid(),
});

export async function GET(request: NextRequest) {
  const user = await getRequestUser(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createServiceSupabase();
  const [dueReviews, recentMistakes, goal, quizAttempts] = await Promise.all([
    supabase.from("review_items").select("id", { count: "exact", head: true }).eq("user_id", user.id).lte("due_date", new Date().toISOString()),
    supabase.from("mistake_logs").select("module,error_type").eq("user_id", user.id).order("created_at", { ascending: false }).limit(50),
    supabase.from("study_goals").select("target_jlpt_level,target_exam_date").eq("user_id", user.id).maybeSingle(),
    supabase.from("quiz_attempts").select("score,total").eq("user_id", user.id).order("created_at", { ascending: false }).limit(10),
  ]);

  const mistakeFrequency = new Map<string, number>();
  for (const row of recentMistakes.data ?? []) {
    const key = row.module ?? "general";
    mistakeFrequency.set(key, (mistakeFrequency.get(key) ?? 0) + 1);
  }

  const weakSkills = [...mistakeFrequency.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([module]) => module);

  const plan = buildDailyPlan({
    dueReviews: dueReviews.count ?? 0,
    weakSkills,
    targetExamDate: goal.data?.target_exam_date ?? undefined,
  });

  const rollingAccuracy = (() => {
    const attempts = quizAttempts.data ?? [];
    if (!attempts.length) return 0.5;
    const ratio = attempts.map((a) => (a.total ? a.score / a.total : 0));
    return ratio.reduce((sum, x) => sum + x, 0) / attempts.length;
  })();

  const readiness = estimateReadiness({
    targetLevel: (goal.data?.target_jlpt_level as "N3" | "N2" | "N1" | undefined) ?? "N3",
    rollingAccuracy,
    completionRate: plan.length ? Math.min(1, (dueReviews.count ?? 0) / Math.max((dueReviews.count ?? 0), 10)) : 0.5,
    mockAverage: rollingAccuracy,
  });

  return NextResponse.json({
    plan,
    readiness,
    weakSkills,
  });
}

export async function POST(request: NextRequest) {
  const user = await getRequestUser(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = rebalanceSchema.safeParse(await request.json());
  if (!parsed.success || parsed.data.userId !== user.id) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });

  const supabase = createServiceSupabase();
  const today = new Date();
  const pendingRows = [];

  for (let i = 1; i <= 7; i += 1) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const date = d.toISOString().slice(0, 10);
    pendingRows.push({
      user_id: user.id,
      task_date: date,
      title: "Rebalance missed day: due reviews catch-up",
      task_type: "review",
      priority: 1,
      estimated_minutes: 20,
      completed: false,
    });
  }

  const { error } = await supabase.from("daily_tasks").insert(pendingRows);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await supabase.from("audit_events").insert({
    user_id: user.id,
    action: "weekly_rebalance_executed",
    entity_type: "daily_tasks",
    payload: { days: 7 },
  });

  return NextResponse.json({ ok: true, generated: pendingRows.length });
}
