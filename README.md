# SaaS Starter

A production-ready SaaS starter kit with React frontend and FastAPI backend, featuring authentication, CRUD operations, and Docker orchestration.

## Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| React 19 | UI framework |
| TanStack Start | Full-stack React framework with SSR |
| TanStack Router | Type-safe routing |
| TanStack Form | Form handling with validation |
| better-auth | Authentication (OAuth + email/password) |
| Drizzle ORM | Database access (PostgreSQL) |
| Tailwind CSS 4 | Styling |
| Radix UI | Accessible UI components |
| Zod | Schema validation |
| Vite 7 | Build tool |
| Bun | JavaScript runtime & package manager |
| Vitest | Testing |

### Backend
| Technology | Purpose |
|------------|---------|
| Python 3.12 | Runtime |
| FastAPI | API framework |
| SQLAlchemy 2.0 | Async ORM |
| Alembic | Database migrations |
| Redis | Caching & rate limiting |
| Pydantic | Data validation |
| slowapi | Rate limiting |
| pytest | Testing |

### Infrastructure
| Technology | Purpose |
|------------|---------|
| PostgreSQL 17 | Database |
| Redis 7 | Cache & session store |
| Docker Compose | Local orchestration |

## Features

### Authentication (better-auth)
- Email/password login and registration
- OAuth providers (Google, GitHub) with automatic plan selection flow
- Session-based authentication with cookies
- Protected routes with middleware
- **Admin plugin**: Role-based access control (admin, moderator, user)
- **Stripe plugin**: Subscription billing with plan switching support

### Frontend Features
- Server-side rendering (SSR) with TanStack Start
- Type-safe routing with automatic code splitting
- Form validation with Zod schemas
- Toast notifications (Sonner)
- Dark mode support (next-themes)
- Responsive UI components

### Backend Features
- Async API with FastAPI
- Session validation via shared PostgreSQL
- Redis caching (sessions, rate limiting, responses)
- Structured JSON logging
- Production-ready security middleware

### Subscription Plans (Stripe)
| Plan | Price | Features |
|------|-------|----------|
| Starter | $29/month | 14-day free trial, basic features |
| Pro | $69/month | All features, priority support |

**Subscription Features:**
- New users (email or OAuth) are redirected to pricing page to select a plan
- Existing subscribers can upgrade/downgrade plans from the billing page
- Plan changes are handled via Stripe Billing Portal with proration
- Webhook integration for real-time subscription status updates

### User Roles (Admin Plugin)
| Role | Permissions |
|------|-------------|
| Admin | Full access: list users, ban/unban, change roles, impersonate |
| Moderator | Limited: list users, ban/unban only |
| User | No admin access |

