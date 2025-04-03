/** @type {import('next').NextConfig} */
const nextConfig = {
  compiler: {
    styledComponents: true,
  },
  reactStrictMode: true, // Ensures React best practices
  images: {
    domains: ["firebasestorage.googleapis.com"], // Allows Firebase-hosted images
  },
  output: "export", // Enable static export
};

module.exports = nextConfig;