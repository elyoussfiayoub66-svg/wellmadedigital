// Generates a unique visitor ID
export function generateVisitorId() {
  return 'vid_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
}

// Retrieves or creates a visitor ID in localStorage
export function getOrCreateVisitorId() {
  if (typeof window === 'undefined') return null;
  
  let visitorId = localStorage.getItem('visitor_id');
  if (!visitorId) {
    visitorId = generateVisitorId();
    localStorage.setItem('visitor_id', visitorId);
  }
  return visitorId;
}

// Retrieves the visitor ID if it exists
export function getVisitorId() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('visitor_id');
}
