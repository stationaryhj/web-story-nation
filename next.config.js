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
    unoptimized: true,
  },
  async rewrites() {
    return [
      {
        source: '/nakama/:path*',
        destination: 'http://qauschat.storynation.io:443/:path*',
      },
      {
        source: '/callback',
        destination: '/oauth-callback.html',
      },
    ];
  },
  turbopack: {},
  compiler: {
    removeConsole:
      process.env.NODE_ENV === 'production'
        ? {
            exclude: ['error'],
          }
        : false,
  },
};

module.exports = nextConfig;
