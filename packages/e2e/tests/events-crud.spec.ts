import { expect, test } from '@playwright/test'
import { createEvent, register } from './helpers'

test.describe('Event CRUD', () => {
	test.beforeEach(async ({ page }) => {
		await register(page)
	})

	test('creates an event and navigates to detail page', async ({ page }) => {
		const event = await createEvent(page, { title: 'Yoga in the Park' })
		await expect(page.getByText('Yoga in the Park')).toBeVisible()
		await expect(page.getByText(event.description)).toBeVisible()
		await expect(page.getByText('MEETUP')).toBeVisible()
		await expect(page.getByText(event.locationName)).toBeVisible()
	})

	test('event appears in Browse Events list', async ({ page }) => {
		const event = await createEvent(page, { title: `Browse Test ${Date.now()}` })
		await page.goto('/events')
		// Search for the specific event to avoid pagination issues
		await page.getByPlaceholder('Search events...').fill(event.title)
		await expect(page.getByText(event.title)).toBeVisible({ timeout: 10_000 })
	})

	test('event appears in My Events (organized tab)', async ({ page }) => {
		const event = await createEvent(page, { title: `My Event ${Date.now()}` })
		await page.goto('/my-events')
		await expect(page.getByText(event.title)).toBeVisible({ timeout: 10_000 })
	})

	test('edits an event', async ({ page }) => {
		await createEvent(page, { title: 'Edit Me Event' })

		// On detail page, click Edit
		await page.getByRole('link', { name: /Edit Event/ }).click()
		await expect(page).toHaveURL(/\/events\/.*\/edit/)

		// Wait for form to load with existing data
		await expect(page.getByLabel('Title')).toHaveValue('Edit Me Event', { timeout: 10_000 })

		// Change title
		const titleInput = page.getByLabel('Title')
		await titleInput.clear()
		await titleInput.fill('Updated Event Title')
		await page.getByRole('button', { name: 'Save Changes' }).click()

		// Should redirect to detail page with updated title
		await page.waitForURL(/\/events\/[a-z0-9-]+$/i, { timeout: 10_000 })
		await expect(page.getByText('Updated Event Title')).toBeVisible({ timeout: 10_000 })
	})

	test('creates a paid event', async ({ page }) => {
		await createEvent(page, {
			title: `Paid Workshop ${Date.now()}`,
			category: 'Workshop',
			price: '150',
		})

		await expect(page.getByText('150 CZK')).toBeVisible()
	})

	test('creates a free event and shows "Free"', async ({ page }) => {
		await createEvent(page, {
			title: `Free Meetup ${Date.now()}`,
			price: '0',
		})

		await expect(page.getByText('Free', { exact: true })).toBeVisible()
	})
})
