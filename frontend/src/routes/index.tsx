import { createFileRoute, Link } from "@tanstack/react-router";
import { ComponentExample } from "@/components/component-example";
import { Button } from "@/components/ui/button";
import { Lightbulb } from "lucide-react";

export const Route = createFileRoute("/")({ component: App });

function App() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <ComponentExample />
    </div>
  );
}

function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded bg-primary">
            <Lightbulb className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-lg font-semibold text-foreground">Gripemine</span>
        </Link>
        <nav className="flex items-center gap-4">
          <Link
            to="/login"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground-hover"
          >
            Sign In
          </Link>
          <Link to="/signup">
            <Button size="sm">Get Started</Button>
          </Link>
        </nav>
      </div>
    </header>
  );
}