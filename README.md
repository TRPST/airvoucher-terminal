# AirVoucher

This is a [Next.js](https://nextjs.org) project for a voucher management system with multiple portal interfaces.

## Subdomain-Based Portals

AirVoucher now uses subdomain-based routing for different portal types:

- **Admin Portal**: admin.yourdomain.com/auth
- **Retailer Portal**: retailer.yourdomain.com/auth
- **Cashier Portal**: cashier.yourdomain.com/auth
- **Agent Portal**: agent.yourdomain.com/auth

See [SUBDOMAIN_SETUP.md](./SUBDOMAIN_SETUP.md) for detailed setup instructions for local development and production.

## Getting Started

First, set up your environment:

1. Copy the `.env.sample` file to `.env.local` and set up your environment variables
2. Configure your hosts file for subdomain testing (see SUBDOMAIN_SETUP.md)

Then, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open one of the following URLs in your browser:
- Admin portal: [http://admin.localhost:3000/auth](http://admin.localhost:3000/auth)
- Retailer portal: [http://retailer.localhost:3000/auth](http://retailer.localhost:3000/auth)
- Cashier portal: [http://cashier.localhost:3000/auth](http://cashier.localhost:3000/auth)
- Agent portal: [http://agent.localhost:3000/auth](http://agent.localhost:3000/auth)

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Deployment

For production deployment, you'll need to:

1. Configure DNS records for each subdomain
2. Set the `NEXT_PUBLIC_BASE_DOMAIN` environment variable to your base domain
3. Ensure your SSL certificate covers all subdomains (use a wildcard certificate)
