import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { useForm } from '@tanstack/react-form'
import { z } from 'zod'
import { toast } from 'sonner'
import { Lightbulb } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Icons } from '@/src/components/Icons'
import { createPendingSignupAction } from '@/lib/signup-actions'
import { authClient } from '@/lib/auth-client'

export const Route = createFileRoute('/signup')({
  component: SignupPage,
})

const signupSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.email('Please enter a valid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

function SignupPage() {
  const navigate = useNavigate()

  const handleGoogleSignup = async () => {
    await authClient.signIn.social({
      provider: 'google',
      callbackURL: '/dashboard',
      newUserCallbackURL: '/pricing',
    })
  }

  const handleGithubSignup = async () => {
    await authClient.signIn.social({
      provider: 'github',
      callbackURL: '/dashboard',
      newUserCallbackURL: '/pricing',
    })
  }

  const form = useForm({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    validators: {
      onSubmit: signupSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        await createPendingSignupAction({
          data: {
            name: value.name,
            email: value.email,
            password: value.password,
          },
        })
        navigate({ to: '/pricing' })
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Signup failed'
        toast.error(message)
      }
    },
  })

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
            <h2 className="mt-2 text-lg font-medium">Create your account</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Start with a 14-day free trial
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              onClick={handleGoogleSignup}
              disabled={form.state.isSubmitting}
              className="w-full"
            >
              <Icons.google className="mr-2 h-4 w-4" />
              Google
            </Button>
            <Button
              variant="outline"
              onClick={handleGithubSignup}
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
              form.handleSubmit()
            }}
            className="space-y-4"
          >
            <form.Field name="name">
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>Name</Label>
                  <Input
                    id={field.name}
                    placeholder="John Doe"
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
                  <Label htmlFor={field.name}>Password</Label>
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

            <form.Field name="confirmPassword">
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>Confirm Password</Label>
                  <Input
                    id={field.name}
                    type="password"
                    placeholder="••••••••"
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
                  Create Account
                </Button>
              )}
            </form.Subscribe>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link to="/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
