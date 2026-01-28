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
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin-allow-popups',
          },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/nakama/:path*',
        destination: 'http://qauschat.storynation.io:443/:path*',
      },
    ];
  },
  // production 빌드에서 console.* 출력 제거
  webpack: (config, { isServer, dev }) => {
    // 개발 환경이 아닌 경우 적용 (클라이언트 및 서버 모두)
    if (!dev) {
      // Terser 플러그인 설정 (클라이언트 빌드)
      if (!isServer) {
        // 기존 TerserPlugin 설정 가져오기
        config.optimization.minimizer.forEach((minimizer) => {
          if (minimizer.constructor.name === 'TerserPlugin') {
            // console.* 출력 제거 설정
            minimizer.options.terserOptions.compress.drop_console = true;
            minimizer.options.terserOptions.compress.pure_funcs = [
              'console.log',
              'console.info',
              'console.debug',
              'console.warn',
              'console.error',
              'console.table',
            ];
          }
        });
      }
    }
    return config;
  },
  // SWC 컴파일러 옵션 (Next.js 12 이상)
  swcMinify: true,
  compiler: {
    removeConsole:
      process.env.NODE_ENV === 'production'
        ? {
            exclude: ['error'], // error는 유지 (선택사항)
          }
        : false,
  },
};

module.exports = nextConfig;
