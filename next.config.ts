import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "books.google.com",
      },
    ],
  },
  env: {
    GOOGLE_BOOKS_API_KEY: process.env.GOOGLE_BOOKS_API_KEY,
  },
};

export default nextConfig;
