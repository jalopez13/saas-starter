import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check, Lightbulb, Sparkles } from 'lucide-react'
import { Icons } from '@/src/components/Icons'
import { getPendingSignupIdAction, createCheckoutSessionAction, createCheckoutForUserAction } from '@/lib/signup-actions'
import { authClient } from '@/lib/auth-client'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

export const Route = createFileRoute('/pricing')({
  component: PricingPage,
})

const plans = [
  {
    name: 'Starter',
    stripeId: 'starter' as const,
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
    stripeId: 'pro' as const,
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

type SignupUser = { 
  type: 'pending' | 'oauth'
  id: string
  email: string
  name: string 
} | null

function PricingPage() {
  const navigate = useNavigate()
  const [signupUser, setSignupUser] = useState<SignupUser>(null)
  const [loading, setLoading] = useState(true)
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null)

  useEffect(() => {
    const checkUser = async () => {
      try {
        const pending = await getPendingSignupIdAction()
        if (pending) {
          setSignupUser({ type: 'pending', ...pending })
          setLoading(false)
          return
        }

        const { data: session } = await authClient.getSession()
        if (session?.user) {
          setSignupUser({ 
            type: 'oauth', 
            id: session.user.id, 
            email: session.user.email, 
            name: session.user.name 
          })
        }
      } catch {
        setSignupUser(null)
      } finally {
        setLoading(false)
      }
    }
    checkUser()
  }, [])

  const handleCheckout = async (plan: 'starter' | 'pro') => {
    if (!signupUser) {
      navigate({ to: '/signup' })
      return
    }

    setCheckoutLoading(plan)
    try {
      const result = signupUser.type === 'pending'
        ? await createCheckoutSessionAction({ data: { plan } })
        : await createCheckoutForUserAction({ data: { plan, userId: signupUser.id, email: signupUser.email } })
      
      if (result.url) {
        window.location.href = result.url
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create checkout'
      toast.error(message)
      if (message.includes('expired') || message.includes('No pending signup')) {
        navigate({ to: '/signup' })
      }
    } finally {
      setCheckoutLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="fixed top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-primary">
              <Lightbulb className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold">Gripemine</span>
          </Link>
          <nav className="flex items-center gap-4">
            <Link to="/login">
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
            </Link>
            {!signupUser && (
              <Link to="/signup">
                <Button size="sm">Get Started</Button>
              </Link>
            )}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pt-32 pb-20">
        <div className="mb-16 text-center">
          <h1 className="text-4xl font-bold">
            {signupUser ? `Welcome, ${signupUser.name.split(' ')[0]}!` : 'Simple, transparent pricing'}
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
            {signupUser 
              ? 'Choose your plan to complete signup. Cancel anytime.'
              : 'Choose the plan that fits your needs. Cancel anytime.'}
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Icons.spinner className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-2">
            {plans.map((plan) => {
              const isPro = plan.name === 'Pro'
              const isLoading = checkoutLoading === plan.stripeId

              return (
                <div
                  key={plan.name}
                  className={cn(
                    'relative rounded border border-border bg-card p-8',
                    isPro && 'border-primary'
                  )}
                >
                  {plan.popular && (
                    <Badge className="absolute -top-3 right-4 gap-1">
                      <Sparkles className="h-3 w-3" />
                      Most Popular
                    </Badge>
                  )}

                  <div className="mb-6">
                    <h3 className="text-xl font-semibold">{plan.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {plan.description}
                    </p>
                  </div>

                  <div className="mb-2">
                    <span className="text-4xl font-bold">${plan.price}</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>

                  {plan.trial && (
                    <p className="mb-6 text-sm text-primary">{plan.trial}</p>
                  )}
                  {!plan.trial && <div className="mb-6" />}

                  <ul className="mb-8 space-y-3">
                    {plan.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-center gap-2 text-sm"
                      >
                        <Check className="h-4 w-4 text-primary" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  {signupUser ? (
                    <Button
                      className="w-full"
                      variant={isPro ? 'default' : 'outline'}
                      onClick={() => handleCheckout(plan.stripeId)}
                      disabled={isLoading || checkoutLoading !== null}
                    >
                      {isLoading ? (
                        <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                      ) : isPro ? (
                        <Sparkles className="mr-2 h-4 w-4" />
                      ) : null}
                      {plan.trial ? 'Start Free Trial' : `Start with ${plan.name}`}
                    </Button>
                  ) : (
                    <Link to="/signup" className="block">
                      <Button
                        className="w-full"
                        variant={isPro ? 'default' : 'outline'}
                      >
                        {isPro && <Sparkles className="mr-2 h-4 w-4" />}
                        Get Started
                      </Button>
                    </Link>
                  )}
                </div>
              )
            })}
          </div>
        )}

        <p className="mt-12 text-center text-sm text-muted-foreground">
          Payments are securely processed by Stripe. Cancel anytime.
        </p>
      </main>

      <footer className="border-t border-border py-8">
        <div className="mx-auto max-w-6xl px-4 text-center">
          <p className="text-sm text-muted-foreground">
            © 2026 Gripemine. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
