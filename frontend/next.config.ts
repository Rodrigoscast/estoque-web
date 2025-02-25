import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ['localhost'], // Permite carregar imagens de localhost
  },
  // Outras configurações...
};

export default nextConfig;
