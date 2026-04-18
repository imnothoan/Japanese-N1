import { describe, expect, it } from "vitest";
import { checkRateLimit } from "@/lib/rate-limit";

describe("checkRateLimit", () => {
  it("allows within window limit and blocks overflow using local fallback", async () => {
    const key = `test-${Date.now()}`;
    expect((await checkRateLimit(key, 2, 1000)).allowed).toBe(true);
    expect((await checkRateLimit(key, 2, 1000)).allowed).toBe(true);
    expect((await checkRateLimit(key, 2, 1000)).allowed).toBe(false);
  });

  it("uses upstash endpoint when configured", async () => {
    const original = global.fetch;
    let called = 0;
    global.fetch = async () => {
      called += 1;
      return new Response(JSON.stringify({ result: [1, 60] }), { status: 200 });
    };

    const result = await checkRateLimit("rl-key", 10, 60_000, {
      upstashUrl: "https://example.upstash.io",
      upstashToken: "test-token",
    });

    global.fetch = original;
    expect(called).toBe(1);
    expect(result.allowed).toBe(true);
  });
});
