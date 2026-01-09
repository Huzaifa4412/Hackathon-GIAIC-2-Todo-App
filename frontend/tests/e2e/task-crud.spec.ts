/**
 * E2E test for task CRUD operations.
 *
 * Tests: Create, Read, Update, Delete tasks
 */
import { test, expect } from '@playwright/test'

test.describe('Task CRUD Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Sign in before each test
    await page.goto('/signin')
    await page.fill('input[name="email"]', 'task-crud@example.com')
    await page.fill('input[name="password"]', 'SecurePass123!')
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL(/\/dashboard/)
  })

  test('should create a new task', async ({ page }) => {
    // Click New Task button
    await page.click('text=New Task')
    await expect(page).toHaveURL(/\/create/)

    // Fill task form
    await page.fill('input[name="title"]', 'CRUD Test Task')
    await page.fill('textarea[name="description"]', 'Testing task creation')
    await page.selectOption('select[name="status"]', 'pending')

    // Submit form
    await page.click('button[type="submit"]')

    // Should redirect to dashboard
    await expect(page).toHaveURL(/\/dashboard/)

    // Verify task appears in list
    await expect(page.locator('text=CRUD Test Task')).toBeVisible()
  })

  test('should read task details', async ({ page }) => {
    // Create a task first
    await page.click('text=New Task')
    await page.fill('input[name="title"]', 'Read Test Task')
    await page.click('button[type="submit"]')

    // Click on the task to view details
    await page.click('text=Read Test Task')
    await expect(page).toHaveURL(/\/tasks\//)

    // Verify task details are shown
    await expect(page.locator('text=Read Test Task')).toBeVisible()
    await expect(page.locator('text=Testing task creation')).toBeVisible()

    // Verify status badge
    await expect(page.locator('text=Pending')).toBeVisible()
  })

  test('should update a task', async ({ page }) => {
    // Create a task
    await page.click('text=New Task')
    await page.fill('input[name="title"]', 'Update Test Task')
    await page.click('button[type="submit"]')

    // Go to task detail
    await page.click('text=Update Test Task')

    // Click Edit button
    await page.click('text=Edit Task')
    await expect(page).toHaveURL(/\/edit/)

    // Update task
    await page.fill('input[name="title"]', 'Updated Test Task')
    await page.fill('textarea[name="description"]', 'Updated description')
    await page.selectOption('select[name="status"]', 'in_progress')

    // Save changes
    await page.click('button[type="submit"]')

    // Should redirect to task detail
    await expect(page).toHaveURL(/\/tasks\//)

    // Verify updates
    await expect(page.locator('text=Updated Test Task')).toBeVisible()
    await expect(page.locator('text=Updated description')).toBeVisible()
    await expect(page.locator('text=In Progress')).toBeVisible()
  })

  test('should delete a task', async ({ page }) => {
    // Create a task
    await page.click('text=New Task')
    await page.fill('input[name="title"]', 'Delete Test Task')
    await page.click('button[type="submit"]')

    // Go to task detail
    await page.click('text=Delete Test Task')

    // Click Delete button
    page.on('dialog', dialog => dialog.accept())
    await page.click('text=Delete Task')

    // Should redirect to dashboard
    await expect(page).toHaveURL(/\/dashboard/)

    // Verify task is removed
    await expect(page.locator('text=Delete Test Task')).not.toBeVisible()
  })

  test('should filter tasks by status', async ({ page }) => {
    // Create tasks with different statuses
    // Task 1: Pending
    await page.click('text=New Task')
    await page.fill('input[name="title"]', 'Pending Task')
    await page.selectOption('select[name="status"]', 'pending')
    await page.click('button[type="submit"]')

    // Task 2: Completed
    await page.click('text=New Task')
    await page.fill('input[name="title"]', 'Completed Task')
    await page.selectOption('select[name="status"]', 'completed')
    await page.click('button[type="submit"]')

    // Filter by pending
    await page.click('text=Pending')
    await expect(page.locator('text=Pending Task')).toBeVisible()
    await expect(page.locator('text=Completed Task')).not.toBeVisible()

    // Filter by completed
    await page.click('text=Completed')
    await expect(page.locator('text=Completed Task')).toBeVisible()
    await expect(page.locator('text=Pending Task')).not.toBeVisible()

    // Show all
    await page.click('text=All')
    await expect(page.locator('text=Pending Task')).toBeVisible()
    await expect(page.locator('text=Completed Task')).toBeVisible()
  })

  test('should update task status from dashboard', async ({ page }) => {
    // Create a task
    await page.click('text=New Task')
    await page.fill('input[name="title"]', 'Status Test Task')
    await page.click('button[type="submit"]')

    // Find the status dropdown and change it
    await page.selectOption('select', 'completed')

    // Verify status badge changed
    await expect(page.locator('text=Completed')).toBeVisible()
  })
})
