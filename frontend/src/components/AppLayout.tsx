import { Sidebar } from './Sidebar'

interface AppLayoutProps {
  children: React.ReactNode
  title: string
  description?: string
}

export function AppLayout({ children, title, description }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="ml-56 min-h-screen">
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
            {description && (
              <p className="mt-1 text-sm text-muted-foreground">{description}</p>
            )}
          </div>
          {children}
        </div>
      </main>
    </div>
  )
}
