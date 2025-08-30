/** @type {import('next').NextConfig} */
const nextConfig = {
  // 컴파일러 최적화
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // Turbopack 설정 (Next.js 15에서 안정화됨)
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
    // WSL2 성능 최적화
    resolveAlias: {
      '@': '.',
    },
  },
  
  // 실험적 기능 (WSL2 성능 최적화)
  experimental: {
    optimizeCss: false, // WSL2에서는 비활성화
    ppr: false,
  },
  
  // 개발 속도 최적화
  images: { unoptimized: true },
  compress: false,
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  
  // React StrictMode 비활성화 (1인 개발자용)
  reactStrictMode: false,
  
  // 웹팩 최적화 (WSL2 성능 최적화)
  webpack: (config, { dev, isServer }) => {
    // 개발 모드에서만 적용되는 최적화
    if (dev) {
      // WSL2 성능 최적화
      config.devtool = false;
      
      // 메모리 기반 캐시 (WSL2 성능 향상)
      config.cache = {
        type: 'memory',
        maxGenerations: 1,
      };
      
      // 모듈 해석 최적화
      config.resolve.extensions = ['.js', '.jsx', '.ts', '.tsx'];
      config.resolve.modules = ['node_modules'];
      
      // WSL2 성능 향상
      config.optimization = {
        ...config.optimization,
        removeAvailableModules: false,
        removeEmptyChunks: false,
        splitChunks: false,
      };
      
      // 불필요한 플러그인 제거
      config.plugins = config.plugins.filter(plugin => 
        plugin.constructor.name !== 'ForkTsCheckerWebpackPlugin'
      );
    }
    
    return config;
  },
  
  // 개발 서버 최적화 (1인 개발자용)
  devIndicators: {
    position: 'bottom-right',
  },
  
  // 파일 시스템 최적화
  onDemandEntries: {
    maxInactiveAge: 10 * 1000, // 10초로 단축
    pagesBufferLength: 1, // 버퍼 크기 최소화
  },
  
  // 성능 최적화
  poweredByHeader: false,
  generateEtags: false,
};

module.exports = nextConfig
