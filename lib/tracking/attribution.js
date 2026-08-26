// Parses and stores UTM parameters and other attribution data from URL
export function captureAttribution() {
  if (typeof window === 'undefined') return null;

  const urlParams = new URLSearchParams(window.location.search);
  const existingAttribution = JSON.parse(sessionStorage.getItem('attribution') || '{}');

  // Only capture first-touch attribution for this session
  // If we already have it in sessionStorage, we don't overwrite unless we want to track last-touch too
  // The prompt specified "Use first-touch attribution"
  
  if (Object.keys(existingAttribution).length > 0) {
    return existingAttribution;
  }

  const attribution = {
    utm_source: urlParams.get('utm_source') || null,
    utm_medium: urlParams.get('utm_medium') || null,
    utm_campaign: urlParams.get('utm_campaign') || null,
    utm_content: urlParams.get('utm_content') || null,
    utm_term: urlParams.get('utm_term') || null,
    fbclid: urlParams.get('fbclid') || null,
    referrer: document.referrer || null,
    landing_page: window.location.pathname + window.location.search,
  };

  sessionStorage.setItem('attribution', JSON.stringify(attribution));
  return attribution;
}

export function getAttribution() {
  if (typeof window === 'undefined') return {};
  return JSON.parse(sessionStorage.getItem('attribution') || '{}');
}
