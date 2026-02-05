import { createServerFn } from '@tanstack/react-start'
import { setCookie, getCookie, deleteCookie } from '@tanstack/react-start/server'
import { createPendingSignup, getPendingSignup, getPendingSignupByEmail, updatePendingSignupPlan, completePendingSignup } from './pending-signup'
import Stripe from 'stripe'
import { db } from '@/db/drizzel'
import { subscription, user } from '@/db/schema'
import { eq } from 'drizzle-orm'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-01-27.acacia',
})

const PENDING_SIGNUP_COOKIE = 'pending_signup_id'

export const createPendingSignupAction = createServerFn({ method: 'POST' })
  .inputValidator((data: { name: string; email: string; password: string }) => data)
  .handler(async ({ data }) => {
    const { id, email } = await createPendingSignup(data)
    
    setCookie(PENDING_SIGNUP_COOKIE, id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24,
      path: '/',
    })

    return { success: true, pendingId: id, email }
  })

export const getPendingSignupIdAction = createServerFn({ method: 'GET' })
  .handler(async () => {
    const pendingId = getCookie(PENDING_SIGNUP_COOKIE)
    if (!pendingId) return null

    const pending = await getPendingSignup(pendingId)
    if (!pending) {
      deleteCookie(PENDING_SIGNUP_COOKIE)
      return null
    }

    return { id: pending.id, email: pending.email, name: pending.name }
  })

export const linkOAuthPendingSignupAction = createServerFn({ method: 'POST' })
  .inputValidator((data: { email: string }) => data)
  .handler(async ({ data }) => {
    const pending = await getPendingSignupByEmail(data.email)
    if (!pending) {
      return { success: false, reason: 'not_found' }
    }

    setCookie(PENDING_SIGNUP_COOKIE, pending.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24,
      path: '/',
    })

    return { success: true, pendingId: pending.id }
  })

export const createCheckoutSessionAction = createServerFn({ method: 'POST' })
  .inputValidator((data: { plan: 'starter' | 'pro' }) => data)
  .handler(async ({ data }) => {
    const pendingId = getCookie(PENDING_SIGNUP_COOKIE)
    if (!pendingId) {
      throw new Error('No pending signup found. Please start the signup process again.')
    }

    const pending = await getPendingSignup(pendingId)
    if (!pending) {
      deleteCookie(PENDING_SIGNUP_COOKIE)
      throw new Error('Signup session expired. Please start the signup process again.')
    }

    const priceId = data.plan === 'starter' 
      ? process.env.STRIPE_STARTER_PRICE_ID!
      : process.env.STRIPE_PRO_PRICE_ID!

    const trialDays = data.plan === 'starter' ? 14 : undefined

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer_email: pending.email,
      line_items: [{ price: priceId, quantity: 1 }],
      subscription_data: trialDays ? { trial_period_days: trialDays } : undefined,
      success_url: `${process.env.BETTER_AUTH_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.BETTER_AUTH_URL}/pricing?canceled=true`,
      metadata: {
        pending_signup_id: pendingId,
        plan: data.plan,
      },
    })

    await updatePendingSignupPlan(pendingId, data.plan, session.id)

    return { url: session.url }
  })

export const createCheckoutForUserAction = createServerFn({ method: 'POST' })
  .inputValidator((data: { plan: 'starter' | 'pro'; userId: string; email: string }) => data)
  .handler(async ({ data }) => {
    const existingUser = await db
      .select()
      .from(user)
      .where(eq(user.id, data.userId))
      .limit(1)

    if (existingUser.length === 0) {
      throw new Error('User not found. Please sign in again.')
    }

    const existingSub = await db
      .select()
      .from(subscription)
      .where(eq(subscription.referenceId, data.userId))
      .limit(1)

    if (existingSub.length > 0 && existingSub[0].status === 'active') {
      throw new Error('You already have an active subscription.')
    }

    const priceId = data.plan === 'starter' 
      ? process.env.STRIPE_STARTER_PRICE_ID!
      : process.env.STRIPE_PRO_PRICE_ID!

    const trialDays = data.plan === 'starter' ? 14 : undefined

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer_email: data.email,
      line_items: [{ price: priceId, quantity: 1 }],
      subscription_data: trialDays ? { trial_period_days: trialDays } : undefined,
      success_url: `${process.env.BETTER_AUTH_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}&user_id=${data.userId}`,
      cancel_url: `${process.env.BETTER_AUTH_URL}/pricing?canceled=true`,
      metadata: {
        user_id: data.userId,
        plan: data.plan,
      },
    })

    return { url: checkoutSession.url }
  })

export const completeCheckoutAction = createServerFn({ method: 'POST' })
  .inputValidator((data: { sessionId: string }) => data)
  .handler(async ({ data }) => {
    const session = await stripe.checkout.sessions.retrieve(data.sessionId, {
      expand: ['subscription'],
    })

    if (session.payment_status !== 'paid' && session.status !== 'complete') {
      throw new Error('Payment not completed')
    }

    const pendingId = session.metadata?.pending_signup_id
    const oauthUserId = session.metadata?.user_id

    let userId: string

    if (oauthUserId) {
      const existingUser = await db
        .select()
        .from(user)
        .where(eq(user.id, oauthUserId))
        .limit(1)

      if (existingUser.length === 0) {
        throw new Error('User not found')
      }

      const existingSub = await db
        .select()
        .from(subscription)
        .where(eq(subscription.referenceId, oauthUserId))
        .limit(1)

      if (existingSub.length > 0) {
        return { success: true, alreadyCompleted: true, userId: oauthUserId }
      }

      userId = oauthUserId
    } else if (pendingId) {
      const pending = await getPendingSignup(pendingId)
      if (!pending) {
        const existingUser = await db
          .select()
          .from(user)
          .where(eq(user.email, session.customer_email!))
          .limit(1)

        if (existingUser.length > 0) {
          return { success: true, alreadyCompleted: true }
        }
        throw new Error('Signup session expired')
      }

      userId = await completePendingSignup(pendingId)
      deleteCookie(PENDING_SIGNUP_COOKIE)
    } else {
      throw new Error('Invalid checkout session')
    }

    const stripeSubscription = session.subscription as Stripe.Subscription
    const subscriptionId = `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    await db.insert(subscription).values({
      id: subscriptionId,
      plan: session.metadata?.plan || 'starter',
      referenceId: userId,
      stripeCustomerId: session.customer as string,
      stripeSubscriptionId: stripeSubscription.id,
      status: stripeSubscription.status,
      periodStart: new Date(stripeSubscription.current_period_start * 1000),
      periodEnd: new Date(stripeSubscription.current_period_end * 1000),
      trialStart: stripeSubscription.trial_start ? new Date(stripeSubscription.trial_start * 1000) : null,
      trialEnd: stripeSubscription.trial_end ? new Date(stripeSubscription.trial_end * 1000) : null,
    })

    await db
      .update(user)
      .set({ stripeCustomerId: session.customer as string })
      .where(eq(user.id, userId))

    return { success: true, userId }
  })
