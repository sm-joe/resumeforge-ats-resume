import { expect, test } from "@playwright/test";

test("create, edit, and reopen a private resume", async ({ page }) => {
  await page.goto("/resumes");
  await expect(page.getByRole("heading", { name: "My Resumes" })).toBeVisible();
  await page.getByRole("button", { name: /New Resume/ }).click();
  await expect(page.getByRole("heading", { name: /Build your ATS-friendly Resume/i })).toBeVisible();

  await page.getByLabel("Template").selectOption("classic");
  await expect(page.locator(".rf-template-classic")).toBeVisible();

  await page.getByRole("link", { name: "My Resumes" }).click();
  await expect(page.getByRole("heading", { name: "Untitled Resume" }).first()).toBeVisible();
});

test("resume exports produce downloadable PDF and Word files", async ({ page }) => {
  await page.goto("/resumes");
  await page.getByRole("button", { name: /New Resume/ }).click();
  await expect(page.getByRole("button", { name: "Export PDF" })).toBeVisible();

  const pdfPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export PDF" }).click();
  const pdf = await pdfPromise;
  expect(pdf.suggestedFilename()).toMatch(/\.pdf$/i);

  const docxPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export Word" }).click();
  const docx = await docxPromise;
  expect(docx.suggestedFilename()).toMatch(/\.docx$/i);
});

test("quality analysis provides understandable results", async ({ page }) => {
  await page.goto("/resumes");
  await page.getByRole("button", { name: /New Resume/ }).click();
  await page.getByRole("button", { name: "Analyze Resume" }).click();
  await expect(page.getByText("Resume Quality Score")).toBeVisible();
  await expect(page.getByText(/not an estimate of acceptance/i)).toBeVisible();
});

test("private resume library is isolated between browsers", async ({ browser }) => {
  const first = await browser.newContext();
  const second = await browser.newContext();
  try {
    const owner = await first.newPage();
    await owner.goto("/resumes");
    await owner.getByRole("button", { name: /New Resume/ }).click();
    await owner.getByRole("link", { name: "My Resumes" }).click();
    await expect(owner.getByRole("heading", { name: "Untitled Resume" }).first()).toBeVisible();

    const stranger = await second.newPage();
    await stranger.goto("/resumes");
    await expect(stranger.getByRole("heading", { name: "No resumes yet" })).toBeVisible();
  } finally {
    await first.close();
    await second.close();
  }
});
