FROM python:3.12-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    POETRY_NO_INTERACTION=1 \
    POETRY_VENV_IN_PROJECT=1 \
    POETRY_CACHE_DIR=/tmp/poetry_cache

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Poetry
RUN pip install poetry

# Set work directory to match the epr_backend structure
WORKDIR /app/epr_backend

# Copy the entire epr_backend directory
COPY epr_backend/ ./

# Install dependencies globally using pip instead of Poetry
RUN pip install fastapi[standard]==0.115.14 \
    uvicorn[standard]==0.32.1 \
    psycopg2-binary==2.9.9 \
    sqlalchemy==2.0.41 \
    alembic==1.16.2 \
    redis==5.2.1 \
    python-jose[cryptography]==3.3.0 \
    passlib[bcrypt]==1.7.4 \
    python-multipart==0.0.20 \
    pydantic==2.10.4 \
    pydantic-settings==2.7.0 \
    python-dotenv==1.0.1 \
    celery==5.4.0 \
    reportlab==4.2.5 \
    pandas==2.2.3 \
    openpyxl==3.1.5 \
    pytest==8.3.4 \
    pytest-asyncio==0.25.0 \
    httpx==0.28.1 \
    boto3==1.35.0 \
    botocore==1.35.0 \
    stripe==7.8.0 \
    twilio==8.11.0 \
    sendgrid==6.11.0 \
    jinja2==3.1.5 \
    firebase-admin==6.5.0 \
    apscheduler==3.10.4 \
    slowapi==0.1.9

# Create non-root user
RUN adduser --disabled-password --gecos '' appuser && chown -R appuser:appuser /app
USER appuser

# Expose port
EXPOSE 8001

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8001/healthz || exit 1

# Run the application using system Python
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8001"]
