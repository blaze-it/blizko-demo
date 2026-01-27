import type { Page } from '@playwright/test'

let userCounter = 0

export function uniqueUser() {
	userCounter++
	const ts = Date.now()
	return {
		name: `Test User ${ts}`,
		username: `testuser${ts}${userCounter}`,
		email: `test${ts}${userCounter}@blizko.cz`,
		password: 'TestPass123!',
	}
}

export async function register(page: Page, user?: ReturnType<typeof uniqueUser>) {
	const u = user ?? uniqueUser()
	await page.goto('/register')
	await page.getByLabel('Full Name').fill(u.name)
	await page.getByLabel('Username').fill(u.username)
	await page.getByLabel('Email').fill(u.email)
	await page.getByLabel('Password').fill(u.password)
	await page.getByRole('button', { name: 'Create Account' }).click()
	await page.waitForURL(/\/events/, { timeout: 10_000 })
	return u
}

export async function login(page: Page, user: { username: string; password: string }) {
	await page.goto('/login')
	await page.getByLabel('Username or Email').fill(user.username)
	await page.getByLabel('Password').fill(user.password)
	await page.getByRole('button', { name: 'Sign In' }).click()
	await page.waitForURL(/\/events/, { timeout: 10_000 })
}

export async function createEvent(page: Page, overrides?: Partial<{
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
}>) {
	const defaults = {
		title: `Test Event ${Date.now()}`,
		description: 'A test event created by Playwright e2e tests.',
		category: 'Meetup',
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
	await page.getByLabel('Title').fill(data.title)
	await page.getByLabel('Description').fill(data.description)

	// Radix Select for category
	await page.getByRole('combobox').click()
	await page.getByRole('option', { name: data.category }).click()

	await page.getByLabel('Date').fill(data.date)
	await page.getByLabel('Start Time').fill(data.startTime)
	if (data.endTime) {
		await page.locator('#endTime').fill(data.endTime)
	}

	await page.getByLabel('Location Name').fill(data.locationName)
	await page.getByLabel('Address').fill(data.address)
	await page.getByLabel('Capacity').fill(data.capacity)

	const priceInput = page.locator('#price')
	await priceInput.clear()
	await priceInput.fill(data.price)

	await page.getByRole('button', { name: 'Create Event' }).click()

	// Wait for navigation away from /events/new to the event detail page
	await page.waitForFunction(
		() => !window.location.pathname.endsWith('/new'),
		{ timeout: 10_000 },
	)
	await page.waitForLoadState('networkidle')

	return data
}

function getFutureDate(): string {
	const d = new Date()
	d.setDate(d.getDate() + 7)
	return d.toISOString().split('T')[0]
}
