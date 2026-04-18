"use client";

import { useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { supabase } from "@/lib/client";

const tokenize = (text: string) => Array.from(new Set(text.replace(/[\n。、！？]/g, " ").split(/\s+/).filter((x) => x.length > 0)));

export default function MiningPage() {
  const [text, setText] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [status, setStatus] = useState("");

  const tokens = useMemo(() => tokenize(text), [text]);

  const save = async () => {
    const session = await supabase.auth.getSession();
    const response = await fetch("/api/mining", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.data.session?.access_token ?? ""}`,
      },
      body: JSON.stringify({ sourceText: text, selectedTokens: selected }),
    });

    setStatus(response.ok ? "Saved mined entry." : "Failed to save");
  };

  return (
    <AppShell title="Text Mining & Extraction">
      <section className="card p-4 space-y-3">
        <textarea value={text} onChange={(e) => setText(e.target.value)} className="min-h-40 w-full rounded-lg border p-3" placeholder="Paste Japanese text passage" />
        <div className="flex flex-wrap gap-2">
          {tokens.map((token) => (
            <button
              key={token}
              className={`rounded-full border px-3 py-1 text-sm ${selected.includes(token) ? "bg-blue-600 text-white" : ""}`}
              onClick={() => setSelected((prev) => (prev.includes(token) ? prev.filter((x) => x !== token) : [...prev, token]))}
            >
              {token}
            </button>
          ))}
        </div>
        <button className="rounded-lg bg-blue-600 px-4 py-2 text-white" onClick={save}>Add selected to personal deck</button>
        {status ? <p>{status}</p> : null}
      </section>
    </AppShell>
  );
}
