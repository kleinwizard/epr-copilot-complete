# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Redis caching for idempotent fee calculations and producer lookups
- Comprehensive Pydantic validation schemas for all API endpoints
- Global exception handler with structured API error responses
- Cache performance monitoring and hit metrics
- Enhanced JWT token uniqueness with nonce generation

### Fixed
- **CRITICAL**: Token refresh uniqueness bug - tokens now generate unique values with nonce
- Missing @testing-library/user-event dependency for frontend tests
- SQLAlchemy deprecation warnings - updated to use declarative_base from sqlalchemy.orm
- FastAPI deprecation warnings - migrated from @app.on_event to lifespan context manager
- datetime.utcnow() deprecation warnings - updated to datetime.now(timezone.utc)
- Pydantic configuration deprecation warnings - migrated to ConfigDict pattern

### Changed
- Modernized authentication system with enhanced security
- Improved error handling across all API endpoints
- Enhanced decimal precision handling for regulatory compliance
- Updated all datetime operations to use timezone-aware UTC timestamps

### Security
- Enhanced JWT token generation with cryptographic nonces
- Improved input validation with comprehensive Pydantic schemas
- Strengthened error handling to prevent information leakage

## [1.0.0] - 2024-12-30

### Added
- Initial production-ready EPR compliance platform
- JWT-based authentication system
- PostgreSQL database with audit logging
- RESTful APIs for materials, fees, and compliance reporting
- React TypeScript frontend with analytics dashboard
- AWS S3 integration for file uploads
- Comprehensive test suite with 95%+ coverage
- Docker containerization for deployment
- CI/CD pipelines with security scanning
