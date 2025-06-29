from fastapi import FastAPI, Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from typing import Callable
import os
import re


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Middleware to add security headers to all responses."""

    def __init__(self, app: FastAPI):
        super().__init__(app)
        self.csp_policy = self._build_csp_policy()

    def _build_csp_policy(self) -> str:
        """Build Content Security Policy."""
        is_development = os.getenv(
            "ENVIRONMENT", "development") == "development"

        if is_development:
            return (
                "default-src 'self' http://localhost:* https://localhost:*; "
                "script-src 'self' 'unsafe-inline' 'unsafe-eval' http://localhost:* https://localhost:*; "
                "style-src 'self' 'unsafe-inline' http://localhost:* https://localhost:*; "
                "img-src 'self' data: http://localhost:* https://localhost:* https://*.stripe.com; "
                "connect-src 'self' http://localhost:* https://localhost:* https://api.stripe.com; "
                "font-src 'self' data:; "
                "object-src 'none'; "
                "base-uri 'self'; "
                "form-action 'self'; "
                "frame-ancestors 'none';")
        else:
            return (
                "default-src 'self'; "
                "script-src 'self' 'unsafe-inline' https://js.stripe.com; "
                "style-src 'self' 'unsafe-inline'; "
                "img-src 'self' data: https://*.stripe.com; "
                "connect-src 'self' https://api.stripe.com; "
                "font-src 'self' data:; "
                "object-src 'none'; "
                "base-uri 'self'; "
                "form-action 'self'; "
                "frame-ancestors 'none'; "
                "upgrade-insecure-requests;"
            )

    async def dispatch(
            self,
            request: Request,
            call_next: Callable) -> Response:
        """Add security headers to response."""
        response = await call_next(request)

        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Content-Security-Policy"] = self.csp_policy

        if os.getenv("ENVIRONMENT") == "production":
            response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains; preload"

        response.headers["Permissions-Policy"] = (
            "geolocation=(), "
            "microphone=(), "
            "camera=(), "
            "payment=(), "
            "usb=(), "
            "magnetometer=(), "
            "gyroscope=(), "
            "speaker=()"
        )

        response.headers["X-Permitted-Cross-Domain-Policies"] = "none"
        response.headers["Cross-Origin-Embedder-Policy"] = "require-corp"
        response.headers["Cross-Origin-Opener-Policy"] = "same-origin"
        response.headers["Cross-Origin-Resource-Policy"] = "same-origin"

        if any(
            path in request.url.path for path in [
                "/api/auth",
                "/api/payments",
                "/api/reports"]):
            response.headers["Cache-Control"] = "no-store, no-cache, must-revalidate, private"
            response.headers["Pragma"] = "no-cache"
            response.headers["Expires"] = "0"

        return response


class HTTPSRedirectMiddleware(BaseHTTPMiddleware):
    """Middleware to redirect HTTP to HTTPS in production."""

    async def dispatch(
            self,
            request: Request,
            call_next: Callable) -> Response:
        """Redirect HTTP to HTTPS in production."""
        if (os.getenv("ENVIRONMENT") == "production"
                and request.url.scheme == "http"
                and request.url.hostname not in ["localhost", "127.0.0.1"]):
            https_url = request.url.replace(scheme="https")
            return Response(
                status_code=301,
                headers={"Location": str(https_url)}
            )

        return await call_next(request)


def configure_security_middleware(app: FastAPI):
    """Configure all security middleware for the FastAPI app."""

    app.add_middleware(HTTPSRedirectMiddleware)

    app.add_middleware(SecurityHeadersMiddleware)

    trusted_hosts = ["localhost", "127.0.0.1"]
    if os.getenv("ALLOWED_HOSTS"):
        trusted_hosts.extend(os.getenv("ALLOWED_HOSTS").split(","))

    from fastapi.middleware.trustedhost import TrustedHostMiddleware
    app.add_middleware(TrustedHostMiddleware, allowed_hosts=trusted_hosts)


def get_security_config() -> dict:
    """Get security configuration for the application."""
    return {
        "environment": os.getenv("ENVIRONMENT", "development"),
        "https_only": os.getenv("HTTPS_ONLY", "false").lower() == "true",
        "allowed_hosts": os.getenv("ALLOWED_HOSTS", "localhost,127.0.0.1").split(","),
        "session_timeout": int(os.getenv("SESSION_TIMEOUT", "3600")),  # 1 hour
        "max_login_attempts": int(os.getenv("MAX_LOGIN_ATTEMPTS", "5")),
        # 15 minutes
        "lockout_duration": int(os.getenv("LOCKOUT_DURATION", "900")),
        "password_min_length": int(os.getenv("PASSWORD_MIN_LENGTH", "8")),
        "require_mfa": os.getenv("REQUIRE_MFA", "false").lower() == "true",
    }


def validate_password_strength(password: str) -> tuple[bool, list[str]]:
    """Validate password strength and return issues."""
    issues = []
    config = get_security_config()

    if len(password) < config["password_min_length"]:
        issues.append(
            f"Password must be at least {config['password_min_length']} characters long")

    if not any(c.isupper() for c in password):
        issues.append("Password must contain at least one uppercase letter")

    if not any(c.islower() for c in password):
        issues.append("Password must contain at least one lowercase letter")

    if not any(c.isdigit() for c in password):
        issues.append("Password must contain at least one number")

    if not any(c in "!@#$%^&*()_+-=[]{}|;:,.<>?" for c in password):
        issues.append("Password must contain at least one special character")

    weak_passwords = [
        "password", "123456", "password123", "admin", "qwerty",
        "letmein", "welcome", "monkey", "dragon", "master"
    ]

    if password.lower() in weak_passwords:
        issues.append("Password is too common and easily guessable")

    return len(issues) == 0, issues


def sanitize_input(input_string: str) -> str:
    """Sanitize user input to prevent injection attacks."""
    import html
    import re

    sanitized = html.escape(input_string)

    sanitized = re.sub(r'[<>"\']', '', sanitized)

    if len(sanitized) > 1000:
        sanitized = sanitized[:1000]

    return sanitized.strip()


def validate_file_upload(filename: str, content_type: str,
                         file_size: int) -> tuple[bool, str]:
    """Validate file uploads for security."""
    allowed_types = {
        "text/csv": [".csv"],
        "application/vnd.ms-excel": [".xls"],
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
        "application/pdf": [".pdf"],
        "image/jpeg": [".jpg", ".jpeg"],
        "image/png": [".png"],
        "image/gif": [".gif"]
    }

    if content_type not in allowed_types:
        return False, f"File type {content_type} is not allowed"

    import os
    file_ext = os.path.splitext(filename.lower())[1]
    if file_ext not in allowed_types[content_type]:
        return False, f"File extension {file_ext} does not match content type {content_type}"

    max_size = 10 * 1024 * 1024  # 10MB
    if file_size > max_size:
        return False, f"File size {file_size} exceeds maximum allowed size of {max_size} bytes"

    dangerous_patterns = [
        r'\.\./',
        r'\.\.\\',
        r'[<>:"|?*]',
        r'^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])$']

    for pattern in dangerous_patterns:
        if re.search(pattern, filename, re.IGNORECASE):
            return False, "Filename contains dangerous characters or patterns"

    return True, "File is valid"
