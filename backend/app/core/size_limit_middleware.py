"""Request Size Limiting Middleware.

Prevents oversized requests from consuming server resources.
Returns 413 (Payload Too Large) for requests exceeding the limit.
"""

from fastapi import HTTPException, Request
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response

from app.core.config import settings


class RequestSizeLimitMiddleware(BaseHTTPMiddleware):
    """Middleware that limits request body size."""

    def __init__(self, app, max_size: int | None = None) -> None:
        super().__init__(app)
        # Default to 10MB, configurable via settings
        self.max_size = max_size or getattr(settings, "max_request_size", 10 * 1024 * 1024)

    async def dispatch(self, request: Request, call_next) -> Response:
        # Check Content-Length header if present
        content_length = request.headers.get("content-length")

        if content_length:
            size = int(content_length)
            if size > self.max_size:
                raise HTTPException(
                    status_code=413,
                    detail=f"Request body too large. Maximum size: {self._format_size(self.max_size)}",
                )

        return await call_next(request)

    def _format_size(self, size_bytes: int) -> str:
        size_float: float = float(size_bytes)
        for unit in ["B", "KB", "MB", "GB"]:
            if size_float < 1024:
                return f"{size_float:.1f} {unit}"
            size_float = size_float / 1024
        return f"{size_float:.1f} TB"
