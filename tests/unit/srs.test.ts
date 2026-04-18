import { describe, expect, it } from "vitest";
import { calculateNextReview } from "@/lib/srs";

describe("calculateNextReview", () => {
  it("resets repetitions on again", () => {
    const next = calculateNextReview({ easinessFactor: 2.5, interval: 10, repetitions: 4 }, "again");
    expect(next.repetitions).toBe(0);
    expect(next.interval).toBe(1);
  });

  it("expands interval on good", () => {
    const next = calculateNextReview({ easinessFactor: 2.5, interval: 6, repetitions: 2 }, "good");
    expect(next.interval).toBeGreaterThan(6);
    expect(next.repetitions).toBe(3);
  });

  it("marks leech on repeated failures", () => {
    const next = calculateNextReview({ easinessFactor: 2.0, interval: 3, repetitions: 3 }, "again");
    expect(next.isLeech).toBe(true);
  });
});
