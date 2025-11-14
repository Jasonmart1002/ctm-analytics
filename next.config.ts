import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Increase body size limit for CSV uploads (default is 10MB)
    // This allows uploads up to 100MB
    serverActions: {
      bodySizeLimit: '100mb'
    },
    // Configure proxy body size limit for API routes (Next.js 16+)
    proxyClientMaxBodySize: 104857600 // 100MB in bytes (100 * 1024 * 1024)
  }
};

export default nextConfig;
