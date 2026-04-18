import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { createServiceSupabase } from "@/lib/supabase";
import { getRequestUser } from "@/lib/server-auth";
import { miningSchema } from "@/lib/validators";

export async function POST(request: NextRequest) {
  const user = await getRequestUser(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const limit = await checkRateLimit(`mining:${user.id}`, 10, 60_000, {
    upstashUrl: process.env.UPSTASH_REDIS_REST_URL,
    upstashToken: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
  if (!limit.allowed) return NextResponse.json({ error: "Rate limit" }, { status: 429 });

  const parsed = miningSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const supabase = createServiceSupabase();
  const { error } = await supabase.from("mined_entries").insert({
    user_id: user.id,
    source_text: parsed.data.sourceText,
    selected_items: parsed.data.selectedTokens,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await supabase.from("audit_events").insert({
    user_id: user.id,
    action: "mined_entry_created",
    entity_type: "mined_entries",
    payload: { tokenCount: parsed.data.selectedTokens.length },
  });

  return NextResponse.json({ ok: true });
}
