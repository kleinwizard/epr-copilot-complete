from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
from .database import create_tables
from .routers import auth, products, materials, fees, reports, files, payments, epr_rates, notifications, background_jobs, admin, analytics
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

configure_security_middleware(app)

app.state.limiter = limiter
app.add_exception_handler(429, enhanced_rate_limit_handler)
app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_exception_handler(EPRException, epr_exception_handler)
app.add_exception_handler(StarletteHTTPException, http_exception_handler)

# Disable CORS. Do not remove this for full-stack development.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

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
