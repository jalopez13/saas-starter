"""Logging Configuration.

Provides structured JSON logging for the application.
Includes request/response logging middleware.
"""

import logging
import sys
from datetime import datetime
from typing import Any


EXTRA_FIELDS = ("method", "path", "client_ip", "user_agent", "status_code", "duration_ms", "error")


class JsonFormatter(logging.Formatter):
    def format(self, record: logging.LogRecord) -> str:
        log_record: dict[str, Any] = {
            "timestamp": datetime.utcnow().isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
        }

        for field in EXTRA_FIELDS:
            value = record.__dict__.get(field)
            if value is not None:
                log_record[field] = value

        if record.exc_info:
            log_record["exception"] = self.formatException(record.exc_info)

        import json

        return json.dumps(log_record)


def setup_logging() -> logging.Logger:
    """Configure and return the application logger."""
    # Create handler
    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(JsonFormatter())

    # Configure root logger
    root_logger = logging.getLogger()
    root_logger.handlers.clear()
    root_logger.addHandler(handler)
    root_logger.setLevel(logging.INFO)

    # Create app logger
    logger = logging.getLogger("saas_starter")
    logger.setLevel(logging.INFO)

    # Reduce noise from other libraries
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING)

    return logger


# Global logger instance
logger = setup_logging()
