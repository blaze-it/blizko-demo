import { expect, test } from '@playwright/test'
import { createEvent, register } from './helpers'

test.describe('Browse Events', () => {
	test.beforeEach(async ({ page }) => {
		await register(page)
	})

	test('shows empty state when no events match', async ({ page }) => {
		await page.goto('/events')
		// Search for something that won't exist
		await page.getByPlaceholder('Hledat události...').fill('zzzznonexistent999')
		await page.waitForTimeout(1000)
		await expect(page.getByText('Žádné události nenalezeny')).toBeVisible()
	})

	test('shows events page with filters', async ({ page }) => {
		await page.goto('/events')
		await expect(
			page.getByRole('heading', { name: 'Procházet události' }),
		).toBeVisible()
		await expect(page.getByPlaceholder('Hledat události...')).toBeVisible()
		// Category filter exists
		await expect(page.getByRole('combobox')).toBeVisible()
		// Date filter exists
		await expect(page.locator('input[type="date"]')).toBeVisible()
	})

	test('search filters events by title', async ({ page }) => {
		const uniqueTitle = `Unique Search Test ${Date.now()}`
		await createEvent(page, { title: uniqueTitle })
		await page.goto('/events')

		await page.getByPlaceholder('Hledat události...').fill(uniqueTitle)
		await page.waitForTimeout(1000)
		await expect(page.getByText(uniqueTitle)).toBeVisible()
	})

	test('clicking an event navigates to detail page', async ({ page }) => {
		const event = await createEvent(page, { title: `Click Test ${Date.now()}` })
		await page.goto('/events')
		// Search for the specific event to avoid pagination issues
		await page.getByPlaceholder('Hledat události...').fill(event.title)
		await expect(page.getByText(event.title)).toBeVisible({ timeout: 10_000 })
		await page.getByText(event.title).click()
		await expect(page).toHaveURL(/\/events\//)
		await expect(page.getByText(event.title)).toBeVisible()
	})

	test('floating create button navigates to new event page', async ({
		page,
	}) => {
		await page.goto('/events')
		// The floating + button
		await page.locator('button.fixed').click()
		await expect(page).toHaveURL('/events/new')
	})
})
