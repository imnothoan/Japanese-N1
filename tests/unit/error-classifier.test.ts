import { describe, expect, it } from "vitest";
import { classifyErrorType, getTargetedRetrySet } from "@/lib/error-classifier";

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

  it("classifies reading and listening comprehension mistakes", () => {
    expect(classifyErrorType("Choose the best summary of this passage")).toBe("reading_comprehension");
    expect(classifyErrorType("会話の内容として正しいものはどれですか")).toBe("listening_comprehension");
  });
});

describe("getTargetedRetrySet", () => {
  it("returns highest-frequency mistake types first", () => {
    const retry = getTargetedRetrySet([
      { error_type: "particles", module: "grammar" },
      { error_type: "particles", module: "grammar" },
      { error_type: "kanji_confusion", module: "kanji" },
    ]);

    expect(retry[0]).toMatchObject({ errorType: "particles", module: "grammar", count: 2 });
  });
});
