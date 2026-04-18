import { describe, expect, it } from "vitest";
import { getInitialSectionState, tickSectionTimer } from "@/lib/mock-test-timer";

describe("mock-test timer helpers", () => {
  it("initializes section timing from mock definition", () => {
    const state = getInitialSectionState([
      { name: "Language Knowledge", duration_seconds: 600 },
      { name: "Reading", duration_seconds: 900 },
    ]);

    expect(state.currentSection).toBe("Language Knowledge");
    expect(state.remainingSeconds).toBe(600);
    expect(state.completed).toBe(false);
  });

  it("advances to next section when timer reaches zero", () => {
    const state = tickSectionTimer(
      {
        currentIndex: 0,
        currentSection: "Language Knowledge",
        remainingSeconds: 1,
        sections: [
          { name: "Language Knowledge", duration_seconds: 1 },
          { name: "Reading", duration_seconds: 900 },
        ],
        completed: false,
      },
      1,
    );

    expect(state.currentSection).toBe("Reading");
    expect(state.remainingSeconds).toBe(900);
    expect(state.completed).toBe(false);
  });

  it("marks timer complete after final section elapses", () => {
    const state = tickSectionTimer(
      {
        currentIndex: 1,
        currentSection: "Listening",
        remainingSeconds: 1,
        sections: [
          { name: "Language Knowledge", duration_seconds: 1 },
          { name: "Listening", duration_seconds: 1 },
        ],
        completed: false,
      },
      1,
    );

    expect(state.completed).toBe(true);
    expect(state.remainingSeconds).toBe(0);
  });
});
