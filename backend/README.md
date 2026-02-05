# SaaS Starter: Backend APIs

## Overview

FastAPI backend for the SaaS Starter project. Integrates with better-auth tables created by the frontend, adds application-specific models, and exposes authenticated CRUD APIs with production-ready security.

## Tech Stack

- Python 3.12 + uv package manager
- FastAPI + Uvicorn
- SQLAlchemy 2.0 async + asyncpg
- Alembic async migrations
- Redis (session cache + rate limiting + response cache)
- pytest + testcontainers

## Security Features

| Feature | Implementation |
|---------|---------------|
| Rate Limiting | slowapi with Redis backend |
| CORS | Whitelist frontend origin only |
| Security Headers | HSTS, CSP, X-Frame-Options, X-XSS-Protection |
| Input Validation | Pydantic schemas |
| SQL Injection | SQLAlchemy parameterized queries |
| Auth | Cookie-based session validation (better-auth) |
| Error Handling | Safe responses, no stack traces in production |
| Logging | Structured JSON request/response logging |
| Request Size | 10MB limit (configurable) |

## Quick Start (Docker)

```bash
# Build and start all services
docker compose up -d --build

# Run migrations
docker compose exec backend alembic upgrade head

# Check health
curl http://localhost:8000/health
```

## API Documentation

Available in development mode only (disabled in production):
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc
- OpenAPI JSON: http://localhost:8000/openapi.json

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Service health check |
| GET | `/api/v1/users/me` | Current authenticated user |
| GET | `/api/v1/items` | List user's items |
| POST | `/api/v1/items` | Create item |
| GET | `/api/v1/items/{id}` | Get item by ID |
| PATCH | `/api/v1/items/{id}` | Update item |
| DELETE | `/api/v1/items/{id}` | Delete item |

## Environment Variables

See `.env.example` for defaults:

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql+asyncpg://...` |
| `REDIS_URL` | Redis connection string | `redis://localhost:6379/0` |
| `BETTER_AUTH_SECRET` | better-auth secret key | - |
| `BETTER_AUTH_URL` | Frontend URL with better-auth | `http://localhost:3000` |
| `APP_ENV` | Environment (development/production) | `development` |
| `DEBUG` | Enable debug mode | `true` |
| `SECRET_KEY` | Application secret key | - |
| `FRONTEND_URL` | Allowed CORS origin | `http://localhost:5173` |
| `RATE_LIMIT_REQUESTS` | Requests per window | `100` |
| `RATE_LIMIT_WINDOW` | Rate limit window (seconds) | `60` |
| `MAX_REQUEST_SIZE` | Max request body size (bytes) | `10485760` (10MB) |

## Authentication

The backend validates better-auth sessions by querying the shared PostgreSQL database:

1. Extract `better-auth.session_token` from request cookies
2. Query `session` table: `WHERE token = ? AND expiresAt > now()`
3. Fetch user from `user` table by `session.userId`
4. Cache validated sessions in Redis (5 min TTL)

## Database Architecture

```
PostgreSQL (shared)
├── user (better-auth, read-only)
├── session (better-auth, read-only)
├── account (better-auth, read-only)
├── verification (better-auth, read-only)
└── items (FastAPI manages)
```

## Migrations

```bash
# Apply all migrations
alembic upgrade head

# Create new migration
alembic revision --autogenerate -m "description"

# Rollback one migration
alembic downgrade -1
```

## Development

```bash
# Install dependencies
uv pip install -e ".[dev]"

# Run with hot-reload
uvicorn main:app --reload --port 8000

# Run linter
ruff check .

# Run tests
pytest

# Run tests with coverage
pytest --cov=app --cov-report=term-missing
```

## Project Structure

```
backend/
├── app/
│   ├── api/
│   │   ├── deps.py          # Auth dependencies
│   │   └── v1/
│   │       ├── auth.py      # User endpoints
│   │       └── items.py     # CRUD endpoints
│   ├── core/
│   │   ├── cache.py         # Redis client
│   │   ├── config.py        # Settings
│   │   ├── error_handlers.py
│   │   ├── limiter.py       # Rate limiting
│   │   ├── logging_*.py     # Logging config
│   │   ├── response_cache.py
│   │   ├── security_headers.py
│   │   └── size_limit_middleware.py
│   ├── db/
│   │   ├── base.py          # SQLAlchemy base
│   │   ├── session.py       # Async session
│   │   └── models/
│   │       ├── auth.py      # better-auth models
│   │       └── item.py      # App models
│   ├── schemas/
│   │   ├── auth.py
│   │   └── item.py
│   └── services/
│       └── cache_service.py
├── alembic/
│   ├── env.py
│   └── versions/
├── tests/
│   ├── conftest.py
│   ├── test_auth.py
│   └── test_items.py
├── main.py
├── pyproject.toml
├── Dockerfile
├── Dockerfile.dev
└── .env.example
```

## Production Checklist

| Category | Item | Status |
|----------|------|--------|
| Auth | Session validation | ✅ |
| Rate Limiting | Per-IP limits | ✅ |
| CORS | Whitelist origins | ✅ |
| Headers | Security headers | ✅ |
| Input | Pydantic validation | ✅ |
| Errors | No stack traces | ✅ |
| Logging | Request logging | ✅ |
| Secrets | Environment variables | ✅ |
| Docs | Disabled in production | ✅ |
| Size | Request size limits | ✅ |

## Troubleshooting

**Docker services fail to start:**
```bash
docker compose ps  # Check service status
docker compose logs backend  # View logs
```

**Migrations fail:**
- Verify `DATABASE_URL` points to running PostgreSQL
- Check database exists: `docker compose exec postgres psql -U postgres -l`

**Redis errors:**
- Verify `REDIS_URL` matches compose service name
- Check Redis is running: `docker compose exec redis redis-cli ping`

**Authentication fails:**
- Verify better-auth tables exist in PostgreSQL
- Check `better-auth.session_token` cookie is being sent
- Verify CORS allows credentials: `allow_credentials=True`
