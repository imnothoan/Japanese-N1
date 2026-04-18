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

  it("increments lapse count on failed recall", () => {
    const next = calculateNextReview(
      {
        easinessFactor: 2.3,
        interval: 8,
        repetitions: 3,
        lapses: 1,
      },
      "again",
    );
    expect(next.lapses).toBe(2);
  });

  it("dampens growth for heavily overdue cards", () => {
    const now = new Date("2026-04-18T00:00:00.000Z");
    const dueDate = new Date("2026-03-18T00:00:00.000Z");

    const overdue = calculateNextReview(
      { easinessFactor: 2.5, interval: 10, repetitions: 4, dueDate },
      "good",
      { now },
    );
    const onTime = calculateNextReview(
      { easinessFactor: 2.5, interval: 10, repetitions: 4, dueDate: now },
      "good",
      { now },
    );

    expect(overdue.interval).toBeLessThan(onTime.interval);
  });
});
