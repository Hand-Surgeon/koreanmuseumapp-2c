// Conditionally import bundle analyzer only when ANALYZE is true
const withBundleAnalyzer = process.env.ANALYZE === 'true' 
  ? (await import('@next/bundle-analyzer')).default({
      enabled: true,
    })
  : (config) => config;

/** @type {import('next').NextConfig} */

const ContentSecurityPolicy = `
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval' *.google-analytics.com *.googletagmanager.com;
  style-src 'self' 'unsafe-inline';
  img-src 'self' blob: data: https: *.placeholder.com res.cloudinary.com *.imgix.net;
  font-src 'self';
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  connect-src 'self' ws: wss:;
  upgrade-insecure-requests;
`

const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin'
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()'
  },
  {
    key: 'Content-Security-Policy',
    value: ContentSecurityPolicy.replace(/\s{2,}/g, ' ').trim()
  }
]

const nextConfig = {
  eslint: {
    ignoreDuringBuilds: false,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  allowedDevOrigins: [
    '*.replit.dev',
    '*.repl.co',
    'localhost:3000'
  ],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
      // Cloudinary
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      // Imgix (will be dynamically set based on env variable)
      {
        protocol: 'https',
        hostname: process.env.NEXT_PUBLIC_IMGIX_DOMAIN || 'example.imgix.net',
      },
      // Custom CDN (will be dynamically set based on env variable)
      {
        protocol: 'https',
        hostname: process.env.NEXT_PUBLIC_IMAGE_CDN_URL?.replace(/^https?:\/\//, '').split('/')[0] || 'cdn.example.com',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ]
  },
  poweredByHeader: false,
}

export default withBundleAnalyzer(nextConfig)
