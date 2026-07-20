/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.supabase.co' },
      { protocol: 'https', hostname: 'rencontres-premium.fr' },
    ],
    formats: ['image/avif', 'image/webp'],
  },
}

module.exports = nextConfig
