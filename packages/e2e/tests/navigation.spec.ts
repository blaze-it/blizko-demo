import { expect, test } from '@playwright/test'
import { register } from './helpers'

test.describe('Navigation & Sidebar', () => {
	test.beforeEach(async ({ page }) => {
		await register(page)
	})

	test('sidebar shows all navigation links', async ({ page }) => {
		await page.goto('/events')

		await expect(page.getByRole('link', { name: 'Domů' })).toBeVisible()
		await expect(
			page.getByRole('link', { name: 'Procházet události' }),
		).toBeVisible()
		await expect(
			page.getByRole('link', { name: 'Vytvořit událost' }),
		).toBeVisible()
		await expect(
			page.getByRole('link', { name: 'Moje události' }),
		).toBeVisible()
		await expect(page.getByRole('link', { name: 'Profil' })).toBeVisible()
	})

	test('sidebar navigation works', async ({ page }) => {
		await page.goto('/events')

		await page.getByRole('link', { name: 'Moje události' }).click()
		await expect(page).toHaveURL('/my-events')

		await page.getByRole('link', { name: 'Vytvořit událost' }).click()
		await expect(page).toHaveURL('/events/new')

		await page.getByRole('link', { name: 'Profil' }).click()
		await expect(page).toHaveURL('/profile')

		await page.getByRole('link', { name: 'Procházet události' }).click()
		await expect(page).toHaveURL('/events')
	})

	test('sidebar shows user info and sign out button', async ({ page }) => {
		await page.goto('/events')

		// Sign out button should exist
		await expect(page.getByTitle('Odhlásit se')).toBeVisible()
	})

	test('sign out redirects to login', async ({ page }) => {
		await page.goto('/events')
		await page.getByTitle('Odhlásit se').click()
		await expect(page).toHaveURL(/\/login/)
	})

	test('unauthenticated user is redirected to login', async ({ page }) => {
		// Clear cookies to simulate logged out state
		await page.context().clearCookies()
		await page.goto('/events')
		await expect(page).toHaveURL(/\/login/, { timeout: 10_000 })
	})

	test('404 page shows for unknown routes', async ({ page }) => {
		await page.goto('/some-unknown-page')
		await expect(page.getByText('404')).toBeVisible()
	})
})
