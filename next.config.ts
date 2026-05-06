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
    NEXT_PUBLIC_GOOGLE_BOOKS_API_KEY:
      process.env.NEXT_PUBLIC_GOOGLE_BOOKS_API_KEY,
  },
};

export default nextConfig;
