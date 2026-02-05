import { Link, useLocation } from '@tanstack/react-router'
import {
  BarChart3,
  CreditCard,
  LayoutDashboard,
  Lightbulb,
  LogOut,
  MessageCircle,
  MessageSquareWarning,
  Search,
  Settings,
  TrendingUp,
  Users,
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { authClient } from '@/lib/auth-client'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/ideas', label: 'My Ideas', icon: Lightbulb },
  { href: '/discover', label: 'Discover', icon: Search },
  { href: '/pain-points', label: 'Pain Points', icon: MessageSquareWarning },
  { href: '/competitors', label: 'Competitors', icon: Users },
  { href: '/serp-analysis', label: 'SERP Analysis', icon: BarChart3 },
  { href: '/trends', label: 'Trends', icon: TrendingUp },
  { href: '/billing', label: 'Billing', icon: CreditCard },
  { href: '/feedback', label: 'Feedback', icon: MessageCircle },
  { href: '/settings', label: 'Settings', icon: Settings },
]

export function Sidebar() {
  const location = useLocation()
  const { data: session } = authClient.useSession()

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-56 flex-col border-r border-border bg-sidebar">
      <div className="flex h-14 items-center border-b border-border px-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded bg-primary">
            <Lightbulb className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-lg font-semibold text-sidebar-foreground">
            Gripemine
          </span>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        <p className="mb-2 px-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Main
        </p>
        {navItems.map((item) => {
          const isActive = location.pathname === item.href
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'border-l-2 border-primary text-primary'
                  : 'border-l-2 border-transparent text-sidebar-foreground hover:text-foreground-hover',
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="p-3">
        <button
          onClick={() => {
            authClient.signOut().then(() => {
              toast.success('Logged out successfully', { duration: 1000 })
              setTimeout(() => (window.location.href = '/'), 1000)
            })
          }}
          className="flex w-full items-center gap-3 px-3 py-2 text-sm font-medium text-sidebar-foreground transition-colors hover:text-foreground-hover"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>

      <div className="border-t border-border p-3">
        <div className="flex items-center gap-3 rounded px-3 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
            {session?.user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="flex-1 truncate">
            <p className="truncate text-sm font-medium text-sidebar-foreground">
              {session?.user?.name || 'User'}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {session?.user?.email || 'Free plan'}
            </p>
          </div>
        </div>
      </div>
    </aside>
  )
}
