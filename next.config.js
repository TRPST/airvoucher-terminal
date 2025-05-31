/** @type {import('next').NextConfig} */
const nextConfig = {
  /* Ensure pages are properly served */
  useFileSystemPublicRoutes: true,

  /* Disable strict mode to prevent double-mounting issues in production */
  reactStrictMode: false,

  /* Enable domain and subdomain awareness */
  images: {
    domains: ['localhost'],
  },

  /* Custom hostname mapping for development and production */
  async rewrites() {
    return [
      // Handle subdomain routing for auth pages
      {
        source: '/auth',
        has: [
          {
            type: 'host',
            value: 'admin.:hostname*',
          },
        ],
        destination: '/portal/admin/auth',
      },
      {
        source: '/auth',
        has: [
          {
            type: 'host',
            value: 'retailer.:hostname*',
          },
        ],
        destination: '/portal/retailer/auth',
      },
      {
        source: '/auth',
        has: [
          {
            type: 'host',
            value: 'cashier.:hostname*',
          },
        ],
        destination: '/portal/cashier/auth',
      },
      {
        source: '/auth',
        has: [
          {
            type: 'host',
            value: 'agent.:hostname*',
          },
        ],
        destination: '/portal/agent/auth',
      },
      
      // Handle root paths for subdomains
      {
        source: '/',
        has: [
          {
            type: 'host',
            value: 'admin.:hostname*',
          },
        ],
        destination: '/portal/admin/dashboard',
      },
      {
        source: '/',
        has: [
          {
            type: 'host',
            value: 'retailer.:hostname*',
          },
        ],
        destination: '/portal/retailer/dashboard',
      },
      {
        source: '/',
        has: [
          {
            type: 'host',
            value: 'cashier.:hostname*',
          },
        ],
        destination: '/portal/cashier/dashboard',
      },
      {
        source: '/',
        has: [
          {
            type: 'host',
            value: 'agent.:hostname*',
          },
        ],
        destination: '/portal/agent/dashboard',
      },
    ];
  },

  eslint: {
    ignoreDuringBuilds: true, // ✅ Ignore ESLint errors during Netlify builds
  },
  typescript: {
    ignoreBuildErrors: true, // ✅ Ignore TypeScript errors during Netlify builds
  },
};

module.exports = nextConfig;
