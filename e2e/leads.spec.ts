import { expect, test } from "@playwright/test"

test.describe("Prospectos (Leads) — CRUD E2E", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/leads")
  })

  test("muestra la página de prospectos correctamente", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Prospectos" })).toBeVisible()
    await expect(page.getByRole("button", { name: /nuevo prospecto/i })).toBeVisible()
  })

  test("abre el modal de nuevo prospecto", async ({ page }) => {
    await page.getByRole("button", { name: /nuevo prospecto/i }).click()
    await expect(page.getByRole("dialog")).toBeVisible()
    await expect(page.getByText("Nuevo Prospecto")).toBeVisible()
  })

  test("crea un prospecto nuevo", async ({ page }) => {
    await page.getByRole("button", { name: /nuevo prospecto/i }).click()

    // Llenar el formulario
    await page.getByLabel(/nombre del contacto/i).fill("Test Playwright")
    await page.getByLabel(/empresa/i).fill("Playwright Corp")
    await page.getByLabel(/email/i).fill("playwright@test.com")
    await page.getByLabel(/tipo de proyecto/i).fill("Web App E2E")
    await page.getByLabel(/descripción/i).fill("Prospecto creado por prueba automatizada E2E con Playwright")

    // Enviar
    await page.getByRole("button", { name: /guardar/i }).click()

    // Verificar que aparece en la lista
    await expect(page.getByText("Test Playwright")).toBeVisible()
  })

  test("busca un prospecto por nombre", async ({ page }) => {
    const searchInput = page.getByPlaceholder(/buscar por nombre/i)
    await searchInput.fill("Playwright")
    await expect(page.getByText("Test Playwright")).toBeVisible()
  })

  test("filtra prospectos por estado", async ({ page }) => {
    // Abrir el select de estado
    await page.getByRole("combobox").first().click()
    await page.getByRole("option", { name: "Nuevo" }).click()
    // Esperar resultados filtrados
    await page.waitForTimeout(300)
  })

  test("navega al detalle de un prospecto", async ({ page }) => {
    // Asume que hay al menos un prospecto en la lista
    const firstRow = page.locator("tbody tr").first()
    await firstRow.click()
    await expect(page.url()).toContain("/leads/")
  })

  test("muestra el panel de filtros avanzados", async ({ page }) => {
    // Click en el botón de filtros avanzados (ícono TrendingUp)
    await page.getByTitle("Filtros avanzados").click()
    await expect(page.getByLabel(/prioridad/i)).toBeVisible()
    await expect(page.getByLabel(/presupuesto mínimo/i)).toBeVisible()
  })
})
