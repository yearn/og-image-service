/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    // Ensure edge runtime support for og image routes
    optimizePackageImports: [],
  },
}

module.exports = nextConfig
