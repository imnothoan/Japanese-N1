import { describe, expect, it } from "vitest";
import { summarizeSkillProgress } from "@/lib/skill-progress";

describe("summarizeSkillProgress", () => {
  it("returns per-skill progress cards with jlpt to cefr mapping", () => {
    const cards = summarizeSkillProgress([
      { module: "grammar", jlpt_level: "N3", score: 8, total: 10 },
      { module: "grammar", jlpt_level: "N2", score: 7, total: 10 },
      { module: "listening", jlpt_level: "N1", score: 9, total: 10 },
    ]);

    const grammar = cards.find((card) => card.skill === "grammar");
    expect(grammar).toBeDefined();
    expect(grammar?.accuracy).toBe(75);
    expect(grammar?.levels[0]).toMatchObject({
      jlptLevel: "N2",
      cefrLevel: "B2",
    });
  });

  it("returns zeroed cards for skills with no attempts", () => {
    const cards = summarizeSkillProgress([]);
    const kanji = cards.find((card) => card.skill === "kanji");
    expect(kanji).toMatchObject({ attempts: 0, accuracy: 0, cefrBand: "A1" });
  });
});
