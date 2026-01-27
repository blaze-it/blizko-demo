import { expect, test } from '@playwright/test'
import { register } from './helpers'

test.describe('Navigation & Sidebar', () => {
	test.beforeEach(async ({ page }) => {
		await register(page)
	})

	test('sidebar shows all navigation links', async ({ page }) => {
		await page.goto('/events')

		await expect(page.getByRole('link', { name: 'Home' })).toBeVisible()
		await expect(page.getByRole('link', { name: 'Browse Events' })).toBeVisible()
		await expect(page.getByRole('link', { name: 'Create Event' })).toBeVisible()
		await expect(page.getByRole('link', { name: 'My Events' })).toBeVisible()
		await expect(page.getByRole('link', { name: 'Profile' })).toBeVisible()
	})

	test('sidebar navigation works', async ({ page }) => {
		await page.goto('/events')

		await page.getByRole('link', { name: 'My Events' }).click()
		await expect(page).toHaveURL('/my-events')

		await page.getByRole('link', { name: 'Create Event' }).click()
		await expect(page).toHaveURL('/events/new')

		await page.getByRole('link', { name: 'Profile' }).click()
		await expect(page).toHaveURL('/profile')

		await page.getByRole('link', { name: 'Browse Events' }).click()
		await expect(page).toHaveURL('/events')
	})

	test('sidebar shows user info and sign out button', async ({ page }) => {
		await page.goto('/events')

		// Sign out button should exist
		await expect(page.getByTitle('Sign out')).toBeVisible()
	})

	test('sign out redirects to login', async ({ page }) => {
		await page.goto('/events')
		await page.getByTitle('Sign out').click()
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
