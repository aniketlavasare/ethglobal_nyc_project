import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false, // Disable strict mode to prevent double initialization in development
  experimental: {
    optimizePackageImports: ['@wagmi/core', '@wagmi/connectors', 'wagmi'],
  },
  webpack: (config, { dev, isServer }) => {
    // Optimize for development
    if (dev && !isServer) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      }
    }
    
    return config
  },
};

export default nextConfig;
