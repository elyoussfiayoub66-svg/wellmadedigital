import http from 'k6/http';
import { check, sleep } from 'k6';

// 1. Configure the load test stages
export const options = {
  stages: [
    // Ramp up traffic from 1 to 50 users over 30 seconds
    { duration: '30s', target: 50 },
    // Stay at 50 users for 1 minute
    { duration: '1m', target: 50 },
    // Ramp down to 0 users over 30 seconds
    { duration: '30s', target: 0 },
  ],
  // Optional thresholds to fail the test if metrics drop below these targets
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests must complete below 500ms
    http_req_failed: ['rate<0.01'],   // Error rate must be less than 1%
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export default function () {
  // --- Step 1: User visits the homepage ---
  let res = http.get(`${BASE_URL}/`);
  check(res, {
    'homepage loaded': (r) => r.status === 200,
  });
  
  // Simulate user reading the homepage
  sleep(Math.random() * 2 + 1); // 1 to 3 seconds pause

  // --- Step 2: User clicks "Book a Call" ---
  res = http.get(`${BASE_URL}/book`);
  check(res, {
    'booking page loaded': (r) => r.status === 200,
  });

  // Simulate user filling out the first step of the booking form
  sleep(Math.random() * 3 + 2); // 2 to 5 seconds pause

  // --- Step 3: API Request to check availability ---
  // We use a dummy UUID and today's date to simulate the calendar API call. 
  // This tests both Next.js and your Supabase database connection.
  const today = new Date().toISOString().split('T')[0];
  const dummyUUID = '00000000-0000-0000-0000-000000000000'; 
  
  res = http.get(`${BASE_URL}/api/availability?date=${today}&assignee_id=${dummyUUID}`);
  check(res, {
    'availability API returned 200': (r) => r.status === 200,
  });

  // Simulate user thinking before picking a time slot
  sleep(Math.random() * 2 + 1); 
}
