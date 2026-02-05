import { createFileRoute, useSearch } from '@tanstack/react-router'
import { useEffect, useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { authClient } from '@/lib/auth-client'
import { authMiddleware } from '@/lib/middleware'
import { AppLayout } from '@/src/components/AppLayout'
import { Check, Sparkles, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { z } from 'zod'

const billingSearchSchema = z.object({
  success: z.boolean().optional(),
  canceled: z.boolean().optional(),
})

export const Route = createFileRoute('/billing')({
  component: BillingPage,
  validateSearch: billingSearchSchema,
  server: {
    middleware: [authMiddleware],
  },
})

type Subscription = {
  id: string
  stripeSubscriptionId?: string
  plan: string
  status: string
  periodEnd?: string
  trialEnd?: string
}

const plans = [
  {
    name: 'Starter',
    description: 'For solo founders',
    price: 29,
    trial: '14-day free trial',
    features: [
      '20 searches/day',
      '5 platforms',
      'Save up to 10 ideas',
      'AI pain point analysis',
      'Email support',
    ],
  },
  {
    name: 'Pro',
    description: 'For serious builders',
    price: 69,
    popular: true,
    features: [
      '40 searches/day',
      'All 9 platforms',
      'Unlimited ideas',
      'AI pain point analysis',
      'Landing page builder',
      'Export to CSV',
      'Priority support',
    ],
  },
]

function BillingPage() {
  const search = useSearch({ from: '/billing' })
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)
  const [changingPlan, setChangingPlan] = useState(false)

  const fetchSubscription = useCallback(async () => {
    setLoading(true)
    try {
      const result = await authClient.subscription.list()
      if (result.data && result.data.length > 0) {
        setSubscription(result.data[0])
      }
    } catch {
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSubscription()
  }, [fetchSubscription])

  useEffect(() => {
    if (search.success) {
      toast.success('Plan updated successfully!')
      fetchSubscription()
      window.history.replaceState({}, '', '/billing')
    } else if (search.canceled) {
      toast.info('Plan change canceled')
      window.history.replaceState({}, '', '/billing')
    }
  }, [search.success, search.canceled, fetchSubscription])

  const handlePlanChange = async (planName: string) => {
    const stripeSubId = subscription?.stripeSubscriptionId || subscription?.id
    if (!stripeSubId) {
      toast.error('No active subscription found')
      return
    }

    setChangingPlan(true)

    try {
      const { error } = await authClient.subscription.upgrade({
        plan: planName.toLowerCase(),
        subscriptionId: stripeSubId,
        successUrl: `${window.location.origin}/billing?success=true`,
        cancelUrl: `${window.location.origin}/billing?canceled=true`,
        returnUrl: `${window.location.origin}/billing?success=true`,
      })
      
      if (error) {
        toast.error(error.message || 'Failed to change plan')
        setChangingPlan(false)
      }
    } catch {
      toast.error('Failed to start plan change')
      setChangingPlan(false)
    }
  }

  const currentPlan = subscription?.plan?.toLowerCase() || 'free'

  return (
    <AppLayout
      title="Billing"
      description="Manage your subscription and billing"
    >
      <div className="space-y-8">
        <div>
          <h2 className="text-lg font-semibold">Upgrade Your Plan</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Choose the plan that best fits your needs
          </p>
        </div>

        <div className="mx-auto grid max-w-4xl gap-6 lg:grid-cols-2">
          {plans.map((plan) => {
            const isCurrentPlan = plan.name.toLowerCase() === currentPlan
            const isPro = plan.name === 'Pro'

            return (
              <div
                key={plan.name}
                className={cn(
                  'relative rounded border border-border bg-card p-6',
                  isPro && 'border-primary'
                )}
              >
                {plan.popular && (
                  <Badge className="absolute -top-3 right-4 gap-1">
                    <Sparkles className="h-3 w-3" />
                    Most Popular
                  </Badge>
                )}

                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{plan.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {plan.description}
                    </p>
                  </div>
                  {isCurrentPlan && (
                    <Badge variant="outline">Current Plan</Badge>
                  )}
                </div>

                <div className="mb-2">
                  <span className="text-4xl font-bold">${plan.price}</span>
                  <span className="text-muted-foreground">/month</span>
                </div>

                {plan.trial && (
                  <p className="mb-4 text-sm text-primary">{plan.trial}</p>
                )}
                {!plan.trial && <div className="mb-4" />}

                <ul className="mb-6 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>

                {isCurrentPlan ? (
                  <Button className="w-full" variant="outline" disabled>
                    Current Plan
                  </Button>
                ) : (
                  <Button
                    className="w-full"
                    variant={isPro ? 'default' : 'outline'}
                    onClick={() => handlePlanChange(plan.name)}
                    disabled={changingPlan || loading}
                  >
                    {changingPlan ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Sparkles className="mr-2 h-4 w-4" />
                    )}
                    {isPro ? 'Upgrade to Pro' : 'Switch to Starter'}
                  </Button>
                )}
              </div>
            )
          })}
        </div>

        <p className="text-center text-sm text-muted-foreground">
          Payments are securely processed by Stripe. Cancel anytime.
        </p>
      </div>
    </AppLayout>
  )
}
