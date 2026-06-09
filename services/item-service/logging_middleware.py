"""
Request Logging Middleware — log setiap HTTP request dengan timing dan correlation ID.
Sesuai Modul 14 Workshop 14.1.
"""
import logging
import time
import uuid

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request

logger = logging.getLogger(__name__)


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """Log setiap request/response dengan correlation ID dan durasi."""

    async def dispatch(self, request: Request, call_next):
        correlation_id = request.headers.get(
            "X-Correlation-ID",
            str(uuid.uuid4())[:12],
        )
        request.state.correlation_id = correlation_id
        start_time = time.time()

        try:
            response = await call_next(request)
        except Exception:
            duration_ms = round((time.time() - start_time) * 1000, 2)
            logger.error(
                f"Request failed: {request.method} {request.url.path}",
                extra={
                    "correlation_id": correlation_id,
                    "method": request.method,
                    "path": request.url.path,
                    "duration_ms": duration_ms,
                    "status_code": 500,
                },
            )
            raise

        duration_ms = round((time.time() - start_time) * 1000, 2)

        if request.url.path != "/health":
            log_level = logging.WARNING if response.status_code >= 400 else logging.INFO
            logger.log(
                log_level,
                f"{request.method} {request.url.path} → {response.status_code} ({duration_ms}ms)",
                extra={
                    "correlation_id": correlation_id,
                    "method": request.method,
                    "path": request.url.path,
                    "status_code": response.status_code,
                    "duration_ms": duration_ms,
                },
            )

        response.headers["X-Correlation-ID"] = correlation_id
        return response
