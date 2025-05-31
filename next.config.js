/** @type {import('next').NextConfig} */
const nextConfig = {
  /* Ensure pages are properly served */
  useFileSystemPublicRoutes: true,

  /* Disable strict mode to prevent double-mounting issues in production */
  reactStrictMode: false,

  /* Basic image configuration */
  images: {
    domains: ['localhost'],
  },

  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;
