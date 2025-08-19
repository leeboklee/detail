/** @type {import('next').NextConfig} */
const isDev = process.env.NODE_ENV !== 'production'

const nextConfig = {
  // 컴파일링 속도 최적화
  swcMinify: true,
  // 개발 모드에서 컴파일 속도 최적화
  ...(isDev && {
    // 빠른 컴파일을 위한 설정
    experimental: {
      // 터보팩 활성화 (빠른 컴파일)
      turbo: {
        rules: {
          '*.svg': {
            loaders: ['@svgr/webpack'],
            as: '*.js',
          },
        },
      },
      // 번들 분석 비활성화
      bundlePagesExternals: false,
      // 메모리 최적화
      optimizePackageImports: [
        '@heroui/react',
        'framer-motion',
        'lodash',
        'date-fns',
        'react-icons',
      ],
      // 컴파일 캐시 최적화
      incrementalCacheHandlerPath: require.resolve('./cache-handler.js'),
      // 개발 속도 최적화
      optimizeCss: true,
      forceSwcTransforms: true,
      // 추가 최적화
      serverComponentsExternalPackages: ['@heroui/react'],
      // 빠른 컴파일
      swcTraceProfiling: false,
      // 메모리 제한
      memoryBasedWorkers: true,
      // 빠른 새로고침
      ppr: false,
      // 컴파일 최적화
      optimizePackageImports: ['@heroui/react'],
    },
  }),
  // 웹팩 최적화
  webpack: (config, { dev, isServer }) => {
    if (dev) {
      // 개발 모드에서 캐시 활성화 (속도 향상)
      config.cache = {
        type: 'filesystem',
        buildDependencies: {
          config: [__filename],
        },
        cacheDirectory: '.next/cache/webpack',
        maxAge: 172800000, // 2일
        // 캐시 최적화
        compression: 'gzip',
        hashAlgorithm: 'xxhash64',
      };
      
      // 소스맵 최적화 (빠른 컴파일)
      config.devtool = 'eval';
      
      // 추가 최적화
      config.watchOptions = {
        poll: false,
        ignored: ['**/node_modules', '**/.git', '**/.next', '**/logs', '**/test-results'],
        aggregateTimeout: 200,
        poll: 1000,
      };
      
      // 메모리 최적화
      config.optimization = {
        ...config.optimization,
        removeAvailableModules: false,
        removeEmptyChunks: false,
        splitChunks: false,
        // 개발 모드에서 최적화 비활성화
        minimize: false,
        concatenateModules: false,
      };
      
      // 대형 라이브러리의 optional deps를 제외하여 리빌드 간섭 최소화
      config.resolve = config.resolve || {};
      config.resolve.fallback = {
        ...(config.resolve.fallback || {}),
        fs: false,
        path: false,
        os: false,
        crypto: false,
      };
      
      // 모듈 해결 최적화
      config.resolve.modules = ['node_modules'];
      config.resolve.extensions = ['.js', '.jsx', '.ts', '.tsx'];
      
      // 로더 최적화
      config.module.rules.forEach(rule => {
        if (rule.test && rule.test.toString().includes('svg')) {
          rule.use = ['@svgr/webpack'];
        }
      });
    }
    
    // 불필요한 모듈 제외
    config.externals = config.externals || [];
    if (!isServer) {
      config.externals.push({
        'utf-8-validate': 'commonjs utf-8-validate',
        'bufferutil': 'commonjs bufferutil',
      });
    }
    
    // 프로덕션 모드에서만 청크 분할
    if (!dev) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
              priority: 10,
            },
          },
        },
      };
    }
    
    return config;
  },
  // 이미지 최적화 비활성화 (개발 속도 향상)
  images: {
    unoptimized: true,
  },
  // 타입스크립트 체크 비활성화 (개발 속도 향상)
  typescript: {
    ignoreBuildErrors: true,
  },
  // ESLint 체크 비활성화 (개발 속도 향상)
  eslint: {
    ignoreDuringBuilds: true,
  },
  // 개발 중 브라우저 캐시 무효화(자동 반영), 정적 파일은 장기 캐시 유지
  async headers() {
    const headers = []
    if (isDev) {
      headers.push({
        source: '/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-store, must-revalidate' },
          { key: 'Pragma', value: 'no-cache' },
          { key: 'Expires', value: '0' },
        ],
      })
    }
    // 정적 리소스는 캐시 유지 (개발/운영 공통)
    headers.push({
      source: '/_next/static/:path*',
      headers: [
        { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
      ],
    })
    return headers
  },
  // 개발 모드에서 컴파일 속도 최적화
  ...(isDev && {
    // 빠른 컴파일을 위한 설정
    experimental: {
      // 터보팩 활성화
      turbo: true,
      // 빠른 새로고침
      optimizePackageImports: ['@heroui/react'],
    },
  }),
};

module.exports = nextConfig;
