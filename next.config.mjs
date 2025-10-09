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
  webpack: (config) => {
    config.resolve = config.resolve || {}
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      "react-toastify": path.resolve(process.cwd(), "lib/shims/react-toastify.ts"),
    }
    return config
  },
};

import path from "node:path"

export default nextConfig;
