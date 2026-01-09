/**
 * E2E test for authentication flow.
 *
 * Tests: Sign up → Create task → Logout
 */
import { test, expect } from '@playwright/test'

test.describe('Authentication Flow', () => {
  test('should complete sign-up → create task → logout flow', async ({ page }) => {
    // Navigate to sign-up page
    await page.goto('/signup')

    // Fill out sign-up form
    await page.fill('input[name="email"]', 'e2e-test@example.com')
    await page.fill('input[name="password"]', 'SecurePass123!')
    await page.fill('input[name="confirm-password"]', 'SecurePass123!')
    await page.fill('input[name="name"]', 'E2E Test User')

    // Submit form
    await page.click('button[type="submit"]')

    // Should redirect to dashboard
    await expect(page).toHaveURL(/\/dashboard/)

    // Create a task
    await page.click('text=New Task')
    await expect(page).toHaveURL(/\/create/)

    await page.fill('input[name="title"]', 'E2E Test Task')
    await page.fill('textarea[name="description"]', 'Created during E2E test')

    await page.click('button[type="submit"]')

    // Should redirect back to dashboard
    await expect(page).toHaveURL(/\/dashboard/)

    // Verify task appears in list
    await expect(page.locator('text=E2E Test Task')).toBeVisible()

    // Sign out
    await page.click('text=Sign Out')

    // Should redirect to sign-in page
    await expect(page).toHaveURL(/\/signin/)

    // Verify not logged in
    await expect(page.locator('text=Sign In')).toBeVisible()
  })

  test('should show validation errors on invalid input', async ({ page }) => {
    await page.goto('/signup')

    // Submit empty form
    await page.click('button[type="submit"]')

    // Should show required field errors
    await expect(page.locator('text=required')).toBeVisible()

    // Test password mismatch
    await page.fill('input[name="email"]', 'test@example.com')
    await page.fill('input[name="password"]', 'Password123!')
    await page.fill('input[name="confirm-password"]', 'DifferentPassword123!')

    await page.click('button[type="submit"]')

    // Should show password mismatch error
    await expect(page.locator('text=do not match')).toBeVisible()
  })

  test('should handle sign-in flow', async ({ page }) => {
    // First, create a user via API (or sign up manually)
    await page.goto('/signup')
    await page.fill('input[name="email"]', 'signin-test@example.com')
    await page.fill('input[name="password"]', 'SecurePass123!')
    await page.fill('input[name="confirm-password"]', 'SecurePass123!')
    await page.click('button[type="submit"]')

    // Sign out
    await page.click('text=Sign Out')

    // Now sign in
    await page.fill('input[name="email"]', 'signin-test@example.com')
    await page.fill('input[name="password"]', 'SecurePass123!')
    await page.click('button[type="submit"]')

    // Should be on dashboard
    await expect(page).toHaveURL(/\/dashboard/)
    await expect(page.locator('text=Dashboard')).toBeVisible()
  })

  test('should show error on invalid credentials', async ({ page }) => {
    await page.goto('/signin')

    await page.fill('input[name="email"]', 'nonexistent@example.com')
    await page.fill('input[name="password"]', 'WrongPassword123!')
    await page.click('button[type="submit"]')

    // Should show error message
    await expect(page.locator('text=Invalid').or(page.locator('text=failed'))).toBeVisible()
  })
})
