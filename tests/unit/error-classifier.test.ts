import { describe, expect, it } from "vitest";
import { classifyErrorType } from "@/lib/error-classifier";

describe("classifyErrorType", () => {
  it("classifies particle errors", () => {
    expect(classifyErrorType("Choose particle for this sentence")).toBe("particles");
    expect(classifyErrorType("助詞を選んでください")).toBe("particles");
  });

  it("classifies grammar confusion", () => {
    expect(classifyErrorType("文法の正しい形はどれですか")).toBe("similar_grammar");
  });

  it("classifies kanji confusion", () => {
    expect(classifyErrorType("次の漢字を選びなさい")).toBe("kanji_confusion");
  });

  it("falls back to general", () => {
    expect(classifyErrorType("What is the correct answer?")).toBe("general");
  });
});
