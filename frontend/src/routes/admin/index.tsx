import { createFileRoute, Outlet, Link, useLocation } from '@tanstack/react-router'
import { authMiddleware } from '@/lib/middleware'
import { Sidebar } from '@/src/components/Sidebar'
import { Users, Shield } from 'lucide-react'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/admin/')({
  component: AdminLayout,
  server: {
    middleware: [authMiddleware],
  },
})

function AdminLayout() {
  const location = useLocation()

  const adminNavItems = [
    { href: '/admin/users', label: 'User Management', icon: Users },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="ml-56 min-h-screen">
        <div className="p-8">
          <div className="mb-8">
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-semibold text-foreground">
                Admin Dashboard
              </h1>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage users, roles, and system settings
            </p>
          </div>

          <div className="mb-6 flex gap-2">
            {adminNavItems.map((item) => {
              const isActive = location.pathname === item.href
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    'flex items-center gap-2 rounded border px-4 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border hover:bg-muted'
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              )
            })}
          </div>

          <Outlet />
        </div>
      </main>
    </div>
  )
}
