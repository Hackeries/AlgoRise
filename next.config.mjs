import path from 'node:path';

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    // Enable Next/Image optimizations for performance and AVIF/WebP output
    unoptimized: false,
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60 * 60 * 24, // 1 day
    dangerouslyAllowSVG: true, // we use inline SVG icons/logos
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      { protocol: 'https', hostname: 'www.myalgorise.in' },
      { protocol: 'https', hostname: 'myalgorise.in' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
    ],
  },
  webpack: config => {
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      'react-toastify': path.resolve(
        process.cwd(),
        'lib/shims/react-toastify.ts'
      ),
    };
    return config;
  },
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [
          { type: 'host', value: 'myalgorise.in' }, // redirect if user visits non-www
        ],
        destination: 'https://www.myalgorise.in/:path*',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
