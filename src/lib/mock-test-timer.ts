export type MockSection = {
  name: string;
  duration_seconds?: number;
  questions?: number;
};

export type SectionTimerState = {
  currentIndex: number;
  currentSection: string;
  remainingSeconds: number;
  sections: MockSection[];
  completed: boolean;
};

const getSectionDuration = (section?: MockSection) => Math.max(1, section?.duration_seconds ?? 600);

export const getInitialSectionState = (sections: MockSection[]): SectionTimerState => {
  const normalized = sections.filter((section) => typeof section?.name === "string" && section.name.length > 0);
  const first = normalized[0];
  return {
    currentIndex: 0,
    currentSection: first?.name ?? "Language Knowledge",
    remainingSeconds: getSectionDuration(first),
    sections: normalized.length ? normalized : [{ name: "Language Knowledge", duration_seconds: 600 }],
    completed: false,
  };
};

export const tickSectionTimer = (state: SectionTimerState, elapsedSeconds = 1): SectionTimerState => {
  if (state.completed) return state;
  const remainingSeconds = Math.max(0, state.remainingSeconds - Math.max(1, elapsedSeconds));
  if (remainingSeconds > 0) {
    return {
      ...state,
      remainingSeconds,
    };
  }

  const nextIndex = state.currentIndex + 1;
  const nextSection = state.sections[nextIndex];
  if (!nextSection) {
    return {
      ...state,
      remainingSeconds: 0,
      completed: true,
    };
  }

  return {
    ...state,
    currentIndex: nextIndex,
    currentSection: nextSection.name,
    remainingSeconds: getSectionDuration(nextSection),
  };
};
