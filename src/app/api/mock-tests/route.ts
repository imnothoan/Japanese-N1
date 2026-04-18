import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createServiceSupabase } from "@/lib/supabase";
import { getRequestUser } from "@/lib/server-auth";

const schema = z.object({
  userId: z.string().uuid(),
  mockTestId: z.string().uuid(),
  totalScore: z.number().int(),
  totalQuestions: z.number().int(),
  sectionScores: z.record(z.string(), z.number()),
});

export async function POST(request: NextRequest) {
  const user = await getRequestUser(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = schema.safeParse(await request.json());
  if (!parsed.success || parsed.data.userId !== user.id) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });

  const supabase = createServiceSupabase();
  const { error } = await supabase.from("mock_test_attempts").insert({
    user_id: user.id,
    mock_test_id: parsed.data.mockTestId,
    started_at: new Date().toISOString(),
    total_score: parsed.data.totalScore,
    total_questions: parsed.data.totalQuestions,
    section_scores: parsed.data.sectionScores,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
