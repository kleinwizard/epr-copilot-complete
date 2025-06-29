from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import create_tables
from .routers import auth, products, materials, fees, reports, files, payments, epr_rates, notifications, background_jobs
from .services.scheduler import task_scheduler
from .security import configure_security_middleware, limiter, enhanced_rate_limit_handler, check_ip_blocked
from .security.rate_limiting import custom_rate_limiter
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="EPR Co-Pilot Backend", version="1.0.0")

configure_security_middleware(app)

app.state.limiter = limiter
app.add_exception_handler(429, enhanced_rate_limit_handler)

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


@app.on_event("startup")
async def startup_event():
    create_tables()
    try:
        task_scheduler.start()
        logger.info("Background task scheduler started")
    except Exception as e:
        logger.error(f"Failed to start task scheduler: {str(e)}")


@app.on_event("shutdown")
async def shutdown_event():
    try:
        task_scheduler.stop()
        logger.info("Background task scheduler stopped")
    except Exception as e:
        logger.error(f"Error stopping task scheduler: {str(e)}")


@app.get("/healthz")
async def healthz():
    return {"status": "ok", "message": "EPR Co-Pilot Backend is running"}
