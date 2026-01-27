import { expect, test } from '@playwright/test'
import { login, register, uniqueUser } from './helpers'

test.describe('Registration', () => {
	test('registers a new user and redirects to events', async ({ page }) => {
		const user = uniqueUser()
		await register(page, user)
		await expect(page).toHaveURL(/\/events/)
		await expect(page.getByRole('heading', { name: 'Browse Events' })).toBeVisible()
	})

	test('shows validation errors for empty fields', async ({ page }) => {
		await page.goto('/register')
		await page.getByRole('button', { name: 'Create Account' }).click()

		await expect(page.getByText('Name is required')).toBeVisible()
	})

	test('shows error for duplicate username', async ({ page }) => {
		const user = uniqueUser()
		await register(page, user)

		// Sign out and try to register with same username
		await page.goto('/register')
		const dup = { ...uniqueUser(), username: user.username }
		await page.getByLabel('Full Name').fill(dup.name)
		await page.getByLabel('Username').fill(dup.username)
		await page.getByLabel('Email').fill(dup.email)
		await page.getByLabel('Password').fill(dup.password)
		await page.getByRole('button', { name: 'Create Account' }).click()

		// Should show some error (not redirect to events)
		await page.waitForTimeout(2000)
		const url = page.url()
		expect(url).toContain('/register')
	})

	test('has link to sign in page', async ({ page }) => {
		await page.goto('/register')
		await page.getByRole('link', { name: 'Sign in' }).click()
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
		await page.getByRole('button', { name: 'Sign In' }).click()

		await expect(page.getByText('Username is required')).toBeVisible()
	})

	test('shows error for wrong credentials', async ({ page }) => {
		await page.goto('/login')
		await page.getByLabel('Username or Email').fill('nonexistent')
		await page.getByLabel('Password').fill('wrongpassword')
		await page.getByRole('button', { name: 'Sign In' }).click()

		await page.waitForTimeout(2000)
		// Should stay on login page or show error
		expect(page.url()).toContain('/login')
	})

	test('has link to register page', async ({ page }) => {
		await page.goto('/login')
		await page.getByRole('link', { name: 'Sign up' }).click()
		await expect(page).toHaveURL('/register')
	})
})
