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
		const event = await createEvent(page, {
			title: `Browse Test ${Date.now()}`,
		})
		await page.goto('/events')
		// Search for the specific event to avoid pagination issues
		await page.getByPlaceholder('Hledat události...').fill(event.title)
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
		await page.getByRole('link', { name: /Upravit událost/ }).click()
		await expect(page).toHaveURL(/\/events\/.*\/edit/)

		// Wait for form to load with existing data
		await expect(
			page.getByLabel('Název', { exact: true }),
		).toHaveValue('Edit Me Event', {
			timeout: 10_000,
		})

		// Change title
		const titleInput = page.getByLabel('Název', { exact: true })
		await titleInput.clear()
		await titleInput.fill('Updated Event Title')
		await page.getByRole('button', { name: 'Uložit změny' }).click()

		// Should redirect to detail page with updated title
		await page.waitForURL(/\/events\/[a-z0-9-]+$/i, { timeout: 10_000 })
		await expect(page.getByText('Updated Event Title')).toBeVisible({
			timeout: 10_000,
		})
	})

	test('creates a paid event', async ({ page }) => {
		await createEvent(page, {
			title: `Paid Workshop ${Date.now()}`,
			category: 'Workshop',
			price: '150',
		})

		await expect(page.getByText('150 CZK')).toBeVisible()
	})

	test('creates event with empty optional duration field', async ({ page }) => {
		await page.goto('/events/new')
		await page.getByLabel('Název', { exact: true }).fill(`Duration Test ${Date.now()}`)
		await page.getByLabel('Popis').fill('Testing empty duration field')
		await page.getByRole('combobox').click()
		await page.getByRole('option', { name: 'Setkání' }).click()
		const futureDate = new Date()
		futureDate.setDate(futureDate.getDate() + 7)
		await page.getByLabel('Datum').fill(futureDate.toISOString().split('T')[0])
		await page.getByLabel('Čas začátku').fill('10:00')
		await page.getByLabel('Název místa').fill('Test Park')
		await page.getByLabel('Adresa').fill('Test Address 1, Prague')
		await page.getByLabel('Kapacita').fill('20')

		// Click into duration field and leave it empty (the bug scenario)
		const durationInput = page.locator('#durationMinutes')
		await durationInput.click()
		await durationInput.fill('')

		const priceInput = page.locator('#price')
		await priceInput.clear()
		await priceInput.fill('0')

		await page.getByRole('button', { name: 'Vytvořit událost' }).click()

		// Should successfully create and navigate to detail page
		await expect(page).toHaveURL(/\/events\/[a-z0-9-]+$/i, { timeout: 10_000 })
	})

	test('creates a free event and shows "Zdarma"', async ({ page }) => {
		await createEvent(page, {
			title: `Free Meetup ${Date.now()}`,
			price: '0',
		})

		await expect(page.getByText('Zdarma', { exact: true })).toBeVisible()
	})
})
