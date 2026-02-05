import { eq } from 'drizzle-orm'
import { db } from '@/db/drizzel'
import { pendingSignup, user, account } from '@/db/schema'
import { hashPassword, generateRandomString } from 'better-auth/crypto'

const PENDING_SIGNUP_EXPIRY_HOURS = 24

export async function createPendingSignup(data: {
  name: string
  email: string
  password: string
}) {
  const existingUser = await db
    .select({ id: user.id })
    .from(user)
    .where(eq(user.email, data.email))
    .limit(1)

  if (existingUser.length > 0) {
    throw new Error('User with this email already exists')
  }

  await db.delete(pendingSignup).where(eq(pendingSignup.email, data.email))

  const id = generateRandomString(32, 'a-z', 'A-Z', '0-9')
  const passwordHash = await hashPassword(data.password)
  const expiresAt = new Date(Date.now() + PENDING_SIGNUP_EXPIRY_HOURS * 60 * 60 * 1000)

  await db.insert(pendingSignup).values({
    id,
    name: data.name,
    email: data.email,
    passwordHash,
    expiresAt,
  })

  return { id, email: data.email }
}

export async function createOAuthPendingSignup(data: {
  name: string
  email: string
  oauthProvider: string
  oauthAccountId: string
  oauthAccessToken?: string | null
  oauthRefreshToken?: string | null
  oauthIdToken?: string | null
  oauthScope?: string | null
}) {
  const existingUser = await db
    .select({ id: user.id })
    .from(user)
    .where(eq(user.email, data.email))
    .limit(1)

  if (existingUser.length > 0) {
    throw new Error('User with this email already exists')
  }

  await db.delete(pendingSignup).where(eq(pendingSignup.email, data.email))

  const id = generateRandomString(32, 'a-z', 'A-Z', '0-9')
  const expiresAt = new Date(Date.now() + PENDING_SIGNUP_EXPIRY_HOURS * 60 * 60 * 1000)

  await db.insert(pendingSignup).values({
    id,
    name: data.name,
    email: data.email,
    oauthProvider: data.oauthProvider,
    oauthAccountId: data.oauthAccountId,
    oauthAccessToken: data.oauthAccessToken,
    oauthRefreshToken: data.oauthRefreshToken,
    oauthIdToken: data.oauthIdToken,
    oauthScope: data.oauthScope,
    expiresAt,
  })

  return { id, email: data.email }
}

export async function getPendingSignup(id: string) {
  const result = await db
    .select()
    .from(pendingSignup)
    .where(eq(pendingSignup.id, id))
    .limit(1)

  if (result.length === 0) return null

  const pending = result[0]
  if (new Date() > pending.expiresAt) {
    await db.delete(pendingSignup).where(eq(pendingSignup.id, id))
    return null
  }

  return pending
}

export async function getPendingSignupByEmail(email: string) {
  const result = await db
    .select()
    .from(pendingSignup)
    .where(eq(pendingSignup.email, email))
    .limit(1)

  if (result.length === 0) return null

  const pending = result[0]
  if (new Date() > pending.expiresAt) {
    await db.delete(pendingSignup).where(eq(pendingSignup.email, email))
    return null
  }

  return pending
}

export async function updatePendingSignupPlan(id: string, plan: string, stripeSessionId: string) {
  await db
    .update(pendingSignup)
    .set({ plan, stripeSessionId })
    .where(eq(pendingSignup.id, id))
}

export async function completePendingSignup(pendingId: string): Promise<string> {
  const pending = await getPendingSignup(pendingId)
  if (!pending) {
    throw new Error('Pending signup not found or expired')
  }

  const userId = generateRandomString(32, 'a-z', 'A-Z', '0-9')
  const accountId = generateRandomString(32, 'a-z', 'A-Z', '0-9')
  const now = new Date()

  await db.insert(user).values({
    id: userId,
    name: pending.name,
    email: pending.email,
    emailVerified: !!pending.oauthProvider,
    createdAt: now,
    updatedAt: now,
  })

  if (!pending.oauthProvider) {
    await db.insert(account).values({
      id: accountId,
      accountId: userId,
      providerId: 'credential',
      userId: userId,
      password: pending.passwordHash,
      createdAt: now,
      updatedAt: now,
    })
  }

  await db.delete(pendingSignup).where(eq(pendingSignup.id, pendingId))

  return userId
}

export async function deletePendingSignup(id: string) {
  await db.delete(pendingSignup).where(eq(pendingSignup.id, id))
}

export async function cleanupExpiredPendingSignups() {
  await db.delete(pendingSignup).where(eq(pendingSignup.expiresAt, new Date()))
}
