/**
 * Vitest setup file.
 *
 * Configures testing environment and global mocks.
 */
import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

// Cleanup after each test
afterEach(() => {
  cleanup()
})

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}

vi.stubGlobal('localStorage', localStorageMock)

// Mock window.location
vi.stubGlobal('location', {
  href: 'http://localhost:3000',
  pathname: '/',
  search: '',
  hash: '',
})

// Mock fetch API
global.fetch = vi.fn()
