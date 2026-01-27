import { expect, test } from '@playwright/test'

test.describe('Landing Page', () => {
	test('shows hero content and navigation links', async ({ page }) => {
		await page.goto('/')

		// Header
		await expect(page.locator('header').getByText('blizko')).toBeVisible()
		await expect(page.getByRole('link', { name: 'Přihlásit se' })).toBeVisible()
		await expect(
			page.locator('header').getByRole('link', { name: 'Začít' }),
		).toBeVisible()

		// Hero
		await expect(
			page.getByRole('heading', { name: /Vaše sousedství/ }).first(),
		).toBeVisible()
		await expect(page.getByText('ožívá').first()).toBeVisible()
		await expect(
			page.getByRole('link', { name: /Procházet události/ }),
		).toBeVisible()
	})

	test('shows category cards', async ({ page }) => {
		await page.goto('/')

		for (const label of [
			'Cvičení',
			'Workshop',
			'Děti',
			'Setkání',
			'Přednáška',
			'Volný čas',
		]) {
			await expect(
				page.getByRole('heading', { name: label }).first(),
			).toBeVisible()
		}
	})

	test('shows feature cards', async ({ page }) => {
		await page.goto('/')

		for (const title of ['Hyperlocal', 'Okamžité', 'Komunita', 'Pro každého']) {
			await expect(page.getByRole('heading', { name: title })).toBeVisible()
		}
	})

	test('shows CTA section and footer', async ({ page }) => {
		await page.goto('/')

		await expect(
			page.getByText('Připraveni prozkoumat své okolí?'),
		).toBeVisible()
		await expect(page.getByRole('link', { name: 'Začít zdarma' })).toBeVisible()
		await expect(page.getByText('Lokální události, každý den.')).toBeVisible()
	})

	test('Sign In link navigates to login page', async ({ page }) => {
		await page.goto('/')
		await page.getByRole('link', { name: 'Přihlásit se' }).click()
		await expect(page).toHaveURL('/login')
	})

	test('Get Started link navigates to register page', async ({ page }) => {
		await page.goto('/')
		await page.locator('header').getByRole('link', { name: 'Začít' }).click()
		await expect(page).toHaveURL('/register')
	})
})
