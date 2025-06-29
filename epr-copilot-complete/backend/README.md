# EPR Co-Pilot Backend

FastAPI backend for EPR compliance automation.

## Setup

```bash
poetry install
poetry run fastapi dev app/main.py
```

## Environment Variables

Create a `.env` file:
```
SECRET_KEY=your-secret-key
DATABASE_URL=postgresql://user:password@localhost/epr_copilot
STRIPE_SECRET_KEY=sk_test_...
SENDGRID_API_KEY=SG...
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_S3_BUCKET=your-bucket
REDIS_URL=redis://localhost:6379
```

## Key Features

- JWT authentication system
- PostgreSQL database with SQLAlchemy ORM
- Stripe payment processing
- File upload with AWS S3 storage
- Email and SMS notifications
- Background job processing with Celery
- Security features (encryption, rate limiting, audit logging)

## API Documentation

Once running, visit http://localhost:8001/docs for interactive API documentation.

## Technologies

- FastAPI for the web framework
- SQLAlchemy for database ORM
- Celery for background jobs
- Stripe for payment processing
- SendGrid for email notifications
- Twilio for SMS notifications
- AWS S3 for file storage
