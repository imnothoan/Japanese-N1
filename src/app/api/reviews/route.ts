import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { calculateNextReview } from "@/lib/srs";
import { createServiceSupabase } from "@/lib/supabase";
import { getRequestUser } from "@/lib/server-auth";
import { reviewSubmissionSchema } from "@/lib/validators";

export async function POST(request: NextRequest) {
  const user = await getRequestUser(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const limit = checkRateLimit(`review:${user.id}`, 60, 60_000);
  if (!limit.allowed) return NextResponse.json({ error: "Rate limit" }, { status: 429 });

  const parsed = reviewSubmissionSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const supabase = createServiceSupabase();
  const { data: reviewItem, error: itemError } = await supabase
    .from("review_items")
    .select("*")
    .eq("id", parsed.data.reviewItemId)
    .eq("user_id", user.id)
    .single();

  if (itemError || !reviewItem) return NextResponse.json({ error: "Review item not found" }, { status: 404 });

  const previousState = {
    easinessFactor: Number(reviewItem.easiness_factor),
    interval: reviewItem.interval_days,
    repetitions: reviewItem.repetitions,
  };

  const next = calculateNextReview(previousState, parsed.data.grade);

  const { error: updateError } = await supabase.from("review_items").update({
    easiness_factor: next.easinessFactor,
    interval_days: next.interval,
    repetitions: next.repetitions,
    due_date: next.dueDate.toISOString(),
    leech: next.isLeech,
    state: next.repetitions > 4 ? "mastered" : "learning",
  }).eq("id", reviewItem.id);

  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 });

  await supabase.from("review_logs").insert({
    review_item_id: reviewItem.id,
    user_id: user.id,
    outcome: parsed.data.grade,
    previous_state: previousState,
    next_state: next,
  });

  await supabase.from("audit_events").insert({
    user_id: user.id,
    action: "study_progress_updated",
    entity_type: "review_items",
    entity_id: reviewItem.id,
    payload: { grade: parsed.data.grade },
  });

  return NextResponse.json({ ok: true });
}
