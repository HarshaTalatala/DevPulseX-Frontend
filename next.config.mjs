import path from 'path';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api',
  },
  // Ensure Next.js treats the frontend folder as the workspace root when multiple lockfiles exist
  outputFileTracingRoot: process.cwd(),
};

export default nextConfig;
