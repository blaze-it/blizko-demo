import { test } from '@playwright/test'

// Mobile viewport: iPhone 14 dimensions
const MOBILE_VIEWPORT = { width: 390, height: 844 }

test.use({
	viewport: MOBILE_VIEWPORT,
	video: { mode: 'on', size: MOBILE_VIEWPORT },
	launchOptions: { slowMo: 300 },
})

async function pause(ms: number) {
	return new Promise((r) => setTimeout(r, ms))
}

async function smoothScroll(
	page: import('@playwright/test').Page,
	distance: number,
	steps = 4,
) {
	const step = distance / steps
	for (let i = 0; i < steps; i++) {
		await page.mouse.wheel(0, step)
		await pause(250)
	}
	await pause(400)
}

test('demo video — mobile walkthrough', async ({ page }) => {
	test.setTimeout(120_000)

	// ─── 1. Landing page ───
	await page.goto('/')
	await page.waitForLoadState('networkidle')
	await pause(1500)

	// Scroll through the landing page sections
	await smoothScroll(page, 600)
	await pause(800)
	await smoothScroll(page, 600)
	await pause(800)
	await smoothScroll(page, 600)
	await pause(800)
	await smoothScroll(page, 600)
	await pause(800)

	// Scroll back to top
	await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }))
	await pause(1000)

	// ─── 2. Register ───
	// "Začít" button leads to register
	await page.getByRole('link', { name: /Začít/i }).first().click()
	await page.waitForURL('/register')
	await pause(800)

	const user = {
		name: 'Jana Nováková',
		username: `jana${Date.now()}`,
		email: `jana${Date.now()}@zokoli.cz`,
		password: 'DemoPass123!',
	}

	await page.getByLabel('Celé jméno').fill(user.name)
	await pause(300)
	await page.getByLabel('Uživatelské jméno').fill(user.username)
	await pause(300)
	await page.getByLabel('E-mail').fill(user.email)
	await pause(300)
	await page.getByLabel('Heslo').fill(user.password)
	await pause(500)

	await page.getByRole('button', { name: 'Vytvořit účet' }).click()
	await page.waitForURL(/\/events/, { timeout: 15_000 })
	await page.waitForLoadState('networkidle')
	await pause(1500)

	// ─── 3. Browse events page ───
	// We should already be on /events after registration
	await pause(1000)

	// Scroll through events list
	await smoothScroll(page, 400)
	await pause(800)

	// Scroll back up
	await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }))
	await pause(1000)

	// ─── 4. Create a new event ───
	// Look for the floating action button or navigate via sidebar
	const fab = page.locator('a[href="/events/new"]').first()
	if (await fab.isVisible()) {
		await fab.click()
	} else {
		await page.goto('/events/new')
	}
	await page.waitForURL('/events/new')
	await pause(800)

	await page.getByLabel('Název', { exact: true }).fill('Ranní jóga v parku')
	await pause(300)
	await page
		.getByLabel('Popis')
		.fill(
			'Přijďte si zacvičit jógu pod širým nebem! Vhodné pro všechny úrovně.',
		)
	await pause(300)

	// Select category
	await page.getByRole('combobox').click()
	await pause(300)
	await page.getByRole('option', { name: 'Cvičení' }).click()
	await pause(300)

	// Date - 7 days from now
	const futureDate = new Date()
	futureDate.setDate(futureDate.getDate() + 7)
	const dateStr = futureDate.toISOString().split('T')[0]
	await page.getByLabel('Datum').fill(dateStr)
	await pause(200)

	await page.getByLabel('Čas začátku').fill('08:00')
	await pause(200)
	await page.locator('#endTime').fill('09:30')
	await pause(200)

	// Scroll down to see more fields
	await smoothScroll(page, 300)
	await pause(400)

	await page.getByLabel('Název místa').fill('Riegrovy sady')
	await pause(200)
	await page.getByLabel('Adresa').fill('Riegrovy sady, Praha 2')
	await pause(200)

	await page.getByLabel('Kapacita').fill('15')
	await pause(200)
	const priceInput = page.locator('#price')
	await priceInput.clear()
	await priceInput.fill('0')
	await pause(500)

	// Scroll to submit button
	await smoothScroll(page, 200)
	await pause(400)

	await page.getByRole('button', { name: 'Vytvořit událost' }).click()

	// Wait for redirect to event detail
	await page.waitForFunction(() => !window.location.pathname.endsWith('/new'), {
		timeout: 15_000,
	})
	await page.waitForLoadState('networkidle')
	await pause(1500)

	// ─── 5. Event detail page ───
	// Scroll through the event detail
	await smoothScroll(page, 400)
	await pause(1000)

	// Scroll back up
	await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }))
	await pause(1000)

	// ─── 6. Navigate to My Events ───
	await page.goto('/my-events')
	await page.waitForLoadState('networkidle')
	await pause(1500)

	// ─── 7. Profile page ───
	await page.goto('/profile')
	await page.waitForLoadState('networkidle')
	await pause(1500)

	// ─── 8. Back to events browse ───
	await page.goto('/events')
	await page.waitForLoadState('networkidle')
	await pause(1500)

	// Final pause before video ends
	await pause(1000)
})
