import { expect, test } from "@playwright/test";

test.describe("Flowboard Kanban", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await expect(page.getByTestId("kanban-board")).toHaveAttribute(
      "data-ready",
      "true",
    );
  });

  test("loads five columns and seed cards", async ({ page }) => {
    const columns = page.getByTestId("kanban-columns").locator("section");
    await expect(columns).toHaveCount(5);

    await expect(page.getByTestId("column-title-col-backlog")).toHaveText(
      "Backlog",
    );
    await expect(page.getByTestId("column-title-col-ready")).toHaveText(
      "Ready",
    );
    await expect(page.getByTestId("column-title-col-in-progress")).toHaveText(
      "In Progress",
    );
    await expect(page.getByTestId("column-title-col-review")).toHaveText(
      "Review",
    );
    await expect(page.getByTestId("column-title-col-done")).toHaveText("Done");

    await expect(page.getByText("Draft landing copy")).toBeVisible();
    await expect(page.getByText("Wire drag and drop")).toBeVisible();
    await expect(page.getByText("Seed dummy data")).toBeVisible();
  });

  test("renames a column", async ({ page }) => {
    await page.getByTestId("column-title-col-backlog").click();
    const input = page.getByTestId("column-title-input-col-backlog");
    await expect(input).toBeVisible();
    await input.fill("Icebox");
    await input.press("Enter");
    await expect(page.getByTestId("column-title-col-backlog")).toHaveText(
      "Icebox",
    );
  });

  test("adds a card to a column", async ({ page }) => {
    await page.getByTestId("add-card-col-ready").click();
    await page.getByTestId("add-card-title-col-ready").fill("New Playwright card");
    await page
      .getByTestId("add-card-details-col-ready")
      .fill("Created by the e2e suite");
    await page.getByTestId("add-card-submit-col-ready").click();

    const readyColumn = page.getByTestId("column-col-ready");
    await expect(readyColumn.getByText("New Playwright card")).toBeVisible();
    await expect(
      readyColumn.getByText("Created by the e2e suite"),
    ).toBeVisible();
  });

  test("deletes a card", async ({ page }) => {
    page.once("dialog", (dialog) => dialog.accept());
    await expect(page.getByTestId("card-card-7")).toBeVisible();
    await page.getByTestId("card-delete-card-7").click();
    await expect(page.getByTestId("card-card-7")).toHaveCount(0);
  });

  test("drags a card to another column", async ({ page }) => {
    const handle = page.getByTestId("card-drag-card-1");
    const target = page.getByTestId("column-drop-col-done");

    await expect(
      page.getByTestId("column-col-backlog").getByTestId("card-card-1"),
    ).toBeVisible();

    const handleBox = await handle.boundingBox();
    const targetBox = await target.boundingBox();
    expect(handleBox).toBeTruthy();
    expect(targetBox).toBeTruthy();

    await page.mouse.move(
      handleBox!.x + handleBox!.width / 2,
      handleBox!.y + handleBox!.height / 2,
    );
    await page.mouse.down();
    await page.mouse.move(
      targetBox!.x + targetBox!.width / 2,
      targetBox!.y + Math.min(40, targetBox!.height / 2),
      { steps: 25 },
    );
    await page.mouse.up();

    await expect(
      page.getByTestId("column-col-done").getByTestId("card-card-1"),
    ).toBeVisible();
    await expect(
      page.getByTestId("column-col-backlog").getByTestId("card-card-1"),
    ).toHaveCount(0);
  });
});
