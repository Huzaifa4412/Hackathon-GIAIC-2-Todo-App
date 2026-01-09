/**
 * E2E test for user data isolation.
 *
 * Tests that users can only see their own tasks.
 */
import { test, expect } from '@playwright/test'

test.describe('User Data Isolation', () => {
  test('should isolate data between users', async ({ browser }) => {
    // Create contexts for two different users
    const context1 = await browser.newContext()
    const context2 = await browser.newContext()

    const page1 = await context1.newPage()
    const page2 = await context2.newPage()

    try {
      // User 1: Sign up and create tasks
      await page1.goto('/signup')
      await page1.fill('input[name="email"]', 'user1@example.com')
      await page1.fill('input[name="password"]', 'SecurePass123!')
      await page1.fill('input[name="confirm-password"]', 'SecurePass123!')
      await page1.click('button[type="submit"]')

      await page1.click('text=New Task')
      await page1.fill('input[name="title"]', 'User 1 Task')
      await page1.click('button[type="submit"]')

      // User 1 should see their task
      await expect(page1.locator('text=User 1 Task')).toBeVisible()

      // User 2: Sign up
      await page2.goto('/signup')
      await page2.fill('input[name="email"]', 'user2@example.com')
      await page2.fill('input[name="password"]', 'SecurePass123!')
      await page2.fill('input[name="confirm-password"]', 'SecurePass123!')
      await page2.click('button[type="submit"]')

      // User 2 should NOT see User 1's task
      await expect(page2.locator('text=User 1 Task')).not.toBeVisible()

      // User 2 creates their own task
      await page2.click('text=New Task')
      await page2.fill('input[name="title"]', 'User 2 Task')
      await page2.click('button[type="submit"]')

      // User 2 should see only their task
      await expect(page2.locator('text=User 2 Task')).toBeVisible()
      await expect(page2.locator('text=User 1 Task')).not.toBeVisible()

      // User 1 still sees only their task
      await page1.reload()
      await expect(page1.locator('text=User 1 Task')).toBeVisible()
      await expect(page1.locator('text=User 2 Task')).not.toBeVisible()

    } finally {
      await context1.close()
      await context2.close()
    }
  })

  test('should not allow accessing other users tasks directly', async ({ browser }) => {
    // Create contexts for two users
    const context1 = await browser.newContext()
    const context2 = await browser.newContext()

    const page1 = await context1.newPage()
    const page2 = await context2.newPage()

    try {
      // User 1: Create task
      await page1.goto('/signup')
      await page1.fill('input[name="email"]', 'user1-direct@example.com')
      await page1.fill('input[name="password"]', 'SecurePass123!')
      await page1.fill('input[name="confirm-password"]', 'SecurePass123!')
      await page1.click('button[type="submit"]')

      await page1.click('text=New Task')
      await page1.fill('input[name="title"]', 'Direct Access Test')
      await page1.click('button[type="submit"]')

      // Get task ID from URL
      await page1.click('text=Direct Access Test')
      const taskUrl = page1.url()
      const taskId = taskUrl.split('/').pop()

      // User 2: Try to access User 1's task directly
      await page2.goto('/signin')
      await page2.fill('input[name="email"]', 'user2-direct@example.com')
      await page2.fill('input[name="password"]', 'SecurePass123!')
      await page2.click('button[type="submit"]')

      // Navigate directly to User 1's task
      await page2.goto(`/tasks/${taskId}`)

      // Should show error or redirect
      await expect(page2.locator('text=not found').or(page2.locator('text=denied'))).toBeVisible()

    } finally {
      await context1.close()
      await context2.close()
    }
  })
})
