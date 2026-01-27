import { expect, test } from '@playwright/test'
import { createEvent, register } from './helpers'

test.describe('My Events Page', () => {
	test.beforeEach(async ({ page }) => {
		await register(page)
	})

	test('shows empty state for organized tab', async ({ page }) => {
		await page.goto('/my-events')
		await expect(
			page.getByText('Zatím jste nevytvořili žádné události'),
		).toBeVisible()
		await expect(
			page.getByRole('button', { name: 'Vytvořte svou první událost' }),
		).toBeVisible()
	})

	test('shows empty state for joined tab', async ({ page }) => {
		await page.goto('/my-events')
		await page.getByRole('button', { name: 'Zúčastněné' }).click()
		await expect(
			page.getByText('Zatím jste se nezúčastnili žádných událostí'),
		).toBeVisible()
		await expect(
			page.getByRole('button', { name: 'Procházet události' }),
		).toBeVisible()
	})

	test('tabs switch between organized and joined', async ({ page }) => {
		await page.goto('/my-events')

		// Default tab is Organized
		await expect(
			page.getByText('Zatím jste nevytvořili žádné události'),
		).toBeVisible()

		// Switch to Joined
		await page.getByRole('button', { name: 'Zúčastněné' }).click()
		await expect(
			page.getByText('Zatím jste se nezúčastnili žádných událostí'),
		).toBeVisible()

		// Switch back
		await page.getByRole('button', { name: 'Organizované' }).click()
		await expect(
			page.getByText('Zatím jste nevytvořili žádné události'),
		).toBeVisible()
	})

	test('organized events show after creating one', async ({ page }) => {
		const event = await createEvent(page, {
			title: `My Organized ${Date.now()}`,
		})
		await page.goto('/my-events')
		await expect(page.getByText(event.title)).toBeVisible()
	})

	test('Create Event button on page header works', async ({ page }) => {
		await page.goto('/my-events')
		await page.getByRole('button', { name: 'Vytvořit událost' }).first().click()
		await expect(page).toHaveURL('/events/new')
	})

	test('clicking event card navigates to detail', async ({ page }) => {
		const event = await createEvent(page, { title: `Card Click ${Date.now()}` })
		await page.goto('/my-events')
		await page.getByText(event.title).click()
		await expect(page).toHaveURL(/\/events\/[a-z0-9-]+$/i)
	})
})
