import { redirect } from '@tanstack/react-router'
import { createMiddleware } from '@tanstack/react-start'
import { auth } from '@/lib/auth'
import { db } from '@/db/drizzel'
import { subscription } from '@/db/schema'
import { eq, and, or } from 'drizzle-orm'

export const authMiddleware = createMiddleware().server(
  async ({ next, request }) => {
    const session = await auth.api.getSession({
      headers: request.headers,
    })

    if (!session) {
      throw redirect({ to: '/login' })
    }

    return next({
      context: {
        session,
        user: session.user,
      },
    })
  },
)

/**
 * Middleware that requires both authentication AND an active subscription.
 * Redirects to /pricing if user has no active subscription.
 */
export const subscriptionMiddleware = createMiddleware().server(
  async ({ next, request }) => {
    const session = await auth.api.getSession({
      headers: request.headers,
    })

    if (!session) {
      throw redirect({ to: '/login' })
    }

    const activeSubscription = await db
      .select()
      .from(subscription)
      .where(
        and(
          eq(subscription.referenceId, session.user.id),
          or(
            eq(subscription.status, 'active'),
            eq(subscription.status, 'trialing')
          )
        )
      )
      .limit(1)

    if (activeSubscription.length === 0) {
      throw redirect({ to: '/pricing' })
    }

    return next({
      context: {
        session,
        user: session.user,
        subscription: activeSubscription[0],
      },
    })
  },
)
