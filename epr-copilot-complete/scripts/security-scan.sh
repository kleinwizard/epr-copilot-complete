#!/bin/bash


set -e

echo "🔒 EPR-Sentinel Security Scan Starting..."
echo "=========================================="

mkdir -p security-reports
cd "$(dirname "$0")/.."

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

TOTAL_ISSUES=0
HIGH_CRITICAL_ISSUES=0

echo -e "\n📊 Running Python Security Scan (Bandit)..."
echo "============================================"

if [ -d "backend" ]; then
    cd backend
    
    if ! poetry run python -c "import bandit" 2>/dev/null; then
        echo "Installing Bandit..."
        poetry run pip install bandit[toml]
    fi
    
    echo "Scanning Python code for security issues..."
    poetry run bandit -r epr_backend/ -f json -o ../security-reports/bandit-report.json || true
    poetry run bandit -r epr_backend/ -f txt -o ../security-reports/bandit-report.txt || true
    
    if [ -f "../security-reports/bandit-report.json" ]; then
        BANDIT_ISSUES=$(python3 -c "
import json
try:
    with open('../security-reports/bandit-report.json', 'r') as f:
        data = json.load(f)
    total = len(data.get('results', []))
    high_critical = len([r for r in data.get('results', []) if r.get('issue_severity') in ['HIGH', 'CRITICAL']])
    print(f'{total},{high_critical}')
except:
    print('0,0')
        ")
        BANDIT_TOTAL=$(echo $BANDIT_ISSUES | cut -d',' -f1)
        BANDIT_HIGH=$(echo $BANDIT_ISSUES | cut -d',' -f2)
        
        TOTAL_ISSUES=$((TOTAL_ISSUES + BANDIT_TOTAL))
        HIGH_CRITICAL_ISSUES=$((HIGH_CRITICAL_ISSUES + BANDIT_HIGH))
        
        if [ "$BANDIT_HIGH" -gt 0 ]; then
            echo -e "${RED}❌ Found $BANDIT_HIGH high/critical Python security issues${NC}"
        else
            echo -e "${GREEN}✅ No high/critical Python security issues found${NC}"
        fi
        echo "   Total Python issues: $BANDIT_TOTAL"
    fi
    
    cd ..
else
    echo -e "${YELLOW}⚠️  Backend directory not found, skipping Python scan${NC}"
fi

echo -e "\n📦 Running Node.js Security Scan (npm audit)..."
echo "==============================================="

if [ -d "frontend" ]; then
    cd frontend
    
    echo "Scanning Node.js dependencies for vulnerabilities..."
    npm audit --json > ../security-reports/npm-audit.json 2>/dev/null || true
    npm audit > ../security-reports/npm-audit.txt 2>/dev/null || true
    
    if [ -f "../security-reports/npm-audit.json" ]; then
        NPM_ISSUES=$(node -e "
try {
    const data = JSON.parse(require('fs').readFileSync('../security-reports/npm-audit.json', 'utf8'));
    const vulnerabilities = data.vulnerabilities || {};
    let total = 0;
    let highCritical = 0;
    
    Object.values(vulnerabilities).forEach(vuln => {
        if (vuln.severity) {
            total++;
            if (vuln.severity === 'high' || vuln.severity === 'critical') {
                highCritical++;
            }
        }
    });
    
    console.log(\`\${total},\${highCritical}\`);
} catch (e) {
    console.log('0,0');
}
        ")
        NPM_TOTAL=$(echo $NPM_ISSUES | cut -d',' -f1)
        NPM_HIGH=$(echo $NPM_ISSUES | cut -d',' -f2)
        
        TOTAL_ISSUES=$((TOTAL_ISSUES + NPM_TOTAL))
        HIGH_CRITICAL_ISSUES=$((HIGH_CRITICAL_ISSUES + NPM_HIGH))
        
        if [ "$NPM_HIGH" -gt 0 ]; then
            echo -e "${RED}❌ Found $NPM_HIGH high/critical Node.js vulnerabilities${NC}"
        else
            echo -e "${GREEN}✅ No high/critical Node.js vulnerabilities found${NC}"
        fi
        echo "   Total Node.js vulnerabilities: $NPM_TOTAL"
    fi
    
    cd ..
else
    echo -e "${YELLOW}⚠️  Frontend directory not found, skipping Node.js scan${NC}"
fi

echo -e "\n🔍 Running Container Security Scan (Trivy)..."
echo "============================================="

if ! command -v trivy &> /dev/null; then
    echo "Installing Trivy..."
    sudo apt-get update
    sudo apt-get install wget apt-transport-https gnupg lsb-release -y
    wget -qO - https://aquasecurity.github.io/trivy-repo/deb/public.key | sudo apt-key add -
    echo "deb https://aquasecurity.github.io/trivy-repo/deb $(lsb_release -sc) main" | sudo tee -a /etc/apt/sources.list.d/trivy.list
    sudo apt-get update
    sudo apt-get install trivy -y
fi

echo "Scanning filesystem for vulnerabilities..."
trivy fs --format json --output security-reports/trivy-fs.json . || true
trivy fs --format table --output security-reports/trivy-fs.txt . || true

if [ -f "backend/Dockerfile" ]; then
    echo "Building and scanning backend Docker image..."
    docker build -t epr-backend-security-scan backend/ || true
    trivy image --format json --output security-reports/trivy-backend.json epr-backend-security-scan || true
    trivy image --format table --output security-reports/trivy-backend.txt epr-backend-security-scan || true
fi

if [ -f "frontend/Dockerfile" ]; then
    echo "Building and scanning frontend Docker image..."
    docker build -t epr-frontend-security-scan frontend/ || true
    trivy image --format json --output security-reports/trivy-frontend.json epr-frontend-security-scan || true
    trivy image --format table --output security-reports/trivy-frontend.txt epr-frontend-security-scan || true
fi

if [ -f "security-reports/trivy-fs.json" ]; then
    TRIVY_ISSUES=$(python3 -c "
import json
try:
    with open('security-reports/trivy-fs.json', 'r') as f:
        data = json.load(f)
    
    total = 0
    high_critical = 0
    
    for result in data.get('Results', []):
        for vuln in result.get('Vulnerabilities', []):
            total += 1
            if vuln.get('Severity') in ['HIGH', 'CRITICAL']:
                high_critical += 1
    
    print(f'{total},{high_critical}')
except:
    print('0,0')
    ")
    TRIVY_TOTAL=$(echo $TRIVY_ISSUES | cut -d',' -f1)
    TRIVY_HIGH=$(echo $TRIVY_ISSUES | cut -d',' -f2)
    
    TOTAL_ISSUES=$((TOTAL_ISSUES + TRIVY_TOTAL))
    HIGH_CRITICAL_ISSUES=$((HIGH_CRITICAL_ISSUES + TRIVY_HIGH))
    
    if [ "$TRIVY_HIGH" -gt 0 ]; then
        echo -e "${RED}❌ Found $TRIVY_HIGH high/critical container vulnerabilities${NC}"
    else
        echo -e "${GREEN}✅ No high/critical container vulnerabilities found${NC}"
    fi
    echo "   Total container vulnerabilities: $TRIVY_TOTAL"
fi

echo -e "\n📋 Generating Security Summary Report..."
echo "========================================"

cat > security-reports/security-summary.md << EOF

**Scan Date:** $(date)
**Total Issues Found:** $TOTAL_ISSUES
**High/Critical Issues:** $HIGH_CRITICAL_ISSUES


- Total Issues: ${BANDIT_TOTAL:-0}
- High/Critical: ${BANDIT_HIGH:-0}
- Report: [bandit-report.txt](bandit-report.txt)

- Total Vulnerabilities: ${NPM_TOTAL:-0}
- High/Critical: ${NPM_HIGH:-0}
- Report: [npm-audit.txt](npm-audit.txt)

- Total Vulnerabilities: ${TRIVY_TOTAL:-0}
- High/Critical: ${TRIVY_HIGH:-0}
- Report: [trivy-fs.txt](trivy-fs.txt)


EOF

if [ "$HIGH_CRITICAL_ISSUES" -eq 0 ]; then
    echo "✅ **PASS** - No high or critical security issues found" >> security-reports/security-summary.md
    echo -e "\n${GREEN}🎉 SECURITY SCAN PASSED${NC}"
    echo -e "${GREEN}✅ No high/critical security issues found${NC}"
    EXIT_CODE=0
else
    echo "❌ **FAIL** - $HIGH_CRITICAL_ISSUES high/critical security issues found" >> security-reports/security-summary.md
    echo -e "\n${RED}🚨 SECURITY SCAN FAILED${NC}"
    echo -e "${RED}❌ Found $HIGH_CRITICAL_ISSUES high/critical security issues${NC}"
    EXIT_CODE=1
fi

echo -e "\n📁 Security reports saved to: security-reports/"
echo "   - security-summary.md (this summary)"
echo "   - bandit-report.txt (Python security)"
echo "   - npm-audit.txt (Node.js security)"
echo "   - trivy-fs.txt (Container security)"

echo -e "\n🔒 Security scan completed!"

exit $EXIT_CODE
