import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */

  // Optimize package imports for Motion and Lucide React
  experimental: {
    optimizePackageImports: ['motion/react', 'motion', 'lucide-react'],
  },

  // Optimize images
  images: {
    formats: ['image/avif', 'image/webp'],
  },

  // Compiler options for tree-shaking
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },
};

export default nextConfig;
