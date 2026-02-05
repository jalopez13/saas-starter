# SaaS Starter: Frontend

React 19 frontend with TanStack Start, better-auth authentication, and Tailwind CSS.

## Tech Stack

- React 19 + TanStack Start (SSR)
- TanStack Router (type-safe routing)
- TanStack Form (form handling)
- better-auth (authentication)
- Drizzle ORM (PostgreSQL)
- Tailwind CSS 4 + Radix UI
- Bun (runtime & package manager)
- Vitest (testing)

## Quick Start

```bash
# Install dependencies
bun install

# Start dev server (port 3000)
bun run dev

# Build for production
bun run build

# Preview production build
bun run preview
```

## Environment Variables

Copy `.env.example` to `.env` and configure:

| Variable | Description |
|----------|-------------|
| `BETTER_AUTH_SECRET` | Secret for session encryption |
| `BETTER_AUTH_URL` | Frontend URL (e.g., `http://localhost:3000`) |
| `DATABASE_URL` | PostgreSQL connection string |
| `GITHUB_CLIENT_ID` | GitHub OAuth client ID |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth secret |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth secret |

## Authentication

Uses better-auth with:
- Email/password login
- OAuth (Google, GitHub)
- Session-based authentication
- Protected route middleware

## Database

```bash
# Push schema to database
bun drizzle-kit push

# Generate migrations
bun drizzle-kit generate

# Open Drizzle Studio
bun drizzle-kit studio
```

## Development

```bash
bun run dev      # Start dev server
bun test         # Run tests
bun run lint     # Run ESLint
bun run format   # Run Prettier
bun run check    # Lint + format
```

## Project Structure

```
frontend/
├── components/ui/    # Radix UI components
├── db/               # Drizzle schema & client
├── lib/              # Auth config, utilities
├── public/           # Static assets
├── src/
│   ├── components/   # App components
│   └── routes/       # TanStack Router pages
├── package.json
└── vite.config.ts
```
