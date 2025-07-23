/** @type {import('next').NextConfig} */
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig = {
  // React 설정
  reactStrictMode: process.env.NODE_ENV === 'production',
  
  // 이미지 최적화 (테스트/개발 환경 최소화)
  images: {
    remotePatterns: process.env.NODE_ENV === 'production' ? [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: ' {process.env.PORT || 34343}',
      },
    ] : [],
    formats: process.env.NODE_ENV === 'production' ? ['image/webp', 'image/avif'] : [],
    minimumCacheTTL: process.env.NODE_ENV === 'production' ? 60 : 1,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    unoptimized: process.env.NODE_ENV !== 'production',
  },
  
  // 컴파일러 설정
  compiler: {
    styledComponents: true,
    removeConsole: process.env.NODE_ENV === 'production' 
      ? { exclude: ['error', 'warn'] } 
      : false,
  },
  
  // 서버 설정
  poweredByHeader: false,
  
  // 압축 설정
  compress: true,
  
  // 보안 헤더
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY'
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
          }
        ],
      },
    ];
  },
  
  // Webpack 설정
  webpack: (config, { isServer, dev, webpack }) => {
    // 경로 alias 설정
    config.resolve.alias['@'] = require('path').resolve(__dirname);
    config.resolve.alias['@shared'] = require('path').resolve(__dirname, 'src/shared');
    
    // HTML 파일 처리
    config.module.rules.push({
      test: /\.html$/,
      use: 'raw-loader',
    });

    // 개발 모드 최적화
    if (dev) {
      // devtool 완전 비활성화(컴파일 속도 최적화)
      config.devtool = false;
      // 파일 감시 최적화: 테스트/백업/이미지 폴더 제외
      config.watchOptions = {
        ignored: [
          '**/node_modules/**',
          '**/.git/**',
          '**/.next/**',
          '**/dist/**',
          '**/coverage/**',
          '**/logs/**',
          '**/test-results/**',
          '**/playwright-report/**',
          '**/backup/**',
          '**/debug/**',
          '**/data/**',
          '**/test-archive/**',
          '**/screenshots-archive/**',
          '**/debug-archive-old/**',
          '**/screenshots/**',
          '**/videos/**',
          '**/*.png',
          '**/*.jpg',
          '**/*.jpeg',
          '**/*.gif',
        ],
        aggregateTimeout: 300,
        poll: false,
      };
      // 필요 없는 플러그인 제거(예: Monaco)
      config.plugins = config.plugins.filter(
        (plugin) => !plugin.constructor.name.includes('Monaco')
      );
      // SSR hydration 오류 방지: React 18 strict mode 비활성화
      config.resolve.alias['react-dom$'] = 'react-dom';
    }

    // 프로덕션 모드 최적화
    if (!dev) {
      // 트리 쉐이킹 최적화
      config.optimization.usedExports = true;
      config.optimization.sideEffects = false;
    }

    // 클라이언트 사이드 fallback 설정
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        os: false,
        module: false,
        dns: false,
        net: false,
        tls: false,
        child_process: false,
      };
    }

    // 메모리 사용량 최적화
    config.infrastructureLogging = {
      level: 'error',
    };

    return config;
  },
  
  // 빌드 ID 생성
  generateBuildId: async () => {
    if (process.env.NODE_ENV === 'production') {
      return `hotel-manager-${process.env.npm_package_version || '1.0.0'}-${Date.now()}`;
    }
    return 'development';
  },
  
  // 출력 설정
  output: 'standalone',
  
  // 환경 변수
  env: {
    CUSTOM_KEY: process.env.NODE_ENV,
  },
  
  // 빌드 캐시 최적화(실험적)
  experimental: {
    incrementalCache: true,
  },
};

module.exports = withBundleAnalyzer(nextConfig); 
