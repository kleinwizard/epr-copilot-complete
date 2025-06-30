from fastapi import HTTPException, Request
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
import logging
from typing import Optional

logger = logging.getLogger(__name__)

class EPRException(Exception):
    def __init__(self, message: str, error_code: Optional[str] = None):
        self.message = message
        self.error_code = error_code
        super().__init__(self.message)

class ValidationException(EPRException):
    pass

class ComplianceException(EPRException):
    pass

async def validation_exception_handler(request: Request, exc: RequestValidationError):
    logger.error(f"Validation error: {exc.errors()}")
    return JSONResponse(
        status_code=422,
        content={
            "error": "Validation Error",
            "message": "Invalid input data",
            "details": exc.errors(),
            "error_code": "VALIDATION_ERROR"
        }
    )

async def epr_exception_handler(request: Request, exc: EPRException):
    logger.error(f"EPR error: {exc.message}")
    return JSONResponse(
        status_code=400,
        content={
            "error": "EPR Error",
            "message": exc.message,
            "error_code": exc.error_code or "EPR_ERROR"
        }
    )

async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "detail": exc.detail,
            "error": "HTTP Error",
            "error_code": f"HTTP_{exc.status_code}"
        }
    )
