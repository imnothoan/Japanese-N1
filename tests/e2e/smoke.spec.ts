import { expect, test } from "@playwright/test";

test("landing and onboarding are reachable", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("From Kana Zero to JLPT N1 Readiness")).toBeVisible();
  await page.goto("/onboarding");
  await expect(page.getByText("Onboarding & Diagnostic")).toBeVisible();
});
