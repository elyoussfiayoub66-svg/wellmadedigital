import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '10s', target: 50 }, // Ramp up to 50 users over 10 seconds
    { duration: '20s', target: 150 }, // Ramp up to 150 users over 20 seconds
    { duration: '20s', target: 150 }, // Stay at 150 users for 20 seconds
    { duration: '10s', target: 0 },  // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests must complete below 500ms
    http_req_failed: ['rate<0.01'],   // Error rate must be less than 1%
  },
};

const BASE_URL = 'http://localhost:3000';

export default function () {
  // 1. Load the main landing page
  const resHome = http.get(`${BASE_URL}/`);
  check(resHome, {
    'home is status 200': (r) => r.status === 200,
  });

  // 2. Load the agencies landing page
  const resAgencies = http.get(`${BASE_URL}/car-agencies`);
  check(resAgencies, {
    'agencies is status 200': (r) => r.status === 200,
  });

  // 3. Test API Availability Endpoint
  // Let's test a realistic date like tomorrow
  const dateStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const resApi = http.get(`${BASE_URL}/api/availability?date=${dateStr}`);
  check(resApi, {
    'api is status 200': (r) => r.status === 200,
  });

  // Add a short sleep to simulate user reading time between requests
  sleep(1);
}
