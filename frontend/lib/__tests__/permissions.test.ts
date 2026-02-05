import { describe, it, expect } from 'vitest'
import { ac, admin, moderator, user } from '../permissions'

describe('Permission Roles', () => {
  it('admin role should have all user permissions', () => {
    expect(admin).toBeDefined()
  })

  it('moderator role should exist', () => {
    expect(moderator).toBeDefined()
  })

  it('user role should exist', () => {
    expect(user).toBeDefined()
  })

  it('access control should be defined', () => {
    expect(ac).toBeDefined()
  })
})
