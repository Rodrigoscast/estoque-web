import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ['localhost', `${process.env.NEXT_PUBLIC_NGROK_HOST}`],
    unoptimized: true,
  },
};

export default nextConfig;
