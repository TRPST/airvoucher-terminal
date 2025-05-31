/**
 * Utilities for handling subdomain-based routing
 */

// Valid portal types
export type PortalType = 'admin' | 'retailer' | 'cashier' | 'agent';

// List of valid portal types
export const VALID_PORTALS: PortalType[] = ['admin', 'retailer', 'cashier', 'agent'];

/**
 * Extract the subdomain from a hostname
 * @param hostname - The full hostname (e.g., admin.example.com)
 * @returns The subdomain or null if on the main domain
 */
export function getSubdomain(hostname: string): string | null {
  // Handle all possible localhost formats
  if (hostname.includes('localhost')) {
    // Check if this is a subdomain of localhost
    const parts = hostname.split('.');
    if (parts.length >= 2 && parts[0] !== 'localhost') {
      return parts[0];
    }
    return null;
  }

  // Production domain handling
  const parts = hostname.split('.');
  if (parts.length > 2) {
    return parts[0];
  }
  
  // No subdomain (e.g., example.com)
  return null;
}

/**
 * Check if a subdomain corresponds to a valid portal
 * @param subdomain - The subdomain to check
 * @returns True if the subdomain is a valid portal
 */
export function isValidPortal(subdomain: string | null): subdomain is PortalType {
  if (!subdomain) return false;
  return VALID_PORTALS.includes(subdomain as PortalType);
}

/**
 * Get the current portal from the hostname
 * @param hostname - The full hostname
 * @returns The portal type or null if not on a portal subdomain
 */
export function getCurrentPortal(hostname: string): PortalType | null {
  const subdomain = getSubdomain(hostname);
  if (isValidPortal(subdomain)) {
    return subdomain;
  }
  return null;
}

/**
 * Get URL for a specific portal
 * @param portal - The portal type
 * @param path - Optional path to append
 * @returns Full URL for the specified portal
 */
export function getPortalUrl(portal: PortalType, path = ''): string {
  // Environment-agnostic approach - works in both dev and production
  if (typeof window !== 'undefined') {
    const currentUrl = new URL(window.location.href);
    const isLocalhost = currentUrl.hostname.includes('localhost');
    
    if (isLocalhost) {
      // For localhost, keep the port but change the subdomain
      currentUrl.hostname = `${portal}.localhost`;
      currentUrl.pathname = path;
      return currentUrl.toString();
    } else {
      // For production, use the configured base domain
      const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN || 
                        currentUrl.hostname.split('.').slice(-2).join('.');
      
      currentUrl.hostname = `${portal}.${baseDomain}`;
      currentUrl.pathname = path;
      return currentUrl.toString();
    }
  }
  
  // Fallback for server-side (though this should be used client-side only)
  const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN || 'example.com';
  return `https://${portal}.${baseDomain}${path}`;
}

/**
 * Redirect to the appropriate portal
 * @param portal - The portal to redirect to
 * @param path - Optional path to append
 */
export function redirectToPortal(portal: PortalType, path = ''): void {
  if (typeof window !== 'undefined') {
    window.location.href = getPortalUrl(portal, path);
  }
} 