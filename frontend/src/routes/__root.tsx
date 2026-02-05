import { HeadContent, Outlet, Scripts, createRootRoute } from '@tanstack/react-router'
import appCss from '../styles.css?url'
import { Toaster } from '@/components/ui/sonner'
import { ThemeProvider } from '@/lib/theme-provider'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'Gripemine - Discover Profitable App Ideas' },
    ],
    links: [{ rel: 'stylesheet', href: appCss }],
  }),
  component: RootComponent,
  shellComponent: RootDocument,
})

function RootComponent() {
  return <Outlet />
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        <ThemeProvider>
          {children}
        </ThemeProvider>
        <Toaster />
        <Scripts />
      </body>
    </html>
  )
}
