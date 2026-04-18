"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/client";
import { ensureSignedIn } from "@/lib/user";

type ModulePageProps = {
  title: string;
  table: string;
};

export const ModulePage = ({ title, table }: ModulePageProps) => {
  const [query, setQuery] = useState("");
  const [level, setLevel] = useState("all");
  const [queueStatus, setQueueStatus] = useState<Record<string, string>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});

  const itemsQuery = useQuery({
    queryKey: [table],
    queryFn: async () => {
      const { data, error } = await supabase.from(table).select("*").limit(200);
      if (error) throw error;
      return data ?? [];
    },
  });

  const filtered = useMemo(
    () =>
      (itemsQuery.data ?? []).filter((item: Record<string, unknown>) => {
        const text = JSON.stringify(item).toLowerCase();
        const levelOk = level === "all" || item.jlpt_level === level;
        return levelOk && text.includes(query.toLowerCase());
      }),
    [itemsQuery.data, query, level],
  );

  return (
    <section className="card p-4 space-y-3">
      <div className="flex flex-wrap gap-2">
        <input
          placeholder={`Search ${title.toLowerCase()}`}
          className="rounded-lg border px-3 py-2"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select className="rounded-lg border px-3 py-2" value={level} onChange={(e) => setLevel(e.target.value)}>
          <option value="all">All levels</option>
          <option value="N5">N5</option>
          <option value="N4">N4</option>
          <option value="N3">N3</option>
          <option value="N2">N2</option>
          <option value="N1">N1</option>
        </select>
      </div>
      {itemsQuery.isLoading ? <p>Loading...</p> : null}
      {itemsQuery.error ? <p className="text-red-600">Failed loading module.</p> : null}
      <ul className="grid gap-2">
        {filtered.map((item: Record<string, unknown>) => (
          <li key={String(item.id)} className="rounded-lg border p-3 text-sm">
            <div className="font-semibold">{String(item.term ?? item.character ?? item.pattern ?? item.title ?? "Item")}</div>
            <div className="text-xs opacity-75">Level: {String(item.jlpt_level ?? item.level ?? "N/A")}</div>
            <div className="text-xs mt-1">{String(item.meaning ?? item.explanation ?? item.content ?? item.transcript ?? "")}</div>
            <textarea
              className="mt-2 w-full rounded border p-2 text-xs"
              placeholder="Add study note (optional)"
              value={notes[String(item.id)] ?? ""}
              onChange={(event) => setNotes((prev) => ({ ...prev, [String(item.id)]: event.target.value }))}
            />
            <div className="mt-2 flex items-center gap-2">
              <button
                type="button"
                className="rounded border px-2 py-1 text-xs"
                onClick={async () => {
                  const sourceItemId = String(item.id);
                  try {
                    const user = await ensureSignedIn();
                    const moduleByTable: Record<string, string> = {
                      vocab_items: "vocabulary",
                      kanji_items: "kanji",
                      grammar_points: "grammar",
                      reading_passages: "reading",
                      listening_tracks: "listening",
                    };
                    const module = moduleByTable[table] ?? title.toLowerCase();
                    const { error } = await supabase.from("review_items").upsert({
                      user_id: user.id,
                      module,
                      source_item_id: sourceItemId,
                      state: "new",
                      notes: notes[sourceItemId] ?? null,
                    }, {
                      onConflict: "user_id,module,source_item_id",
                    });
                    if (error) {
                      setQueueStatus((prev) => ({ ...prev, [sourceItemId]: "Failed to add" }));
                      return;
                    }
                    setQueueStatus((prev) => ({ ...prev, [sourceItemId]: "Added to review queue" }));
                  } catch (error) {
                    setQueueStatus((prev) => ({ ...prev, [sourceItemId]: error instanceof Error ? error.message : "Failed to add" }));
                  }
                }}
              >
                Add to review
              </button>
              {queueStatus[String(item.id)] ? <span className="text-xs opacity-80">{queueStatus[String(item.id)]}</span> : null}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
};
