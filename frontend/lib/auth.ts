import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { admin } from 'better-auth/plugins'
import { createAuthMiddleware } from 'better-auth/api'
import { stripe } from '@better-auth/stripe'
import Stripe from 'stripe'
import { and, eq, inArray } from 'drizzle-orm'
import {
  ac,
  admin as adminRole,
  moderator,
  user as userRole,
} from './permissions'
import { db } from '@/db/drizzel'
import * as schema from '@/db/schema'

const isValidStripeKey = (key: string | undefined): key is string => {
  if (!key) return false
  return (
    (key.startsWith('sk_test_') || key.startsWith('sk_live_')) &&
    key.length > 20
  )
}

export const stripeEnabled = isValidStripeKey(process.env.STRIPE_SECRET_KEY)

if (!stripeEnabled) {
  console.log('[Auth] Stripe disabled - invalid or missing STRIPE_SECRET_KEY')
}

const stripeClient = stripeEnabled
  ? new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2025-01-27.acacia',
    })
  : null

const getAdminUserList = (): Array<string> => {
  const adminList = process.env.ADMIN_USER_LIST
  if (!adminList) return []
  return adminList
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter((email) => email.length > 0)
}

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema,
  }),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    },
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  plugins: [
    ...(stripeEnabled && stripeClient
      ? [
          stripe({
            stripeClient,
            stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
            createCustomerOnSignUp: false,
            subscription: {
              enabled: true,
              plans: [
                {
                  name: 'starter',
                  priceId: process.env.STRIPE_STARTER_PRICE_ID!,
                  freeTrial: { days: 14 },
                },
                {
                  name: 'pro',
                  priceId: process.env.STRIPE_PRO_PRICE_ID!,
                },
              ],
            },
          }),
        ]
      : []),
    admin({
      ac,
      roles: {
        admin: adminRole,
        moderator,
        user: userRole,
      },
      defaultRole: 'user',
    }),
  ],
  hooks: {
    after: createAuthMiddleware(async (ctx) => {
      if (ctx.path === '/sign-up/email' || ctx.path.startsWith('/callback/')) {
        const adminEmails = getAdminUserList()
        if (adminEmails.length === 0) return

        await db
          .update(schema.user)
          .set({ role: 'admin' })
          .where(
            and(
              inArray(schema.user.email, adminEmails),
              eq(schema.user.role, 'user'),
            ),
          )
      }
    }),
  },
})
