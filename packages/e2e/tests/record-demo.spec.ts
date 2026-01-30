import { test } from '@playwright/test'

test.setTimeout(180000)

test('record demo video', async ({ browser }) => {
	const context = await browser.newContext({
		recordVideo: {
			dir: '/Users/xxx/p/blizko/',
			size: { width: 1280, height: 720 },
		},
	})
	const page = await context.newPage()

	const wait = (ms: number) => page.waitForTimeout(ms)

	// ===== LANDING =====
	await page.goto('http://localhost:3000')
	await wait(2500)
	await page.evaluate(() => window.scrollTo({ top: 500, behavior: 'smooth' }))
	await wait(2000)
	await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }))
	await wait(1500)

	// ===== REGISTER =====
	await page.click('text=Začít')
	await wait(1500)
	const ts = Date.now()
	await page.fill('[placeholder="Vaše jméno"]', 'Jana Nováková')
	await wait(600)
	await page.fill('[placeholder="Zvolte uživatelské jméno"]', `jana${ts}`)
	await wait(600)
	await page.fill('[placeholder="vas@email.cz"]', `jana${ts}@example.com`)
	await wait(600)
	await page.fill('[placeholder="Alespoň 8 znaků"]', 'heslo12345')
	await wait(1000)
	await page.click('button:has-text("Vytvořit účet")')
	await page.waitForURL('**/events', { timeout: 10000 })
	await wait(2500)

	// ===== EVENTS + MAP =====
	await page.waitForSelector('.leaflet-container', { timeout: 5000 })
	await wait(2000)

	// ===== CREATE EVENT =====
	await page.click('a[href="/events/new"]')
	await wait(2000)
	await page.fill('[placeholder="např. Ranní jóga v parku"]', 'Tvořivá dílna pro děti')
	await wait(500)
	await page.fill('[placeholder="Popište svou událost..."]', 'Kreativní odpoledne pro děti od 4 let.')
	await wait(500)
	await page.locator('select').selectOption('WORKSHOP')
	await wait(500)
	const d = new Date(); d.setDate(d.getDate() + 3)
	await page.locator('input[type="date"]').fill(d.toISOString().split('T')[0])
	await wait(400)
	await page.locator('input[type="time"]').first().fill('15:00')
	await wait(400)
	await page.fill('[placeholder="např. Dvůr na Vinohradské 12"]', 'Komunitní centrum')
	await wait(400)
	await page.fill('[placeholder="Celá adresa"]', 'Korunní 98, Praha')
	await wait(400)
	await page.getByLabel('Kapacita').fill('12')
	await wait(1500)

	// ===== SAVE DRAFT =====
	await page.click('button:has-text("Uložit koncept")')
	await page.waitForURL('**/preview', { timeout: 10000 })
	await wait(3000)

	// ===== PUBLISH =====
	await page.click('button:has-text("Publikovat")')
	await page.waitForURL(/\/events\/[^/]+$/, { timeout: 10000 })
	await wait(3000)

	// ===== CHECK-IN =====
	await page.click('text=Odbavit účastníky')
	await wait(2500)
	await page.fill('input[placeholder*="vstupenky"]', 'ZOKOLI:demo123')
	await wait(1500)
	await page.click('text=Zpet na udalost')
	await wait(1500)

	// ===== SHARE =====
	await page.click('button:has-text("Sdilet")')
	await wait(2000)
	await page.keyboard.press('Escape')
	await wait(1000)

	// ===== BROWSE & JOIN =====
	await page.click('a[href="/events"]')
	await wait(2500)
	const event = page.locator('a[href^="/events/cml"]').first()
	if (await event.count() > 0) {
		await event.click()
		await wait(2000)
		const join = page.locator('button:has-text("Připojit se")')
		if (await join.count() > 0) {
			await join.click()
			await wait(2000)
			// Ticket
			const ticket = page.locator('text=Zobrazit vstupenku')
			if (await ticket.count() > 0) {
				await ticket.click()
				await wait(3000)
				await page.click('text=Zpet na udalost')
				await wait(1500)
			}
		}
		// Report
		const report = page.locator('button:has-text("Nahlasit")')
		if (await report.count() > 0) {
			await report.click()
			await wait(2000)
			await page.keyboard.press('Escape')
			await wait(1000)
		}
	}

	// ===== FEED =====
	await page.click('a[href="/feed"]')
	await wait(2500)

	// ===== MY EVENTS =====
	await page.click('a[href="/my-events"]')
	await wait(2500)

	// ===== PROFILE =====
	await page.click('a[href="/profile"]')
	await wait(2500)

	// ===== THEME =====
	await page.click('button:has-text("Přepnout motiv")')
	await wait(1500)
	await page.click('button:has-text("Přepnout motiv")')
	await wait(1500)

	// ===== END =====
	await page.click('a[href="/"]')
	await wait(2000)

	await context.close()
})
