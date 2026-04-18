"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AppShell } from "@/components/app-shell";
import { supabase } from "@/lib/client";

const grades = ["again", "hard", "good", "easy"] as const;

export default function ReviewPage() {
  const queryClient = useQueryClient();
  const review = useQuery({
    queryKey: ["review-queue"],
    queryFn: async () => {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) return [];
      const { data, error } = await supabase
        .from("review_items")
        .select("*")
        .eq("user_id", user.id)
        .lte("due_date", new Date().toISOString())
        .order("due_date", { ascending: true })
        .limit(20);
      if (error) throw error;
      return data ?? [];
    },
  });

  const gate = useQuery({
    queryKey: ["kana-gate"],
    queryFn: async () => {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) return false;
      const { data } = await supabase.from("profiles").select("kana_mastered").eq("id", user.id).maybeSingle();
      return Boolean(data?.kana_mastered);
    },
  });

  const submit = async (reviewItemId: string, grade: (typeof grades)[number]) => {
    const session = await supabase.auth.getSession();
    await fetch("/api/reviews", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.data.session?.access_token ?? ""}`,
      },
      body: JSON.stringify({ reviewItemId, grade }),
    });
    queryClient.invalidateQueries({ queryKey: ["review-queue"] });
  };

  return (
    <AppShell title="Daily Review Queue">
      <section className="card p-4 space-y-3">
        <p className="text-sm">Mixed SRS queue across vocab/kanji/grammar.</p>
        {gate.data === false ? <p className="rounded border border-amber-300 bg-amber-50 p-2 text-sm">Kana gate is required before reviews. Complete <a className="underline" href="/learn/kana">Kana Foundation</a>.</p> : null}
        {review.isLoading ? <p className="text-sm">Loading review queue...</p> : null}
        {review.isError ? <p className="text-sm text-red-600">Failed to load review queue.</p> : null}
        {!review.isLoading && !review.isError && !(review.data ?? []).length ? <p className="text-sm">No due reviews right now.</p> : null}
        {(review.data ?? []).map((item: Record<string, unknown>) => (
          <div key={String(item.id)} className="rounded-lg border p-3">
            <p className="font-semibold">{String(item.module)} · {String(item.source_item_id)}</p>
            <div className="mt-2 flex gap-2">
              {grades.map((grade) => (
                <button
                  key={grade}
                  type="button"
                  aria-label={`Grade ${grade}`}
                  className="rounded-lg border px-3 py-1 text-sm"
                  disabled={gate.data === false}
                  onClick={() => submit(String(item.id), grade)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      submit(String(item.id), grade);
                    }
                  }}
                >
                  {grade}
                </button>
              ))}
            </div>
          </div>
        ))}
      </section>
    </AppShell>
  );
}
