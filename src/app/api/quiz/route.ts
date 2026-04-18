import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { createServiceSupabase } from "@/lib/supabase";
import { getRequestUser } from "@/lib/server-auth";
import { classifyErrorType, getTargetedRetrySet } from "@/lib/error-classifier";
import { quizSubmissionSchema } from "@/lib/validators";

export async function POST(request: NextRequest) {
  const user = await getRequestUser(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const limited = await checkRateLimit(`quiz:${user.id}`, 30, 60_000, {
    upstashUrl: process.env.UPSTASH_REDIS_REST_URL,
    upstashToken: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
  if (!limited.allowed) return NextResponse.json({ error: "Rate limit" }, { status: 429 });

  const parsed = quizSubmissionSchema.safeParse(await request.json());
  if (!parsed.success || parsed.data.userId !== user.id) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });

  const supabase = createServiceSupabase();
  const { data: profile } = await supabase.from("profiles").select("kana_mastered").eq("id", user.id).maybeSingle();
  if (!profile?.kana_mastered) return NextResponse.json({ error: "Kana gate required" }, { status: 403 });
  const { error } = await supabase.from("quiz_attempts").insert({
    user_id: user.id,
    quiz_template_id: parsed.data.quizTemplateId ?? null,
    module: parsed.data.module,
    jlpt_level: parsed.data.jlptLevel,
    score: parsed.data.score,
    total: parsed.data.total,
    responses: parsed.data.responses,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const mistakes = parsed.data.responses
    .filter((r) => r.chosen !== r.correct)
    .map((r) => ({
      user_id: user.id,
      item: r.question,
      module: parsed.data.module,
      question_context: r.question,
      chosen_answer: r.chosen,
      correct_answer: r.correct,
      error_type: classifyErrorType(r.question),
    }));

  if (mistakes.length) await supabase.from("mistake_logs").insert(mistakes);

  await supabase.from("audit_events").insert({
    user_id: user.id,
    action: "test_submitted",
    entity_type: "quiz_attempts",
    payload: { score: parsed.data.score, total: parsed.data.total },
  });

  const targetedRetry = getTargetedRetrySet(mistakes);
  return NextResponse.json({ ok: true, mistakes: mistakes.length, targetedRetry });
}
