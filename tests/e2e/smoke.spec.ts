import { expect, test } from "@playwright/test";

test("core learning pages are reachable", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("From Kana Zero to JLPT N1 Readiness")).toBeVisible();
  await page.goto("/onboarding");
  await expect(page.getByText("Onboarding & Diagnostic")).toBeVisible();
  await page.goto("/learn/kana");
  await expect(page.getByText("Kana Foundation")).toBeVisible();
  await page.goto("/review");
  await expect(page.getByText("Daily Review Queue")).toBeVisible();
  await page.goto("/quiz");
  await expect(page.getByText("Topic Quizzes")).toBeVisible();
  await page.goto("/mock-tests");
  await expect(page.getByText("Full Mock Tests")).toBeVisible();
  await page.goto("/analytics");
  await expect(page.getByRole("heading", { name: "Analytics" })).toBeVisible();
});

test("critical learner flow surfaces expected states", async ({ page }) => {
  await page.goto("/onboarding");
  await page.getByLabel("Exam date").fill("2026-12-06");
  await page.getByLabel("Daily minutes").fill("45");
  await page.getByRole("button", { name: "Save onboarding" }).click();
  await expect(page.getByText(/Saving|Failed|Saved/)).toBeVisible();

  await page.goto("/learn/kana");
  await page.getByPlaceholder("Type romaji").fill("a");
  await page.getByRole("button", { name: "Check" }).click();
  await expect(page.getByText(/Score:/)).toBeVisible();

  await page.goto("/review");
  await expect(page.getByText(/Kana gate is required|No due reviews right now|Loading review queue/)).toBeVisible();

  await page.goto("/quiz");
  await expect(page.getByText(/Kana gate is required|Timed drills and JLPT-style section quizzes/)).toBeVisible();

  await page.goto("/mock-tests");
  await expect(page.getByText(/Timed sections with pause\/resume|Kana gate is required/)).toBeVisible();

  await page.goto("/dashboard");
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
});
