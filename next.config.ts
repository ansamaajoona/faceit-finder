import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'assets.faceit-cdn.net',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'distribution.faceit-cdn.net',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'steamcdn-a.akamaihd.net',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'flagcdn.com',
        pathname: '/**',
      }
    ],
  },
  basePath: '/faceitfinder',
};

export default nextConfig;
