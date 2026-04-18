import { describe, expect, it } from "vitest";
import { normalizeContentBatch } from "@/lib/import-normalizer";

describe("normalizeContentBatch", () => {
  it("normalizes vocabulary rows and removes duplicate collisions", () => {
    const result = normalizeContentBatch("vocabulary", [
      { term: " 学生 ", reading: " がくせい ", meaning: " student ", jlpt_level: "n5" },
      { term: "学生", reading: "がくせい", meaning: "student", jlpt_level: "N5" },
      { term: "", reading: "せんせい", meaning: "teacher", jlpt_level: "N5" },
    ]);

    expect(result.rows).toHaveLength(1);
    expect(result.rows[0]).toMatchObject({
      term: "学生",
      reading: "がくせい",
      meaning: "student",
      jlpt_level: "N5",
    });
    expect(result.report.duplicates).toBe(1);
    expect(result.report.missingRequired).toBe(1);
  });

  it("normalizes reading/listening levels and tracks by-level counts", () => {
    const reading = normalizeContentBatch("reading", [
      { title: "Easy", content: "A", jlpt_level: "n4", questions: [] },
      { title: "Hard", content: "B", jlpt_level: "N2", questions: [] },
    ]);

    expect(reading.report.byLevel.N4).toBe(1);
    expect(reading.report.byLevel.N2).toBe(1);
  });

  it("blocks imports when license is not in approved open-license list", () => {
    const result = normalizeContentBatch("vocabulary", [
      { term: "学生", reading: "がくせい", meaning: "student", jlpt_level: "N5" },
    ], { sourceLicense: "All rights reserved" });

    expect(result.rows).toHaveLength(0);
    expect(result.report.licenseApproved).toBe(false);
    expect(result.report.qualityGatePassed).toBe(false);
  });

  it("passes quality gate when license approved and acceptance ratio is healthy", () => {
    const result = normalizeContentBatch("vocabulary", [
      { term: "学生", reading: "がくせい", meaning: "student", jlpt_level: "N5" },
      { term: "約束", reading: "やくそく", meaning: "promise", jlpt_level: "N3" },
    ], { sourceLicense: "CC BY 4.0" });

    expect(result.report.licenseApproved).toBe(true);
    expect(result.report.qualityGatePassed).toBe(true);
    expect(result.report.qualityScore).toBeGreaterThanOrEqual(80);
  });
});
