# EPR Co-Pilot Phase 3 Pipeline Hardening - BACKLOG

## Prioritized Issues from CI Validation

| Severity | Item | Evidence |
|----------|------|----------|
| **Urgent** | ✅ Docker Compose build failure - FIXED | Corrected nested monorepo paths in docker-compose.yml |
| **Urgent** | ✅ Frontend server startup - FIXED | Switched to Python HTTP server, now serving on localhost:8080 |
| **Urgent** | Backend security vulnerabilities (5 critical) | python-jose CVE-2024-33664, CVE-2024-33663; pip PVE-2025-75180; ecdsa CVE-2024-23342, PVE-2024-64396 |
| **Urgent** | Frontend security vulnerabilities (5 moderate/low) | npm audit shows @babel/runtime, brace-expansion, esbuild, nanoid issues |
| **High** | Missing lighthouse npm script | `npm run lighthouse` command not found |
| **High** | Lighthouse CI configuration needs testing | lighthouserc.json targets ≥90 scores not verified |
| **High** | Performance audit script needs backend running | performance-test.sh requires active backend |
| **Medium** | k6 load test needs verification | k6-load-test.js targets p95 < 400ms, error < 0.1% not tested |
| **Medium** | Bandit security scan shows 5 real issues | MD5 usage (HIGH), try-except-pass patterns (LOW), hardcoded /tmp (MEDIUM) |
| **Low** | Docker compose version warning | `version` attribute is obsolete |

## Status - UPDATED AFTER COMPREHENSIVE CI VALIDATION
- **Backend tests**: ✅ 29 tests passing
- **Frontend tests**: ✅ 7 tests passing  
- **Docker services**: ✅ All 6 services running (backend:8000, frontend:8080)
- **Security scans**: ❌ 26 total vulnerabilities found (5 safety + 5 bandit + 16 npm audit)
- **Lighthouse performance**: ❌ Chrome connection failures (environment issue)
- **K6 load testing**: ⏳ Running with URLSearchParams compatibility errors
