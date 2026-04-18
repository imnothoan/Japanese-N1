import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { createServiceSupabase } from "@/lib/supabase";
import { getRequestUser } from "@/lib/server-auth";
import { mockTestActionSchema } from "@/lib/validators";

export async function GET(request: NextRequest) {
  const user = await getRequestUser(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createServiceSupabase();
  const { data: profile } = await supabase.from("profiles").select("kana_mastered").eq("id", user.id).maybeSingle();
  if (!profile?.kana_mastered) return NextResponse.json({ error: "Kana gate required" }, { status: 403 });
  const { data, error } = await supabase
    .from("mock_test_attempts")
    .select("id, mock_test_id, status, total_score, total_questions, started_at, completed_at, section_scores")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const attempts = data ?? [];
  const trend = attempts
    .filter((a) => (a.total_questions ?? 0) > 0)
    .map((a) => ({
      attemptId: a.id,
      readinessEstimate: Math.round((a.total_score / a.total_questions) * 100),
      completedAt: a.completed_at,
    }));
  return NextResponse.json({ attempts, trend, note: "Readiness values are estimates, not guarantees." });
}

export async function POST(request: NextRequest) {
  const user = await getRequestUser(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const limited = await checkRateLimit(`mock-tests:${user.id}`, 45, 60_000, {
    upstashUrl: process.env.UPSTASH_REDIS_REST_URL,
    upstashToken: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
  if (!limited.allowed) return NextResponse.json({ error: "Rate limit" }, { status: 429 });

  const parsed = mockTestActionSchema.safeParse(await request.json());
  if (!parsed.success || parsed.data.userId !== user.id) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const supabase = createServiceSupabase();
  const { data: profile } = await supabase.from("profiles").select("kana_mastered").eq("id", user.id).maybeSingle();
  if (!profile?.kana_mastered) return NextResponse.json({ error: "Kana gate required" }, { status: 403 });
  const action = parsed.data.action;

  if (action === "start") {
    const { data, error } = await supabase
      .from("mock_test_attempts")
      .insert({
        user_id: user.id,
        mock_test_id: parsed.data.mockTestId,
        started_at: new Date().toISOString(),
        status: "in_progress",
      })
      .select("id")
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    await supabase.from("audit_events").insert({
      user_id: user.id,
      action: "mock_test_started",
      entity_type: "mock_test_attempts",
      entity_id: data.id,
      payload: { mockTestId: parsed.data.mockTestId },
    });
    return NextResponse.json({ ok: true, attemptId: data.id });
  }

  if (action === "pause") {
    const { error } = await supabase.from("mock_test_attempts").update({
      paused: true,
      status: "paused",
      remaining_seconds: parsed.data.remainingSeconds,
      current_section: parsed.data.currentSection,
      section_state: parsed.data.sectionState,
      responses: parsed.data.responses,
      updated_at: new Date().toISOString(),
    }).eq("id", parsed.data.attemptId).eq("user_id", user.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  if (action === "resume") {
    const { error } = await supabase.from("mock_test_attempts").update({
      paused: false,
      status: "in_progress",
      updated_at: new Date().toISOString(),
    }).eq("id", parsed.data.attemptId).eq("user_id", user.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  if (action === "submit_section") {
    const { error } = await supabase.from("mock_test_section_results").insert({
      attempt_id: parsed.data.attemptId,
      section_name: parsed.data.sectionName,
      score: parsed.data.score,
      total: parsed.data.total,
      elapsed_seconds: parsed.data.elapsedSeconds,
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  const { error } = await supabase.from("mock_test_attempts").update({
    completed_at: new Date().toISOString(),
    paused: false,
    status: "completed",
    total_score: parsed.data.totalScore,
    total_questions: parsed.data.totalQuestions,
    section_scores: parsed.data.sectionScores,
  }).eq("id", parsed.data.attemptId).eq("user_id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await supabase.from("audit_events").insert({
    user_id: user.id,
    action: "test_submitted",
    entity_type: "mock_test_attempts",
    entity_id: parsed.data.attemptId,
    payload: { totalScore: parsed.data.totalScore, totalQuestions: parsed.data.totalQuestions },
  });

  return NextResponse.json({ ok: true });
}
