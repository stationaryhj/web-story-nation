/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'universestationery.s3.amazonaws.com',
      's3.amazonaws.com',
      'en.universestationery.imgs',
      's3.us-east-1.amazonaws.com',
      'universestationery-en.s3.us-east-1.amazonaws.com',
    ],
  },
  async rewrites() {
    return [
      {
        source: '/nakama/:path*',
        destination: 'http://qauschat.storynation.io:443/:path*'
      },
      {
        source: '/callback',
        destination: '/oauth-callback.html'
      }
    ]
  }
}

module.exports = nextConfig 