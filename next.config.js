/** @type {import('next').NextConfig} */
const nextConfig = {
  // 기본 설정만 유지
  images: { unoptimized: true },
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  reactStrictMode: false,
  poweredByHeader: false,
  generateEtags: false,
};

module.exports = nextConfig;