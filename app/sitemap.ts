import { MetadataRoute } from 'next';
import { blogPosts } from '@/lib/blogPosts';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://sromojibi.com';

  const routes = [
    '',
    '/workers',
    '/categories',
    '/locations',
    '/about',
    '/join-worker',
    '/contact',
    '/terms',
    '/privacy-policy',
    '/blogs',
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

  const staticEntries: MetadataRoute.Sitemap = routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' ? 'daily' : 'weekly',
    priority: route === '' ? 1.0 : 0.8,
  }));

  const blogEntries: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: `${baseUrl}/blogs/${post.slug}`,
    lastModified: new Date(post.updatedAt || post.publishedAt),
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  return [...staticEntries, ...blogEntries];
}