### Security
| Feature | Implementation |
|---------|---------------|
| Rate Limiting | slowapi with Redis backend |
| CORS | Whitelist frontend origin only |
| Security Headers | HSTS, CSP, X-Frame-Options |
| Input Validation | Pydantic + Zod |
| SQL Injection | Parameterized queries |
| Error Handling | Safe responses, no stack traces in prod |
| Request Logging | Structured JSON with timing |
| Request Size Limit | 10MB default |

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (Port 5173)                      │
│  TanStack Start + React 19 + better-auth                    │
│  - SSR + Client hydration                                    │
│  - Auth routes: /api/auth/*                                  │
│  - UI: /login, /signup, /dashboard                          │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ Cookie: better-auth.session_token
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Backend (Port 8000)                       │
│  FastAPI + SQLAlchemy async                                  │
│  - Validates sessions from shared DB                         │
│  - API: /api/v1/*                                           │
│  - Caches validated sessions in Redis                        │
└─────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┴───────────────┐
              ▼                               ▼
┌─────────────────────────┐     ┌─────────────────────────┐
│  PostgreSQL (Port 5432) │     │    Redis (Port 6379)    │
│  - user (better-auth)   │     │  - Session cache        │
│  - session (better-auth)│     │  - Rate limiting        │
│  - account (better-auth)│     │  - Response cache       │
│  - items (FastAPI)      │     │                         │
└─────────────────────────┘     └─────────────────────────┘
```

## Quick Start

### Prerequisites
- Docker & Docker Compose
- Bun 1.0+ (for local frontend development)
- Python 3.12+ (for local backend development)

### 1. Clone and Configure

```bash
git clone <repo-url> saas-starter
cd saas-starter

# Copy environment files
cp frontend/.env.example frontend/.env
cp backend/.env.example backend/.env
```

### 2. Start Services

```bash
# Build and start all services
docker compose up -d --build

# Run database migrations
docker compose exec backend alembic upgrade head

# Push Drizzle schema (frontend auth tables)
cd frontend && bun drizzle-kit push && cd ..
```

### 3. Verify

```bash
# Check all services are healthy
docker compose ps

# Test backend health
curl http://localhost:8000/health

# Open frontend
open http://localhost:5173
```

## Environment Variables

### Frontend (`frontend/.env`)

| Variable | Description | Required |
|----------|-------------|----------|
| `BETTER_AUTH_SECRET` | Secret for session encryption | Yes |
| `BETTER_AUTH_URL` | Frontend URL for auth callbacks | Yes |
| `DATABASE_URL` | PostgreSQL connection (Drizzle format) | Yes |
| `GITHUB_CLIENT_ID` | GitHub OAuth client ID | For OAuth |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth secret | For OAuth |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | For OAuth |
| `GOOGLE_CLIENT_SECRET` | Google OAuth secret | For OAuth |
| `STRIPE_SECRET_KEY` | Stripe secret key | For billing |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook secret | For billing |
| `STRIPE_STARTER_PRICE_ID` | Stripe price ID for Starter plan ($29/mo) | For billing |
| `STRIPE_PRO_PRICE_ID` | Stripe price ID for Pro plan ($69/mo) | For billing |
| `ADMIN_USER_LIST` | Comma-separated admin emails (auto-promoted on signup) | Optional |

### Stripe Dashboard Configuration

For plan switching to work, configure the Stripe Customer Portal:

1. Go to **Stripe Dashboard → Settings → Billing → Customer Portal**
2. Under **Subscriptions**, enable "Allow customers to switch plans"
3. Add both Starter and Pro prices to the allowed products
4. Set **Redirect link** to your billing page URL (e.g., `http://localhost:5173/billing`)
5. Save changes

### Backend (`backend/.env`)

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection (asyncpg format) | Required |
| `REDIS_URL` | Redis connection string | `redis://localhost:6379/0` |
| `BETTER_AUTH_SECRET` | Same as frontend | Required |
| `BETTER_AUTH_URL` | Frontend URL | `http://localhost:3000` |
| `APP_ENV` | Environment mode | `development` |
| `DEBUG` | Enable debug mode | `true` |
| `SECRET_KEY` | App secret key | Required |
| `FRONTEND_URL` | CORS allowed origin | `http://localhost:5173` |
| `RATE_LIMIT_REQUESTS` | Requests per window | `100` |
| `RATE_LIMIT_WINDOW` | Window in seconds | `60` |

### Docker Compose (`.env` at root, optional)

| Variable | Default |
|----------|---------|
| `POSTGRES_USER` | `postgres` |
| `POSTGRES_PASSWORD` | `postgres` |
| `POSTGRES_DB` | `saas_starter` |

## Development

### Frontend Only

```bash
cd frontend

# Install dependencies
bun install

# Run dev server (port 3000)
bun run dev

# Run tests
bun test

# Lint & format
bun run check
```

### Backend Only

```bash
cd backend

# Install dependencies
uv pip install -e ".[dev]"

# Run dev server (port 8000)
uvicorn main:app --reload

# Run tests
pytest

# Lint
ruff check .
```

### Full Stack (Docker)

```bash
# Start all services with hot-reload
docker compose up

# View logs
docker compose logs -f backend
docker compose logs -f frontend

# Rebuild after dependency changes
docker compose up --build

# Stop all services
docker compose down

# Stop and remove volumes (resets database)
docker compose down -v
```

## Database

### Migrations (Backend - Alembic)

```bash
# Apply all migrations
docker compose exec backend alembic upgrade head

# Create new migration
docker compose exec backend alembic revision --autogenerate -m "description"

# Rollback one migration
docker compose exec backend alembic downgrade -1
```

### Schema (Frontend - Drizzle)

```bash
cd frontend

# Push schema changes to database
bun drizzle-kit push

# Generate migration files
bun drizzle-kit generate

# Open Drizzle Studio (database UI)
bun drizzle-kit studio
```

### Database Tables

| Table | Managed By | Description |
|-------|-----------|-------------|
| `user` | better-auth | User accounts (with role, banned, stripeCustomerId) |
| `session` | better-auth | Active sessions (with impersonatedBy) |
| `account` | better-auth | OAuth connections |
| `verification` | better-auth | Email verification tokens |
| `subscription` | better-auth/stripe | Stripe subscriptions |
| `items` | FastAPI | Example CRUD resource (requires subscription) |

## API Reference

### Backend Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/health` | No | Service health check |
| GET | `/api/v1/users/me` | Yes | Current user profile |
| GET | `/api/v1/items` | Yes + Sub | List user's items (requires subscription) |
| POST | `/api/v1/items` | Yes + Sub | Create item (requires subscription) |
| GET | `/api/v1/items/{id}` | Yes + Sub | Get item by ID (requires subscription) |
| PATCH | `/api/v1/items/{id}` | Yes + Sub | Update item (requires subscription) |
| DELETE | `/api/v1/items/{id}` | Yes + Sub | Delete item (requires subscription) |

### Frontend Routes

| Path | Description |
|------|-------------|
| `/api/auth/*` | better-auth handler (all auth operations) |
| `/login` | Login page |
| `/signup` | Registration page |
| `/dashboard` | Protected dashboard (requires auth) |
| `/pricing` | Plan selection for new users (redirected here after OAuth signup) |
| `/billing` | Plan management for subscribers (upgrade/downgrade plans) |
| `/admin` | Admin dashboard (requires admin/moderator role) |
| `/admin/users` | User management (ban, role change, impersonate) |

### API Documentation

Available in development mode:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Testing

### Frontend

```bash
cd frontend
bun test                    # Run tests
bun test --watch            # Watch mode
bun test --coverage         # With coverage
```

### Backend

```bash
cd backend
pytest                      # Run all tests
pytest -v                   # Verbose output
pytest --cov=app            # With coverage
pytest tests/test_auth.py   # Specific file
```

## Project Structure

```
saas-starter/
├── frontend/
│   ├── components/ui/        # Radix UI components
│   ├── db/
│   │   ├── schema.ts         # Drizzle schema (better-auth tables)
│   │   └── drizzel.ts        # Database client
│   ├── lib/
│   │   ├── auth.ts           # better-auth configuration
│   │   ├── auth-client.ts    # Client-side auth
│   │   └── middleware.ts     # Auth middleware
│   ├── src/
│   │   ├── components/       # App components
│   │   └── routes/           # TanStack Router pages
│   ├── package.json
│   ├── vite.config.ts
│   └── Dockerfile
│
├── backend/
│   ├── app/
│   │   ├── api/v1/           # API routes
│   │   ├── core/             # Config, middleware, security
│   │   ├── db/               # SQLAlchemy models & session
│   │   ├── schemas/          # Pydantic schemas
│   │   └── services/         # Business logic
│   ├── alembic/              # Migrations
│   ├── tests/                # pytest tests
│   ├── main.py               # FastAPI app
│   ├── pyproject.toml
│   ├── Dockerfile
│   └── Dockerfile.dev
│
├── compose.yaml              # Service orchestration (Docker Compose)
└── README.md                 # This file
```

## Production Deployment

### Checklist

| Category | Item | Status |
|----------|------|--------|
| Auth | Session validation | ✅ |
| Rate Limiting | Per-IP limits | ✅ |
| CORS | Whitelist origins only | ✅ |
| Headers | Security headers (HSTS, CSP) | ✅ |
| Input | Pydantic + Zod validation | ✅ |
| Errors | No stack traces leaked | ✅ |
| Logging | Structured JSON logging | ✅ |
| Secrets | Environment variables | ✅ |
| Docs | Disabled in production | ✅ |
| HTTPS | TLS termination | Configure in proxy |

### Environment Changes for Production

```bash
# Backend
APP_ENV=production
DEBUG=false

# Ensure these are set:
# - Strong SECRET_KEY
# - Strong BETTER_AUTH_SECRET
# - Correct FRONTEND_URL for CORS
```

### Recommended Platforms

- **Railway** - One-click PostgreSQL + Redis
- **Fly.io** - Global edge deployment
- **Render** - Simple Docker deployment
- **Vercel** - Frontend (requires separate backend)

## Troubleshooting

### Docker Issues

```bash
# Services not starting
docker compose ps
docker compose logs <service>

# Reset everything
docker compose down -v
docker compose up --build
```

### Database Issues

```bash
# Check PostgreSQL
docker compose exec postgres psql -U postgres -l

# Check tables exist
docker compose exec postgres psql -U postgres -d saas_starter -c "\dt"

# Reset database
docker compose down -v
docker compose up -d postgres
docker compose exec backend alembic upgrade head
```

### Authentication Issues

1. Verify `BETTER_AUTH_SECRET` matches in frontend and backend
2. Check `better-auth.session_token` cookie is being set
3. Verify CORS allows credentials (`allow_credentials=True`)
4. Ensure database URL uses correct format:
   - Frontend (Drizzle): `postgresql://user:pass@host:5432/db`
   - Backend (asyncpg): `postgresql+asyncpg://user:pass@host:5432/db`

### Redis Issues

```bash
# Check Redis is running
docker compose exec redis redis-cli ping

# Clear Redis cache
docker compose exec redis redis-cli FLUSHALL
```

### Stripe Issues

1. **Webhook not receiving events**: Run Stripe CLI to forward webhooks locally:
   ```bash
   stripe listen --forward-to http://localhost:5173/api/auth/stripe/webhook
   ```

2. **Plan switching fails**: Ensure Stripe Billing Portal is configured (see Stripe Dashboard Configuration section)

3. **"Price not in features[subscription_update][products]" error**: Add both plan prices to Customer Portal's allowed products

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Make your changes
4. Run tests: `bun test` (frontend) and `pytest` (backend)
5. Commit: `git commit -m "Add my feature"`
6. Push: `git push origin feature/my-feature`
7. Create a Pull Request

## License

MIT
