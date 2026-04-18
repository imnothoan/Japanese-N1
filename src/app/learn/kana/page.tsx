"use client";

import { useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { hiragana, katakana } from "@/lib/app-data";

const toRoma: Record<string, string> = { あ: "a", い: "i", う: "u", え: "e", お: "o", ア: "a", イ: "i", ウ: "u", エ: "e", オ: "o" };

export default function KanaPage() {
  const [mode, setMode] = useState<"hiragana" | "katakana">("hiragana");
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [score, setScore] = useState(0);

  const chars = mode === "hiragana" ? hiragana : katakana;
  const current = chars[index % chars.length];
  const thresholdReached = useMemo(() => score >= 20, [score]);

  return (
    <AppShell title="Kana Foundation">
      <section className="card p-4 space-y-3">
        <div className="flex gap-2">
          <button className="rounded-lg border px-3 py-1" onClick={() => setMode("hiragana")}>Hiragana</button>
          <button className="rounded-lg border px-3 py-1" onClick={() => setMode("katakana")}>Katakana</button>
        </div>
        <p className="text-sm">Recognition + typing quiz. Unlocks next stage at score 20.</p>
        <p className="text-5xl font-bold">{current}</p>
        <input className="rounded-lg border p-2" value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="Type romaji" />
        <button
          className="rounded-lg bg-blue-600 px-4 py-2 text-white"
          onClick={() => {
            if (answer.trim().toLowerCase() === (toRoma[current] ?? "")) setScore((x) => x + 1);
            setIndex((x) => x + 1);
            setAnswer("");
          }}
        >
          Check
        </button>
        <p>Score: {score}</p>
        <p className={thresholdReached ? "text-green-600" : "text-amber-600"}>{thresholdReached ? "Unlocked core modules" : "Keep training to unlock"}</p>
      </section>
    </AppShell>
  );
}
