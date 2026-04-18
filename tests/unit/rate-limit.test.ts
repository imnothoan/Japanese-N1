import { describe, expect, it } from "vitest";
import { checkRateLimit } from "@/lib/rate-limit";

describe("checkRateLimit", () => {
  it("allows within window limit and blocks overflow", () => {
    const key = `test-${Date.now()}`;
    expect(checkRateLimit(key, 2, 1000).allowed).toBe(true);
    expect(checkRateLimit(key, 2, 1000).allowed).toBe(true);
    expect(checkRateLimit(key, 2, 1000).allowed).toBe(false);
  });
});
