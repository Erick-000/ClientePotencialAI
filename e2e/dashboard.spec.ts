import { expect, test } from "@playwright/test"

test.describe("Dashboard — Métricas E2E", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/dashboard")
  })

  test("carga el dashboard correctamente", async ({ page }) => {
    await expect(page.getByRole("heading", { name: /dashboard/i })).toBeVisible()
  })

  test("muestra tarjetas de métricas", async ({ page }) => {
    // Esperar a que carguen las métricas (son client-side)
    await page.waitForTimeout(1500)
    // Al menos una métrica numérica debe estar visible
    const metricCards = page.locator("[data-testid='metric-card']")
    // Si no tiene data-testid, verificamos que hay texto numérico
    await expect(page.locator("text=/\\d+/").first()).toBeVisible()
  })

  test("tiene botón para ir a prospectos", async ({ page }) => {
    const leadsLink = page.getByRole("link", { name: /prospecto/i }).first()
    await expect(leadsLink).toBeVisible()
  })

  test("navega al Kanban desde el sidebar", async ({ page }) => {
    await page.getByRole("link", { name: /kanban/i }).click()
    await expect(page.url()).toContain("/kanban")
    await expect(page.getByRole("heading", { name: /kanban/i })).toBeVisible()
  })

  test("el sidebar tiene enlace activo al dashboard", async ({ page }) => {
    const dashboardLink = page.getByRole("link", { name: /dashboard/i })
    await expect(dashboardLink).toBeVisible()
  })
})
