import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { checkRateLimit } from "@/lib/rate-limit";
import { createServiceSupabase } from "@/lib/supabase";
import { getRequestUser } from "@/lib/server-auth";
import { classifyErrorType } from "@/lib/error-classifier";

const schema = z.object({
  userId: z.string().uuid(),
  quizTemplateId: z.string().uuid().nullable().optional(),
  module: z.string().min(1),
  jlptLevel: z.string().min(2),
  score: z.number().int(),
  total: z.number().int().positive(),
  responses: z.array(z.object({ question: z.string(), chosen: z.string(), correct: z.string() })),
});

export async function POST(request: NextRequest) {
  const user = await getRequestUser(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const limited = await checkRateLimit(`quiz:${user.id}`, 30, 60_000, {
    upstashUrl: process.env.UPSTASH_REDIS_REST_URL,
    upstashToken: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
  if (!limited.allowed) return NextResponse.json({ error: "Rate limit" }, { status: 429 });

  const parsed = schema.safeParse(await request.json());
  if (!parsed.success || parsed.data.userId !== user.id) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });

  const supabase = createServiceSupabase();
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

  return NextResponse.json({ ok: true, mistakes: mistakes.length });
}
