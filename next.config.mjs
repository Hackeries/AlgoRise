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
    unoptimized: true,
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
