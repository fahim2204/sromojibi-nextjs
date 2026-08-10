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

export default nextConfig;
