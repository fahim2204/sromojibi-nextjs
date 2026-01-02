
import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://ezcalc.xyz';
  const currentDate = new Date();
  
  // Define your static routes here
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
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: currentDate,
    changeFrequency: 'weekly',
    priority: route === '' ? 1 : 0.8,
  }));
}
