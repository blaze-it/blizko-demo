import type { Page } from '@playwright/test'

let userCounter = 0

export function uniqueUser() {
	userCounter++
	const ts = Date.now()
	return {
		name: `Test User ${ts}`,
		username: `testuser${ts}${userCounter}`,
		email: `test${ts}${userCounter}@zokoli.cz`,
		password: 'TestPass123!',
	}
}

export async function register(
	page: Page,
	user?: ReturnType<typeof uniqueUser>,
) {
	const u = user ?? uniqueUser()
	await page.goto('/register')
	await page.getByLabel('Celé jméno').fill(u.name)
	await page.getByLabel('Uživatelské jméno').fill(u.username)
	await page.getByLabel('E-mail').fill(u.email)
	await page.getByLabel('Heslo').fill(u.password)
	await page.getByRole('button', { name: 'Vytvořit účet' }).click()
	await page.waitForURL(/\/events/, { timeout: 10_000 })
	return u
}

export async function login(
	page: Page,
	user: { username: string; password: string },
) {
	await page.goto('/login')
	await page.getByLabel('Uživatelské jméno nebo e-mail').fill(user.username)
	await page.getByLabel('Heslo').fill(user.password)
	await page.getByRole('button', { name: 'Přihlásit se' }).click()
	await page.waitForURL(/\/events/, { timeout: 10_000 })
}

export async function createEvent(
	page: Page,
	overrides?: Partial<{
		title: string
		description: string
		category: string
		date: string
		startTime: string
		endTime: string
		locationName: string
		address: string
		capacity: string
		price: string
	}>,
) {
	const defaults = {
		title: `Test Event ${Date.now()}`,
		description: 'A test event created by Playwright e2e tests.',
		category: 'Setkání',
		date: getFutureDate(),
		startTime: '10:00',
		endTime: '11:00',
		locationName: 'Test Park',
		address: 'Vinohradska 12, Prague',
		capacity: '20',
		price: '0',
	}
	const data = { ...defaults, ...overrides }

	await page.goto('/events/new')
	await page.getByLabel('Název', { exact: true }).fill(data.title)
	await page.getByLabel('Popis').fill(data.description)

	// Radix Select for category
	await page.getByRole('combobox').click()
	await page.getByRole('option', { name: data.category }).click()

	await page.getByLabel('Datum').fill(data.date)
	await page.getByLabel('Čas začátku').fill(data.startTime)
	if (data.endTime) {
		await page.locator('#endTime').fill(data.endTime)
	}

	await page.getByLabel('Název místa').fill(data.locationName)
	await page.getByLabel('Adresa').fill(data.address)
	await page.getByLabel('Kapacita').fill(data.capacity)

	const priceInput = page.locator('#price')
	await priceInput.clear()
	await priceInput.fill(data.price)

	await page.getByRole('button', { name: 'Vytvořit událost' }).click()

	// Wait for navigation to the event detail page
	await page.waitForFunction(() => !window.location.pathname.endsWith('/new'), {
		timeout: 10_000,
	})
	await page.waitForLoadState('networkidle')

	// Verify we landed on a valid event detail page
	const { expect } = await import('@playwright/test')
	await expect(page).toHaveURL(/\/events\/[a-z0-9-]+$/i)

	return data
}

function getFutureDate(): string {
	const d = new Date()
	d.setDate(d.getDate() + 7)
	return d.toISOString().split('T')[0]
}
