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

  it("uses conservative growth on hard", () => {
    const next = calculateNextReview({ easinessFactor: 2.5, interval: 10, repetitions: 3 }, "hard");
    expect(next.interval).toBeLessThan(25);
    expect(next.interval).toBeGreaterThanOrEqual(1);
  });

  it("uses accelerated growth on easy", () => {
    const next = calculateNextReview({ easinessFactor: 2.5, interval: 10, repetitions: 3 }, "easy");
    expect(next.interval).toBeGreaterThan(20);
    expect(next.easinessFactor).toBeGreaterThan(2.5);
  });

  it("marks leech on repeated failures", () => {
    const next = calculateNextReview({ easinessFactor: 2.0, interval: 3, repetitions: 3 }, "again");
    expect(next.isLeech).toBe(true);
  });
});
