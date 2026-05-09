import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    dangerouslyAllowSVG: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.dicebear.com',
      },
    ],
    localPatterns: [
      { pathname: '/uploads/**' },
      { pathname: '/api/uploads/**' },
      { pathname: '/avatars/**' },
    ],
  },
  output: "standalone",
};

export default nextConfig;
