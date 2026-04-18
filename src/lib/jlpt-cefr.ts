export type JlptLevel = "N5" | "N4" | "N3" | "N2" | "N1";
export type CefrLevel = "A1" | "A2" | "B1" | "B2" | "C1";

const jlptToCefrMap: Record<JlptLevel, CefrLevel> = {
  N5: "A1",
  N4: "A2",
  N3: "B1",
  N2: "B2",
  N1: "C1",
};

const cefrToJlptMap: Record<CefrLevel, JlptLevel> = {
  A1: "N5",
  A2: "N4",
  B1: "N3",
  B2: "N2",
  C1: "N1",
};

export const mapJlptToCefr = (level: JlptLevel): CefrLevel => jlptToCefrMap[level];

export const mapCefrToJlpt = (level: CefrLevel): JlptLevel => cefrToJlptMap[level];
