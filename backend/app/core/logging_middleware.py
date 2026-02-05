"""Request Logging Middleware.

Logs all incoming requests and outgoing responses with timing information.
Provides structured logging for monitoring and debugging.
"""

import time
from typing import Callable

from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware

from app.core.logging_config import logger


class LoggingMiddleware(BaseHTTPMiddleware):
    """Middleware that logs all requests and responses."""

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        start_time = time.time()

        # Extract request info
        method = request.method
        path = request.url.path
        client_ip = self._get_client_ip(request)
        user_agent = request.headers.get("user-agent", "unknown")

        # Log request start
        logger.info(
            "Request started",
            extra={
                "method": method,
                "path": path,
                "client_ip": client_ip,
                "user_agent": user_agent[:100] if user_agent else None,  # Truncate
            },
        )

        try:
            response = await call_next(request)
            duration_ms = round((time.time() - start_time) * 1000, 2)

            # Log successful response
            logger.info(
                "Request completed",
                extra={
                    "method": method,
                    "path": path,
                    "status_code": response.status_code,
                    "duration_ms": duration_ms,
                    "client_ip": client_ip,
                },
            )

            # Add timing header
            response.headers["X-Process-Time"] = str(duration_ms)
            return response

        except Exception as e:
            duration_ms = round((time.time() - start_time) * 1000, 2)

            # Log error
            logger.error(
                "Request failed",
                extra={
                    "method": method,
                    "path": path,
                    "error": str(e),
                    "duration_ms": duration_ms,
                    "client_ip": client_ip,
                },
                exc_info=True,
            )
            raise

    def _get_client_ip(self, request: Request) -> str:
        """Extract client IP from request, handling proxies."""
        # Check for forwarded headers (behind proxy/load balancer)
        forwarded = request.headers.get("x-forwarded-for")
        if forwarded:
            return forwarded.split(",")[0].strip()

        real_ip = request.headers.get("x-real-ip")
        if real_ip:
            return real_ip

        # Direct connection
        if request.client:
            return request.client.host

        return "unknown"
