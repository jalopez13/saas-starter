import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { useForm } from '@tanstack/react-form'
import { useEffect } from 'react'
import { z } from 'zod'
import { toast } from 'sonner'
import { Lightbulb } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Icons } from '@/src/components/Icons'
import { authClient } from '@/lib/auth-client'

export const Route = createFileRoute('/login')({
  component: LoginPage,
  validateSearch: (search: Record<string, unknown>) => ({
    message: (search.message as string) || undefined,
  }),
})

const loginSchema = z.object({
  email: z.email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

function LoginPage() {
  const navigate = useNavigate()
  const { message } = Route.useSearch()

  useEffect(() => {
    if (message === 'signup_complete') {
      toast.success('Account created! Please sign in to continue.', {
        duration: 5000,
      })
    } else if (message === 'already_completed') {
      toast.info('Your account is already set up. Please sign in.', {
        duration: 5000,
      })
    }
  }, [message])

  const form = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
    validators: {
      onSubmit: loginSchema,
      onBlur: loginSchema,
    },
    onSubmit: async ({ value }) => {
      await authClient.signIn.email(
        {
          email: value.email,
          password: value.password,
          callbackURL: '/dashboard',
        },
        {
          onSuccess: () => {
            toast.success('Logged in successfully!', { duration: 2000 })
            setTimeout(() => navigate({ to: '/dashboard' }), 2000)
          },
          onError: (ctx) => {
            toast.error(ctx.error.message)
          },
        },
      )
    },
  })

  const handleGoogleLogin = async () => {
    await authClient.signIn.social({
      provider: 'google',
      callbackURL: '/dashboard',
    })
  }

  const handleGithubLogin = async () => {
    await authClient.signIn.social({
      provider: 'github',
      callbackURL: '/dashboard',
    })
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-lg">
        <div className="rounded border border-border bg-card p-8">
          <div className="mb-6 text-center">
            <Link to="/" className="mb-4 inline-flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded bg-primary">
                <Lightbulb className="h-4 w-4 text-primary-foreground" />
              </div>
            </Link>
            <h1 className="text-xl font-semibold">Gripemine</h1>
            <h2 className="mt-2 text-lg font-medium">Welcome back</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Sign in to your Gripemine account
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              onClick={handleGoogleLogin}
              disabled={form.state.isSubmitting}
              className="w-full"
            >
              <Icons.google className="mr-2 h-4 w-4" />
              Google
            </Button>
            <Button
              variant="outline"
              onClick={handleGithubLogin}
              disabled={form.state.isSubmitting}
              className="w-full"
            >
              <Icons.gitHub className="mr-2 h-4 w-4" />
              GitHub
            </Button>
          </div>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">
                Or continue with email
              </span>
            </div>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault()
              e.stopPropagation()
              form.handleSubmit()
            }}
            className="space-y-4"
          >
            <form.Field name="email">
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>Email</Label>
                  <Input
                    id={field.name}
                    type="email"
                    placeholder="samsmith@gmail.com"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    disabled={form.state.isSubmitting}
                    data-invalid={field.state.meta.errors.length > 0}
                    className="data-[invalid=true]:border-destructive"
                  />
                  {field.state.meta.errors.length > 0 && (
                    <p className="text-sm text-destructive">
                      {field.state.meta.errors[0]?.message}
                    </p>
                  )}
                </div>
              )}
            </form.Field>

            <form.Field name="password">
              {(field) => (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor={field.name}>Password</Label>
                    <Link
                      to="/forgot-password"
                      className="text-xs text-muted-foreground hover:text-foreground"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <Input
                    id={field.name}
                    type="password"
                    placeholder="••••••••••••"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    disabled={form.state.isSubmitting}
                    data-invalid={field.state.meta.errors.length > 0}
                    className="data-[invalid=true]:border-destructive"
                  />
                  {field.state.meta.errors.length > 0 && (
                    <p className="text-sm text-destructive">
                      {field.state.meta.errors[0]?.message}
                    </p>
                  )}
                </div>
              )}
            </form.Field>

            <form.Subscribe
              selector={(state) => [state.canSubmit, state.isSubmitting]}
            >
              {([canSubmit, isSubmitting]) => (
                <Button
                  type="submit"
                  className="w-full"
                  disabled={!canSubmit || isSubmitting}
                >
                  {isSubmitting && (
                    <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Sign In
                </Button>
              )}
            </form.Subscribe>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Don't have an account?{' '}
            <Link to="/signup" className="text-primary hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
