/** @type {import('next').NextConfig} */
const nextConfig = {
  /* Ensure pages are properly served */
  useFileSystemPublicRoutes: true,

  /* Prefer Pages Router */
  reactStrictMode: true,
};

module.exports = nextConfig;
