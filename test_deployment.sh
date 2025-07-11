#!/bin/bash

echo "🔍 Testing EPR Co-Pilot Deployment..."
echo "===================================="

echo -n "Backend Health: "
curl -s http://127.0.0.1:8000/health | grep -q "healthy" && echo "✅ OK" || echo "❌ FAIL"

echo -n "API Docs: "
curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:8000/docs | grep -q "200" && echo "✅ OK" || echo "❌ FAIL"

echo -n "Database: "
cd epr-copilot-complete/backend/epr_backend
if sqlite3 epr_copilot.db "SELECT COUNT(*) FROM products;" >/dev/null 2>&1; then
    echo "✅ OK"
else
    echo "❌ FAIL"
fi

echo -n "Category Column: "
sqlite3 epr_copilot.db "PRAGMA table_info(products);" | grep -q "category" && echo "✅ OK" || echo "❌ MISSING"

echo ""
echo "If all checks pass, your deployment should be working!"
