import { expect, test } from '@playwright/test'
import { login, register, uniqueUser } from './helpers'

test.describe('Registration', () => {
	test('registers a new user and redirects to events', async ({ page }) => {
		const user = uniqueUser()
		await register(page, user)
		await expect(page).toHaveURL(/\/events/)
		await expect(
			page.getByRole('heading', { name: 'Procházet události' }),
		).toBeVisible()
	})

	test('shows validation errors for empty fields', async ({ page }) => {
		await page.goto('/register')
		await page.getByRole('button', { name: 'Vytvořit účet' }).click()

		await expect(page.getByText('Jméno je povinné')).toBeVisible()
	})

	test('shows error for duplicate username', async ({ page }) => {
		const user = uniqueUser()
		await register(page, user)

		// Sign out and try to register with same username
		await page.goto('/register')
		const dup = { ...uniqueUser(), username: user.username }
		await page.getByLabel('Celé jméno').fill(dup.name)
		await page.getByLabel('Uživatelské jméno').fill(dup.username)
		await page.getByLabel('E-mail').fill(dup.email)
		await page.getByLabel('Heslo').fill(dup.password)
		await page.getByRole('button', { name: 'Vytvořit účet' }).click()

		// Should show an error message and stay on register page
		await expect(page.locator('.text-destructive').first()).toBeVisible({
			timeout: 5_000,
		})
		expect(page.url()).toContain('/register')
	})

	test('has link to sign in page', async ({ page }) => {
		await page.goto('/register')
		await page.getByRole('link', { name: 'Přihlásit se' }).click()
		await expect(page).toHaveURL('/login')
	})
})

test.describe('Login', () => {
	test('logs in with username and redirects to events', async ({ page }) => {
		const user = uniqueUser()
		await register(page, user)
		await page.goto('/login')
		await login(page, user)
		await expect(page).toHaveURL(/\/events/)
	})

	test('logs in with email', async ({ page }) => {
		const user = uniqueUser()
		await register(page, user)
		await page.goto('/login')
		await login(page, { username: user.email, password: user.password })
		await expect(page).toHaveURL(/\/events/)
	})

	test('shows validation errors for empty fields', async ({ page }) => {
		await page.goto('/login')
		await page.getByRole('button', { name: 'Přihlásit se' }).click()

		await expect(page.getByText('Uživatelské jméno je povinné')).toBeVisible()
	})

	test('shows error for wrong credentials', async ({ page }) => {
		await page.goto('/login')
		await page.getByLabel('Uživatelské jméno nebo e-mail').fill('nonexistent')
		await page.getByLabel('Heslo').fill('wrongpassword')
		await page.getByRole('button', { name: 'Přihlásit se' }).click()

		// Should show an error message and stay on login page
		await expect(page.locator('.text-destructive').first()).toBeVisible({
			timeout: 5_000,
		})
		expect(page.url()).toContain('/login')
	})

	test('has link to register page', async ({ page }) => {
		await page.goto('/login')
		await page.getByRole('link', { name: 'Zaregistrovat se' }).click()
		await expect(page).toHaveURL('/register')
	})
})
