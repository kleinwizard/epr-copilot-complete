import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

export const errorRate = new Rate('errors');

export const options = {
  stages: [
    { duration: '2m', target: 50 }, // Ramp up to 50 users
    { duration: '5m', target: 100 }, // Stay at 100 users
    { duration: '2m', target: 200 }, // Ramp up to 200 users
    { duration: '5m', target: 200 }, // Stay at 200 users
    { duration: '2m', target: 0 }, // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<250'], // 95% of requests must complete below 250ms
    http_req_failed: ['rate<0.1'], // Error rate must be below 10%
    errors: ['rate<0.1'], // Custom error rate must be below 10%
  },
};

const BASE_URL = 'http://localhost:8001';

export default function () {
  let healthResponse = http.get(`${BASE_URL}/health`);
  check(healthResponse, {
    'health check status is 200': (r) => r.status === 200,
    'health check response time < 100ms': (r) => r.timings.duration < 100,
  }) || errorRate.add(1);

  sleep(1);

  let apiResponse = http.get(`${BASE_URL}/api/v1/companies`, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  check(apiResponse, {
    'API status is 200 or 401': (r) => r.status === 200 || r.status === 401, // 401 is expected without auth
    'API response time < 250ms': (r) => r.timings.duration < 250,
  }) || errorRate.add(1);

  sleep(1);

  let frontendResponse = http.get('http://localhost:8080/');
  check(frontendResponse, {
    'frontend status is 200': (r) => r.status === 200,
    'frontend response time < 500ms': (r) => r.timings.duration < 500,
    'frontend contains expected content': (r) => r.body.includes('EPR'),
  }) || errorRate.add(1);

  sleep(1);
}

export function handleSummary(data) {
  return {
    'performance-report.json': JSON.stringify(data, null, 2),
    'performance-report.html': htmlReport(data),
  };
}

function htmlReport(data) {
  return `
<!DOCTYPE html>
<html>
<head>
    <title>K6 Performance Test Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .metric { margin: 10px 0; padding: 10px; background: #f5f5f5; border-radius: 5px; }
        .pass { border-left: 5px solid #4CAF50; }
        .fail { border-left: 5px solid #f44336; }
        .summary { background: #e3f2fd; padding: 20px; border-radius: 5px; margin: 20px 0; }
    </style>
</head>
<body>
    <h1>EPR-Copilot Performance Test Report</h1>
    <div class="summary">
        <h2>Test Summary</h2>
        <p><strong>Total Requests:</strong> ${data.metrics.http_reqs.count}</p>
        <p><strong>Failed Requests:</strong> ${data.metrics.http_req_failed.count}</p>
        <p><strong>Average Response Time:</strong> ${data.metrics.http_req_duration.avg.toFixed(2)}ms</p>
        <p><strong>95th Percentile:</strong> ${data.metrics.http_req_duration['p(95)'].toFixed(2)}ms</p>
        <p><strong>Test Duration:</strong> ${(data.state.testRunDurationMs / 1000).toFixed(2)}s</p>
    </div>
    
    <h2>Thresholds</h2>
    ${Object.entries(data.thresholds).map(([name, threshold]) => `
        <div class="metric ${threshold.ok ? 'pass' : 'fail'}">
            <strong>${name}:</strong> ${threshold.ok ? 'PASS' : 'FAIL'}
        </div>
    `).join('')}
    
    <h2>Detailed Metrics</h2>
    ${Object.entries(data.metrics).map(([name, metric]) => `
        <div class="metric">
            <strong>${name}:</strong> 
            Count: ${metric.count || 'N/A'}, 
            Average: ${metric.avg ? metric.avg.toFixed(2) : 'N/A'}, 
            Min: ${metric.min ? metric.min.toFixed(2) : 'N/A'}, 
            Max: ${metric.max ? metric.max.toFixed(2) : 'N/A'}
        </div>
    `).join('')}
</body>
</html>
  `;
}
