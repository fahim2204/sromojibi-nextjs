import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://sromojibi.com';

  const routes = [
    '',
    '/workers',
    '/categories',
    '/locations',
    '/about',
    '/join-worker',
    '/workers/dhaka',
    '/workers/mymensingh',
    '/workers/electrician',
    '/workers/plumber',
    '/workers/rajmistri',
    '/workers/tiles-worker',
    '/workers/painter',
    '/workers/carpenter',
    '/workers/ac-technician',
    '/workers/cctv-installer',
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' ? 'daily' : 'weekly',
    priority: route === '' ? 1.0 : 0.8,
  }));
}
