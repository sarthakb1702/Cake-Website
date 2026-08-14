import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/__/auth/:path*",
        destination: "https://cake-website-c1463.firebaseapp.com/__/auth/:path*",
      },
    ];
  },
};

export default nextConfig;
