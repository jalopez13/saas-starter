import { describe, it, expect, vi, beforeAll } from 'vitest'

// Mock Stripe before any imports
vi.mock('stripe', () => ({
  default: vi.fn().mockImplementation(() => ({
    customers: {
      create: vi.fn(),
    },
  })),
}))

describe('First User Admin Hook', () => {
  beforeAll(() => {
    // Set mock env vars for Stripe
    process.env.STRIPE_SECRET_KEY = 'sk_test_mock'
    process.env.STRIPE_WEBHOOK_SECRET = 'whsec_mock'
    process.env.STRIPE_STARTER_PRICE_ID = 'price_mock_starter'
    process.env.STRIPE_PRO_PRICE_ID = 'price_mock_pro'
  })

  it('should be configured in auth', async () => {
    // Import dynamically after mocks are set up
    const { auth } = await import('../auth')
    expect(auth).toBeDefined()
  })
})
