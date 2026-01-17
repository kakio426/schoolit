import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://backend-production-1598.up.railway.app/api/:path*',
      },
      {
        source: '/socket.io/:path*',
        destination: 'https://backend-production-1598.up.railway.app/socket.io/:path*',
      },
    ];
  },
};

export default nextConfig;
