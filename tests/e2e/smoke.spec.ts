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
