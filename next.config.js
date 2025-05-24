/** @type {import('next').NextConfig} */
const nextConfig = {
  /* Ensure pages are properly served */
  useFileSystemPublicRoutes: true,

  /* Disable strict mode to prevent double-mounting issues in production */
  reactStrictMode: false,

  eslint: {
    ignoreDuringBuilds: true, // ✅ Ignore ESLint errors during Netlify builds
  },
  typescript: {
    ignoreBuildErrors: true, // ✅ Ignore TypeScript errors during Netlify builds
  },
};

module.exports = nextConfig;
