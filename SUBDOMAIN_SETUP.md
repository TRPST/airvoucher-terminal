# Subdomain Routing Setup Guide

This guide explains how to set up and test the subdomain-based routing system for AirVoucher portals.

## Overview

The AirVoucher application now uses subdomain-based routing for different portal types:

- **Admin Portal**: admin.yourdomain.com/auth
- **Retailer Portal**: retailer.yourdomain.com/auth
- **Cashier Portal**: cashier.yourdomain.com/auth
- **Agent Portal**: agent.yourdomain.com/auth

## Local Development Setup

### 1. Edit Hosts File

To test subdomains locally, you need to modify your hosts file to map your local subdomains to 127.0.0.1.

#### On macOS/Linux:

```bash
sudo nano /etc/hosts
```

Add the following lines:

```
127.0.0.1   localhost
127.0.0.1   admin.localhost
127.0.0.1   retailer.localhost
127.0.0.1   cashier.localhost
127.0.0.1   agent.localhost
```

Save and exit (Ctrl+O, Enter, Ctrl+X).

#### On Windows:

Edit `C:\Windows\System32\drivers\etc\hosts` as Administrator and add similar lines.

### 2. Environment Configuration

Create or update your `.env.local` file with:

```
# Base domain for subdomain routing
NEXT_PUBLIC_BASE_DOMAIN=localhost:3000
```

### 3. Start Development Server

```bash
npm run dev
```

### 4. Access Portals

You can now access the different portals at:

- Admin: http://admin.localhost:3000/auth
- Retailer: http://retailer.localhost:3000/auth
- Cashier: http://cashier.localhost:3000/auth
- Agent: http://agent.localhost:3000/auth

## Production Setup

For production deployment, you'll need to:

1. Configure DNS records for each subdomain
2. Set the `NEXT_PUBLIC_BASE_DOMAIN` environment variable to your base domain
3. Ensure your SSL certificate covers all subdomains (use a wildcard certificate)

## Troubleshooting

### Common Issues

1. **Subdomains not working locally**: Make sure your hosts file is saved correctly and you're using the proper URL format including port (e.g., admin.localhost:3000)

2. **CORS issues**: If experiencing CORS issues with subdomains, ensure your backend is configured to accept requests from all your subdomains

3. **Redirect loops**: Check your middleware implementation if you experience redirect loops

## Architecture Details

The subdomain routing works through:

1. **Next.js Middleware** - Detects the current subdomain and routes to the appropriate portal components
2. **Rewrites Configuration** - Maps subdomain requests to the correct internal routes
3. **Subdomain Utilities** - Helper functions for subdomain detection and URL generation 