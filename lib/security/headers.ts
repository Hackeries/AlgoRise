// Security headers configuration
export const SECURITY_HEADERS = {
  // Prevent MIME type sniffing
  "X-Content-Type-Options": "nosniff",

  // Prevent clickjacking
  "X-Frame-Options": "SAMEORIGIN",

  // Enable XSS protection
  "X-XSS-Protection": "1; mode=block",

  // Control referrer information
  "Referrer-Policy": "strict-origin-when-cross-origin",

  // Restrict browser features
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",

  // Content Security Policy
  "Content-Security-Policy":
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://api.codeforces.com https://codeforces.com",

  // Enforce HTTPS
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
} as const

export const CACHE_HEADERS = {
  // Cache static assets for 1 year
  static: "public, max-age=31536000, immutable",

  // Cache HTML for 1 hour
  html: "public, max-age=3600, must-revalidate",

  // Don't cache API responses
  api: "no-store, no-cache, must-revalidate, proxy-revalidate",

  // Cache user-specific data for 5 minutes
  user: "private, max-age=300, must-revalidate",
} as const
