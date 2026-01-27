import { expect, test } from '@playwright/test'
import { createEvent, register } from './helpers'

test.describe('Event Participation', () => {
	test('another user can join an event', async ({ page, context }) => {
		// Create event as user A
		await register(page)
		const event = await createEvent(page, { title: `Join Test ${Date.now()}` })
		const eventUrl = page.url()

		// Clear cookies to log out
		await context.clearCookies()

		// Register as user B
		await register(page)

		// Navigate to the event and wait for it to load
		await page.goto(eventUrl)
		await expect(page.getByText(event.title)).toBeVisible({ timeout: 10_000 })
		await page.getByRole('button', { name: 'Připojit se' }).click()

		// Should now show "Odejít z události" instead
		await expect(
			page.getByRole('button', { name: 'Odejít z události' }),
		).toBeVisible({ timeout: 10_000 })
	})

	test('user can leave an event after joining', async ({ page, context }) => {
		// Create event as user A
		await register(page)
		const event = await createEvent(page, { title: `Leave Test ${Date.now()}` })
		const eventUrl = page.url()

		// Clear cookies to log out
		await context.clearCookies()

		// Register as user B
		await register(page)

		// Join
		await page.goto(eventUrl)
		await expect(page.getByText(event.title)).toBeVisible({ timeout: 10_000 })
		await page.getByRole('button', { name: 'Připojit se' }).click()
		await expect(
			page.getByRole('button', { name: 'Odejít z události' }),
		).toBeVisible({ timeout: 10_000 })

		// Leave
		await page.getByRole('button', { name: 'Odejít z události' }).click()
		await expect(page.getByRole('button', { name: 'Připojit se' })).toBeVisible(
			{ timeout: 10_000 },
		)
	})

	test('joined event appears in My Events (joined tab)', async ({
		page,
		context,
	}) => {
		// Create event as user A
		await register(page)
		const event = await createEvent(page, { title: `Joined Tab ${Date.now()}` })
		const eventUrl = page.url()

		// Clear cookies to log out
		await context.clearCookies()

		// Register as user B and join
		await register(page)
		await page.goto(eventUrl)
		await expect(page.getByText(event.title)).toBeVisible({ timeout: 10_000 })
		await page.getByRole('button', { name: 'Připojit se' }).click()
		await expect(
			page.getByRole('button', { name: 'Odejít z události' }),
		).toBeVisible({ timeout: 10_000 })

		// Check My Events > Joined tab
		await page.goto('/my-events')
		await page.getByRole('button', { name: 'Zúčastněné' }).click()
		await expect(page.getByText(event.title)).toBeVisible({ timeout: 10_000 })
	})

	test('organizer sees Edit and Cancel buttons, not Join', async ({ page }) => {
		await register(page)
		await createEvent(page, { title: `Organizer View ${Date.now()}` })

		await expect(
			page.getByRole('link', { name: /Upravit událost/ }),
		).toBeVisible()
		await expect(
			page.getByRole('button', { name: /Zrušit událost/ }),
		).toBeVisible()
		// Should NOT have Join button
		await expect(
			page.getByRole('button', { name: 'Připojit se' }),
		).not.toBeVisible()
	})

	test('event detail shows participant count', async ({ page }) => {
		await register(page)
		await createEvent(page, {
			title: `Count Test ${Date.now()}`,
			capacity: '10',
		})

		await expect(page.getByText(/0 \/ 10 obsazeno/)).toBeVisible()
	})
})
