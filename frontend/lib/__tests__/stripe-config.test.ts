import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { join } from 'path'

describe('Stripe Configuration', () => {
  it('should have stripe plugin configured in auth.ts', () => {
    const authContent = readFileSync(
      join(__dirname, '../auth.ts'),
      'utf-8'
    )

    expect(authContent).toContain("import { stripe } from '@better-auth/stripe'")
    expect(authContent).toContain("import Stripe from 'stripe'")
    expect(authContent).toContain('stripe({')
    expect(authContent).toContain('stripeClient,')
    expect(authContent).toContain('stripeWebhookSecret:')
    expect(authContent).toContain('createCustomerOnSignUp: true')
    expect(authContent).toContain("name: 'starter'")
    expect(authContent).toContain('STRIPE_STARTER_PRICE_ID')
    expect(authContent).toContain('freeTrial:')
    expect(authContent).toContain('days: 14')
    expect(authContent).toContain("name: 'pro'")
    expect(authContent).toContain('STRIPE_PRO_PRICE_ID')
  })

  it('should have stripeClient in auth-client.ts', () => {
    const clientContent = readFileSync(
      join(__dirname, '../auth-client.ts'),
      'utf-8'
    )

    expect(clientContent).toContain("import { stripeClient } from '@better-auth/stripe/client'")
    expect(clientContent).toContain('stripeClient()')
  })

  it('should have starter plan with 14-day free trial', () => {
    const authContent = readFileSync(
      join(__dirname, '../auth.ts'),
      'utf-8'
    )

    const starterPlanMatch = authContent.match(/name:\s*['"]starter['"][\s\S]*?freeTrial:[\s\S]*?days:\s*14/)
    expect(starterPlanMatch).not.toBeNull()
  })

  it('should have pro plan without free trial', () => {
    const authContent = readFileSync(
      join(__dirname, '../auth.ts'),
      'utf-8'
    )

    const proPlanMatch = authContent.match(/name:\s*['"]pro['"][\s\S]*?},/)
    expect(proPlanMatch).not.toBeNull()
    expect(proPlanMatch![0]).not.toContain('freeTrial')
  })
})
