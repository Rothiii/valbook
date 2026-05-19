import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  typedRoutes: false,
  reactCompiler: true,
  images: {
    remotePatterns: [],
  },
};

export default nextConfig;
