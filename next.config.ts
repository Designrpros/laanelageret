/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true, // Ensures React best practices
  images: {
    domains: ["firebasestorage.googleapis.com"], // Allows Firebase-hosted images
  },
};

module.exports = nextConfig;
