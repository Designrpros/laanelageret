/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true, // Ensures React best practices
  swcMinify: true, // Improves build performance
  images: {
    domains: ["firebasestorage.googleapis.com"], // Allows Firebase-hosted images
  },
};

module.exports = nextConfig;
