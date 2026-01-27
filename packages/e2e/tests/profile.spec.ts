import { expect, test } from '@playwright/test'
import { register } from './helpers'

test.describe('Profile Page', () => {
	test('shows user profile information', async ({ page }) => {
		const user = await register(page)
		await page.goto('/profile')

		await expect(page.getByRole('heading', { name: user.name })).toBeVisible()
		await expect(page.getByText(user.email).first()).toBeVisible()
		await expect(page.getByText('Informace o účtu')).toBeVisible()
		await expect(page.getByText('Členem od')).toBeVisible()
	})

	test('can edit profile name', async ({ page }) => {
		const _user = await register(page)
		await page.goto('/profile')

		await page.getByRole('button', { name: 'Upravit' }).click()

		// Dialog should appear
		await expect(page.getByText('Upravit profil')).toBeVisible()

		const nameInput = page.getByLabel('Jméno')
		await nameInput.clear()
		await nameInput.fill('Updated Name')
		await page.getByRole('button', { name: 'Uložit' }).click()

		// Should show updated name in the heading
		await expect(
			page.getByRole('heading', { name: 'Updated Name' }),
		).toBeVisible({ timeout: 10_000 })
	})

	test('back to events link works', async ({ page }) => {
		await register(page)
		await page.goto('/profile')
		await page.getByRole('link', { name: /Zpět na události/ }).click()
		await expect(page).toHaveURL('/events')
	})
})
