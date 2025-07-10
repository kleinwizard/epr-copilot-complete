from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
from .database import create_tables
from .services.scheduler import task_scheduler
from .security import configure_security_middleware, limiter, enhanced_rate_limit_handler, check_ip_blocked
from .security.rate_limiting import custom_rate_limiter
from .exceptions import (
    validation_exception_handler,
    epr_exception_handler,
    http_exception_handler,
    EPRException
)
from .validation_schemas import FeeCalculationValidationSchema
from .config import get_settings
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    create_tables()
    try:
        task_scheduler.start()
        if task_scheduler.enabled:
            logger.info("Background task scheduler started")
        else:
            logger.info("Background task scheduler disabled via ENABLE_SCHEDULER environment variable")
    except Exception as e:
        logger.error(f"Failed to start task scheduler: {str(e)}")
    yield
    try:
        task_scheduler.stop()
        if task_scheduler.enabled:
            logger.info("Background task scheduler stopped")
    except Exception as e:
        logger.error(f"Error stopping task scheduler: {str(e)}")

app = FastAPI(title="EPR Co-Pilot Backend", version="1.0.0", lifespan=lifespan)

settings = get_settings()
logger.info(f"CORS origins configured: {settings.cors_origins}")
logger.info(f"CORS allow credentials: {settings.cors_allow_credentials}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=settings.cors_allow_credentials,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=3600,
)

configure_security_middleware(app)

app.state.limiter = limiter
app.add_exception_handler(429, enhanced_rate_limit_handler)
app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_exception_handler(EPRException, epr_exception_handler)
app.add_exception_handler(StarletteHTTPException, http_exception_handler)

@app.middleware("http")
async def debug_middleware(request, call_next):
    logger.info(f"Request: {request.method} {request.url} - Origin: {request.headers.get('origin')}")
    response = await call_next(request)
    logger.info(f"Response headers: {dict(response.headers)}")
    return response

from .routers import auth, products, materials, fees, reports, files, payments, epr_rates, notifications, background_jobs, admin, analytics, user, company, saved_searches, bulk, team, calendar, security, compliance, messages
from .routers import settings as settings_router
from .routers.reports import exports_router

app.include_router(auth.router)
app.include_router(products.router)
app.include_router(materials.router)
app.include_router(fees.router)
app.include_router(reports.router)
app.include_router(files.router)
app.include_router(payments.router)
app.include_router(epr_rates.router)
app.include_router(notifications.router)
app.include_router(background_jobs.router)
app.include_router(admin.router)
app.include_router(analytics.router)
app.include_router(user.router)
app.include_router(company.router)
app.include_router(saved_searches.router)
app.include_router(bulk.router)
app.include_router(team.router)
app.include_router(calendar.router)
app.include_router(security.router)
app.include_router(settings_router.router)
app.include_router(exports_router)
app.include_router(compliance.router)
app.include_router(messages.router)




@app.get("/healthz")
async def healthz():
    return {"status": "ok", "message": "EPR Co-Pilot Backend is running"}

@app.get("/api/health")
async def health_check():
    """Health check endpoint for monitoring."""
    from datetime import datetime, timezone
    return {
        "status": "healthy",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "database": "connected"
    }
