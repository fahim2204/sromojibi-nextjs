
export async function GET() {
  const baseUrl = 'https://ezcalc.xyz';
  const currentDate = new Date().toISOString().split('T')[0];

  const routes = [
    '',
    '/about',
    '/contact',
    '/privacy-policy',
    '/terms',
    '/age-calculator',
    '/bmi-calculator',
    '/gold-price-calculator',
    '/land-calculator',
    '/loan-calculator',
    '/mortgage-calculator',
    '/percentage-calculator',
    '/tip-calculator',
    '/gold-weight-converter',
  ];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${routes
    .map((route) => {
      return `
  <url>
    <loc>${baseUrl}${route}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${route === '' ? '1.0' : '0.8'}</priority>
  </url>`;
    })
    .join('')}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate',
    },
  });
}
