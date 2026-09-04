export default function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'; // BLOCKED: Needs actual production URL in environment variables

  const routes = [
    '',
    '/services',
    '/who-we-help',
    '/process',
    '/work',
    '/contact',
    '/book'
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'weekly',
    priority: route === '' ? 1 : 0.8,
  }));

  return routes;
}
