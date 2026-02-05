from datetime import datetime
from typing import Any, cast

from fastapi import Depends, FastAPI, HTTPException
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from slowapi.extension import _rate_limit_exceeded_handler
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncSession
from starlette.types import ExceptionHandler

from app.api.v1 import auth, items
from app.core.cache import close_redis, get_redis, init_redis
from app.core.config import settings
from app.core.error_handlers import (
    AppException,
    app_exception_handler,
    generic_exception_handler,
    http_exception_handler,
    sqlalchemy_exception_handler,
    validation_exception_handler,
)
from app.core.limiter import limiter
from app.core.logging_middleware import LoggingMiddleware
from app.core.response_cache import cache_response
from app.core.security_headers import SecurityHeadersMiddleware
from app.core.size_limit_middleware import RequestSizeLimitMiddleware
from app.db.session import get_db

app = FastAPI(
    title="SaaS Starter API",
    version="0.1.0",
    docs_url="/docs" if settings.debug else None,
    redoc_url="/redoc" if settings.debug else None,
    openapi_url="/openapi.json" if settings.debug else None,
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, cast(ExceptionHandler, _rate_limit_exceeded_handler))
app.add_exception_handler(HTTPException, cast(ExceptionHandler, http_exception_handler))
app.add_exception_handler(
    RequestValidationError, cast(ExceptionHandler, validation_exception_handler)
)
app.add_exception_handler(SQLAlchemyError, cast(ExceptionHandler, sqlalchemy_exception_handler))
app.add_exception_handler(AppException, cast(ExceptionHandler, app_exception_handler))
app.add_exception_handler(Exception, cast(ExceptionHandler, generic_exception_handler))

app.add_middleware(SlowAPIMiddleware)
app.add_middleware(LoggingMiddleware)
app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(RequestSizeLimitMiddleware, max_size=settings.max_request_size)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def on_startup() -> None:
    await init_redis()


@app.on_event("shutdown")
async def on_shutdown() -> None:
    await close_redis()


app.include_router(auth.router, prefix="/api/v1")
app.include_router(items.router, prefix="/api/v1")


@app.get("/health")
@cache_response("health", ttl=60)
async def health_check(db: AsyncSession = Depends(get_db)) -> dict[str, str]:
    """Return health status for database and Redis connections."""
    await db.execute(text("SELECT 1"))
    redis = await get_redis()
    await cast(Any, redis).ping()
    return {
        "status": "healthy",
        "database": "connected",
        "redis": "connected",
        "timestamp": datetime.utcnow().isoformat(),
    }
