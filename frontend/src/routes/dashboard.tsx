import { createFileRoute, Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { subscriptionMiddleware } from '@/lib/middleware'
import { authClient } from '@/lib/auth-client'
import { AppLayout } from '@/src/components/AppLayout'
import {
  Lightbulb,
  MessageSquareWarning,
  CheckCircle,
  Link2,
  Plus,
  ArrowRight,
} from 'lucide-react'

export const Route = createFileRoute('/dashboard')({
  component: DashboardPage,
  server: {
    middleware: [subscriptionMiddleware],
  },
})

function DashboardPage() {
  const { data: session } = authClient.useSession()
  const userName = session?.user?.name?.split(' ')[0] || 'User'

  return (
    <AppLayout
      title={`Welcome back!`}
      description="Here's what's happening with your idea discovery"
    >
      <div className="space-y-8">
        <StatsSection />
        <div className="grid gap-6 lg:grid-cols-2">
          <TopIdeaCard />
          <RecentPainPointsCard />
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <IdeasByStatusCard />
          <RecentIdeasCard />
        </div>
      </div>
    </AppLayout>
  )
}

function StatsSection() {
  const stats = [
    {
      label: 'Total Ideas',
      value: '0',
      subtext: '+0 this month',
      icon: Lightbulb,
    },
    {
      label: 'Pain Points',
      value: '0',
      subtext: '0 linked to ideas',
      icon: MessageSquareWarning,
    },
    {
      label: 'In Validation',
      value: '0',
      subtext: 'Ideas being validated',
      icon: CheckCircle,
    },
    {
      label: 'Linked',
      value: '0',
      subtext: 'Connected to ideas',
      icon: Link2,
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="rounded border border-border bg-card p-5"
        >
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{stat.label}</p>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="mt-2 text-3xl font-semibold">{stat.value}</p>
          <p className="mt-1 text-xs text-muted-foreground">{stat.subtext}</p>
        </div>
      ))}
    </div>
  )
}

function TopIdeaCard() {
  return (
    <div className="rounded border border-border bg-card p-6">
      <div className="flex items-center gap-2">
        <Lightbulb className="h-4 w-4 text-primary" />
        <h3 className="font-semibold">Your Top Idea</h3>
      </div>
      <div className="mt-6 flex flex-col items-center justify-center py-8 text-center">
        <p className="text-muted-foreground">
          No ideas yet. Create your first idea to see your validation score.
        </p>
        <Button className="mt-4" size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Create Idea
        </Button>
      </div>
    </div>
  )
}

function RecentPainPointsCard() {
  return (
    <div className="rounded border border-border bg-card p-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Recent Pain Points</h3>
        <Link
          to="/pain-points"
          className="inline-flex items-center text-sm text-primary hover:underline"
        >
          View all
          <ArrowRight className="ml-1 h-3 w-3" />
        </Link>
      </div>
      <div className="mt-6 flex flex-col items-center justify-center py-8 text-center">
        <p className="text-muted-foreground">
          No pain points discovered yet. Start searching to find opportunities.
        </p>
        <Link to="/discover">
          <Button className="mt-4" size="sm" variant="outline">
            Discover Pain Points
          </Button>
        </Link>
      </div>
    </div>
  )
}

const statusColors = {
  Discovered: 'bg-blue-500',
  Researching: 'bg-yellow-500',
  Validating: 'bg-purple-500',
  Building: 'bg-green-500',
  Archived: 'bg-gray-500',
}

function IdeasByStatusCard() {
  const statuses = [
    { name: 'Discovered', count: 0 },
    { name: 'Researching', count: 0 },
    { name: 'Validating', count: 0 },
    { name: 'Building', count: 0 },
    { name: 'Archived', count: 0 },
  ]

  return (
    <div className="rounded border border-border bg-card p-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Ideas by Status</h3>
        <Link
          to="/ideas"
          className="inline-flex items-center text-sm text-primary hover:underline"
        >
          View all
          <ArrowRight className="ml-1 h-3 w-3" />
        </Link>
      </div>
      <div className="mt-6 space-y-3">
        {statuses.map((status) => (
          <div key={status.name} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`h-2.5 w-2.5 rounded-full ${statusColors[status.name as keyof typeof statusColors]}`}
              />
              <span className="text-sm">{status.name}</span>
            </div>
            <span className="text-sm text-muted-foreground">{status.count}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function RecentIdeasCard() {
  return (
    <div className="rounded border border-border bg-card p-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Recent Ideas</h3>
        <Link
          to="/ideas"
          className="inline-flex items-center text-sm text-primary hover:underline"
        >
          View all
          <ArrowRight className="ml-1 h-3 w-3" />
        </Link>
      </div>
      <div className="mt-6 flex flex-col items-center justify-center py-8 text-center">
        <p className="text-muted-foreground">
          No ideas created yet. Start by saving pain points and generating ideas.
        </p>
      </div>
    </div>
  )
}
