import { expect, test } from '@playwright/test'
import { createEvent, register } from './helpers'

test.describe('My Events Page', () => {
	test.beforeEach(async ({ page }) => {
		await register(page)
	})

	test('shows empty state for organized tab', async ({ page }) => {
		await page.goto('/my-events')
		await expect(page.getByText("You haven't created any events yet")).toBeVisible()
		await expect(page.getByRole('button', { name: 'Create your first event' })).toBeVisible()
	})

	test('shows empty state for joined tab', async ({ page }) => {
		await page.goto('/my-events')
		await page.getByRole('button', { name: 'Joined' }).click()
		await expect(page.getByText("You haven't joined any events yet")).toBeVisible()
		await expect(page.getByRole('button', { name: 'Browse events' })).toBeVisible()
	})

	test('tabs switch between organized and joined', async ({ page }) => {
		await page.goto('/my-events')

		// Default tab is Organized
		await expect(page.getByText("You haven't created any events yet")).toBeVisible()

		// Switch to Joined
		await page.getByRole('button', { name: 'Joined' }).click()
		await expect(page.getByText("You haven't joined any events yet")).toBeVisible()

		// Switch back
		await page.getByRole('button', { name: 'Organized' }).click()
		await expect(page.getByText("You haven't created any events yet")).toBeVisible()
	})

	test('organized events show after creating one', async ({ page }) => {
		const event = await createEvent(page, { title: `My Organized ${Date.now()}` })
		await page.goto('/my-events')
		await expect(page.getByText(event.title)).toBeVisible()
	})

	test('Create Event button on page header works', async ({ page }) => {
		await page.goto('/my-events')
		await page.getByRole('button', { name: 'Create Event' }).first().click()
		await expect(page).toHaveURL('/events/new')
	})

	test('clicking event card navigates to detail', async ({ page }) => {
		const event = await createEvent(page, { title: `Card Click ${Date.now()}` })
		await page.goto('/my-events')
		await page.getByText(event.title).click()
		await expect(page).toHaveURL(/\/events\/[a-z0-9-]+$/i)
	})
})
