import { describe, it, expect, beforeAll } from 'vitest'
import { config } from 'dotenv'
import { resolve } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

beforeAll(() => {
  const envPath = resolve(__dirname, '../../.env')
  config({ path: envPath })
})

describe('Environment Variables', () => {
  it('should have STRIPE_SECRET_KEY defined', () => {
    expect(process.env.STRIPE_SECRET_KEY).toBeDefined()
  })

  it('should have STRIPE_WEBHOOK_SECRET defined', () => {
    expect(process.env.STRIPE_WEBHOOK_SECRET).toBeDefined()
  })

  it('should have STRIPE_STARTER_PRICE_ID defined', () => {
    expect(process.env.STRIPE_STARTER_PRICE_ID).toBeDefined()
  })

  it('should have STRIPE_PRO_PRICE_ID defined', () => {
    expect(process.env.STRIPE_PRO_PRICE_ID).toBeDefined()
  })
})
