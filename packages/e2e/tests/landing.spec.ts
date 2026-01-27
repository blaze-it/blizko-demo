import { expect, test } from '@playwright/test'

test.describe('Landing Page', () => {
	test('shows hero content and navigation links', async ({ page }) => {
		await page.goto('/')

		// Header
		await expect(page.locator('header').getByText('blizko')).toBeVisible()
		await expect(page.getByRole('link', { name: 'Sign In' })).toBeVisible()
		await expect(page.locator('header').getByRole('link', { name: 'Get Started' })).toBeVisible()

		// Hero
		await expect(page.getByRole('heading', { name: /Your neighborhood/ }).first()).toBeVisible()
		await expect(page.getByText('comes alive').first()).toBeVisible()
		await expect(page.getByRole('link', { name: /Browse Events/ })).toBeVisible()
	})

	test('shows category cards', async ({ page }) => {
		await page.goto('/')

		for (const label of ['Workout', 'Workshop', 'Kids', 'Meetup', 'Lecture', 'Leisure']) {
			await expect(page.getByRole('heading', { name: label }).first()).toBeVisible()
		}
	})

	test('shows feature cards', async ({ page }) => {
		await page.goto('/')

		for (const title of ['Hyperlocal', 'Instant', 'Community', 'For Everyone']) {
			await expect(page.getByRole('heading', { name: title })).toBeVisible()
		}
	})

	test('shows CTA section and footer', async ({ page }) => {
		await page.goto('/')

		await expect(page.getByText('Ready to explore your neighborhood?')).toBeVisible()
		await expect(page.getByRole('link', { name: 'Get Started Free' })).toBeVisible()
		await expect(page.getByText('Local events, everyday.')).toBeVisible()
	})

	test('Sign In link navigates to login page', async ({ page }) => {
		await page.goto('/')
		await page.getByRole('link', { name: 'Sign In' }).click()
		await expect(page).toHaveURL('/login')
	})

	test('Get Started link navigates to register page', async ({ page }) => {
		await page.goto('/')
		await page.locator('header').getByRole('link', { name: 'Get Started' }).click()
		await expect(page).toHaveURL('/register')
	})
})
