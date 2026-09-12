/** @type {import('next').NextConfig} */
const nextConfig = {
  compress: true,
  poweredByHeader: false,
  images: {
    formats: ['image/avif', 'image/webp'],
    unoptimized: true,
  },
  trailingSlash: false,
};

// Trigger restart to reload Prisma client types
export default nextConfig;
