"""Global Error Handling.

Provides consistent error responses across the application.
CRITICAL: Never leak stack traces or internal details in production.
"""

import traceback
from typing import Any

from fastapi import HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from sqlalchemy.exc import SQLAlchemyError

from app.core.config import settings
from app.core.logging_config import logger


class AppException(Exception):
    """Base application exception for custom errors."""

    def __init__(
        self,
        message: str,
        status_code: int = 500,
        details: dict[str, Any] | None = None,
    ) -> None:
        self.message = message
        self.status_code = status_code
        self.details = details or {}
        super().__init__(self.message)


def _create_error_response(
    status_code: int,
    message: str,
    path: str,
    details: dict[str, Any] | None = None,
    debug_info: str | None = None,
) -> JSONResponse:
    """Create a standardized error response."""
    content: dict[str, Any] = {
        "error": {
            "code": status_code,
            "message": message,
            "path": path,
        }
    }

    if details:
        content["error"]["details"] = details

    # Only include debug info in development
    if debug_info and settings.debug:
        content["error"]["debug"] = debug_info

    return JSONResponse(status_code=status_code, content=content)


async def http_exception_handler(request: Request, exc: HTTPException) -> JSONResponse:
    """Handle HTTP exceptions (4xx, 5xx errors)."""
    return _create_error_response(
        status_code=exc.status_code,
        message=str(exc.detail),
        path=request.url.path,
    )


async def validation_exception_handler(
    request: Request, exc: RequestValidationError
) -> JSONResponse:
    """Handle Pydantic validation errors.

    Returns field-level error details for client-side handling.
    """
    errors = []
    for error in exc.errors():
        errors.append(
            {
                "field": ".".join(str(loc) for loc in error["loc"]),
                "message": error["msg"],
                "type": error["type"],
            }
        )

    return _create_error_response(
        status_code=422,
        message="Validation error",
        path=request.url.path,
        details={"errors": errors},
    )


async def sqlalchemy_exception_handler(request: Request, exc: SQLAlchemyError) -> JSONResponse:
    """Handle database errors.

    CRITICAL: Never expose SQL or database internals to clients.
    """
    # Log the full error internally
    logger.error(
        "Database error occurred",
        extra={
            "path": request.url.path,
            "error": str(exc),
        },
        exc_info=True,
    )

    return _create_error_response(
        status_code=500,
        message="A database error occurred. Please try again later.",
        path=request.url.path,
        debug_info=str(exc) if settings.debug else None,
    )


async def app_exception_handler(request: Request, exc: AppException) -> JSONResponse:
    """Handle custom application exceptions."""
    logger.warning(
        "Application exception",
        extra={
            "path": request.url.path,
            "error": exc.message,
            "status_code": exc.status_code,
        },
    )

    return _create_error_response(
        status_code=exc.status_code,
        message=exc.message,
        path=request.url.path,
        details=exc.details if exc.details else None,
    )


async def generic_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """Handle all unhandled exceptions.

    CRITICAL: Never expose stack traces in production.
    """
    # Log the full error internally
    logger.error(
        "Unhandled exception occurred",
        extra={
            "path": request.url.path,
            "error": str(exc),
        },
        exc_info=True,
    )

    return _create_error_response(
        status_code=500,
        message="An unexpected error occurred. Please try again later.",
        path=request.url.path,
        debug_info=traceback.format_exc() if settings.debug else None,
    )
