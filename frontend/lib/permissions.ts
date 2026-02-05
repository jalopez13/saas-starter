import { createAccessControl } from 'better-auth/plugins/access'

// Define permission statements for admin operations
const statement = {
  user: ['create', 'list', 'set-role', 'ban', 'impersonate', 'delete'],
  session: ['list', 'revoke', 'delete'],
} as const

// Create access control instance
export const ac = createAccessControl(statement)

// Define roles with their permissions
// Admin: Full access to all admin operations
export const admin = ac.newRole({
  user: ['create', 'list', 'set-role', 'ban', 'impersonate', 'delete'],
  session: ['list', 'revoke', 'delete'],
})

// Moderator: Limited access - can list users/sessions and ban users
export const moderator = ac.newRole({
  user: ['list', 'ban'], // Can only list users and ban/unban
  session: ['list'], // Can only list sessions
})

// User: No admin permissions
export const user = ac.newRole({
  user: [], // No admin permissions
  session: [], // No admin permissions
})
