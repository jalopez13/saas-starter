import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { authClient } from '@/lib/auth-client'
import { Search, UserX, UserCheck, UserCog } from 'lucide-react'
import { toast } from 'sonner'

export const Route = createFileRoute('/admin/users')({
  component: UsersPage,
})

type User = {
  id: string
  name: string
  email: string
  role: string
  banned: boolean
  banReason?: string
  createdAt: string
}

function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUserRole, setCurrentUserRole] = useState<string>('user')
  const [search, setSearch] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const session = await authClient.getSession()
        if (session.data?.user) {
          setCurrentUserRole(
            (session.data.user as { role?: string }).role || 'user'
          )
        }

        const result = await authClient.admin.listUsers()
        if (result.data) {
          setUsers(result.data.users as User[])
        }
      } catch (error) {
        console.error('Failed to fetch users:', error)
        toast.error('Failed to load users')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const handleBan = async (userId: string) => {
    const reason = prompt('Enter ban reason:')
    if (!reason) return
    try {
      await authClient.admin.banUser({ userId, banReason: reason })
      setUsers(
        users.map((u) =>
          u.id === userId ? { ...u, banned: true, banReason: reason } : u
        )
      )
      toast.success('User banned successfully')
    } catch (error) {
      toast.error('Failed to ban user')
    }
  }

  const handleUnban = async (userId: string) => {
    try {
      await authClient.admin.unbanUser({ userId })
      setUsers(
        users.map((u) =>
          u.id === userId ? { ...u, banned: false, banReason: undefined } : u
        )
      )
      toast.success('User unbanned successfully')
    } catch (error) {
      toast.error('Failed to unban user')
    }
  }

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await authClient.admin.setRole({ userId, role: newRole })
      setUsers(users.map((u) => (u.id === userId ? { ...u, role: newRole } : u)))
      toast.success('Role updated successfully')
    } catch (error) {
      toast.error('Failed to update role')
    }
  }

  const handleImpersonate = async (userId: string) => {
    try {
      await authClient.admin.impersonateUser({ userId })
      window.location.href = '/dashboard'
    } catch (error) {
      toast.error('Failed to impersonate user')
    }
  }

  const isAdmin = currentUserRole === 'admin'
  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <p className="text-muted-foreground">Loading users...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search users by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="rounded border border-border bg-card">
        <div className="grid grid-cols-[1fr,auto,auto,auto] gap-4 border-b border-border p-4 text-sm font-medium text-muted-foreground">
          <div>User</div>
          <div>Role</div>
          <div>Status</div>
          <div>Actions</div>
        </div>

        <div className="divide-y divide-border">
          {filteredUsers.map((user) => (
            <div
              key={user.id}
              className="grid grid-cols-[1fr,auto,auto,auto] items-center gap-4 p-4"
            >
              <div>
                <p className="font-medium">{user.name}</p>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>

              <div>
                {isAdmin ? (
                  <select
                    value={user.role}
                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                    className="rounded border border-border bg-background px-3 py-1.5 text-sm"
                  >
                    <option value="admin">Admin</option>
                    <option value="moderator">Moderator</option>
                    <option value="user">User</option>
                  </select>
                ) : (
                  <Badge variant="outline" className="capitalize">
                    {user.role}
                  </Badge>
                )}
              </div>

              <div>
                {user.banned ? (
                  <Badge variant="destructive">Banned</Badge>
                ) : (
                  <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20">
                    Active
                  </Badge>
                )}
              </div>

              <div className="flex gap-2">
                {user.banned ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleUnban(user.id)}
                  >
                    <UserCheck className="mr-1 h-3 w-3" />
                    Unban
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => handleBan(user.id)}
                  >
                    <UserX className="mr-1 h-3 w-3" />
                    Ban
                  </Button>
                )}
                {isAdmin && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleImpersonate(user.id)}
                  >
                    <UserCog className="mr-1 h-3 w-3" />
                    Impersonate
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredUsers.length === 0 && (
          <p className="p-8 text-center text-muted-foreground">No users found</p>
        )}
      </div>
    </div>
  )
}
