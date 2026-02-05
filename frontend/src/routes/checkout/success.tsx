import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Icons } from '@/src/components/Icons'
import { completeCheckoutAction } from '@/lib/signup-actions'
import { authClient } from '@/lib/auth-client'
import { Lightbulb, CheckCircle, AlertCircle } from 'lucide-react'

export const Route = createFileRoute('/checkout/success')({
  component: CheckoutSuccessPage,
  validateSearch: (search: Record<string, unknown>) => ({
    session_id: (search.session_id as string) || '',
  }),
})

function CheckoutSuccessPage() {
  const { session_id } = Route.useSearch()
  const navigate = useNavigate()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [error, setError] = useState<string | null>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    if (!session_id) {
      setStatus('error')
      setError('No checkout session found')
      return
    }

    const completeCheckout = async () => {
      try {
        const result = await completeCheckoutAction({ data: { sessionId: session_id } })
        
        const { data: session } = await authClient.getSession()
        const loggedIn = !!session?.user
        setIsLoggedIn(loggedIn)

        if (result.alreadyCompleted) {
          navigate({ to: loggedIn ? '/dashboard' : '/login', search: loggedIn ? undefined : { message: 'already_completed' } })
          return
        }

        setStatus('success')
        setTimeout(() => {
          if (loggedIn) {
            navigate({ to: '/dashboard' })
          } else {
            navigate({ to: '/login', search: { message: 'signup_complete' } })
          }
        }, 3000)
      } catch (err) {
        setStatus('error')
        setError(err instanceof Error ? err.message : 'Failed to complete signup')
      }
    }

    completeCheckout()
  }, [session_id, navigate])

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md text-center">
        <Link to="/" className="mb-8 inline-flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded bg-primary">
            <Lightbulb className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-semibold">Gripemine</span>
        </Link>

        {status === 'loading' && (
          <div className="mt-8 space-y-4">
            <Icons.spinner className="mx-auto h-12 w-12 animate-spin text-primary" />
            <h1 className="text-2xl font-semibold">Setting up your account...</h1>
            <p className="text-muted-foreground">
              Please wait while we complete your registration.
            </p>
          </div>
        )}

        {status === 'success' && (
          <div className="mt-8 space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
              <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <h1 className="text-2xl font-semibold">Welcome to Gripemine!</h1>
            <p className="text-muted-foreground">
              {isLoggedIn 
                ? 'Your subscription is active. Redirecting to dashboard...'
                : 'Your account has been created successfully. Redirecting you to login...'}
            </p>
            <div className="pt-4">
              {isLoggedIn ? (
                <Link to="/dashboard">
                  <Button>Go to Dashboard</Button>
                </Link>
              ) : (
                <Link to="/login" search={{ message: 'signup_complete' }}>
                  <Button>Continue to Login</Button>
                </Link>
              )}
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="mt-8 space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
              <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
            <h1 className="text-2xl font-semibold">Something went wrong</h1>
            <p className="text-muted-foreground">{error}</p>
            <div className="flex justify-center gap-4 pt-4">
              <Link to="/signup">
                <Button variant="outline">Try Again</Button>
              </Link>
              <Link to="/">
                <Button>Go Home</Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
