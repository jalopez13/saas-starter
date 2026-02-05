import { createAuthClient } from 'better-auth/react'
import { adminClient } from 'better-auth/client/plugins'
import { stripeClient } from '@better-auth/stripe/client'

export const authClient = createAuthClient({
  plugins: [stripeClient(), adminClient()],
})
