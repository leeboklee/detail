import { Suspense } from 'react';
import Link from 'next/link';

// 정적 메타데이터로 SEO 최적화
export const metadata = {
  title: '관리자 대시보드',
  description: '시스템 관리 및 모니터링',
};

// 로딩 스피너 컴포넌트
function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <span className="ml-2 text-gray-600">로딩 중...</span>
    </div>
  );
}

// 서버 상태 카드 컴포넌트
function ServerStatusCard() {
  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <h3 className="text-lg font-semibold text-green-800 mb-2">
        🚀 서버 상태
      </h3>
      <p className="text-green-600">✅ 정상 실행 중</p>
      <p className="text-sm text-green-500 mt-1">포트: 3900</p>
      <p className="text-xs text-green-400 mt-1">응답시간: &lt;100ms</p>
    </div>
  );
}

// Windows 서비스 카드 컴포넌트
function WindowsServiceCard() {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <h3 className="text-lg font-semibold text-blue-800 mb-2">
        🪟 Windows 서비스
      </h3>
      <p className="text-blue-600">✅ DetailApp 서비스 실행 중</p>
      <p className="text-sm text-blue-500 mt-1">im kill 방지 활성화</p>
      <p className="text-xs text-blue-400 mt-1">자동 재시작: 활성</p>
    </div>
  );
}

// API 상태 카드 컴포넌트
function ApiStatusCard() {
  return (
    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <h3 className="text-lg font-semibold text-purple-800 mb-2">
        🔌 API 상태
      </h3>
      <p className="text-purple-600">✅ 모든 API 정상</p>
      <p className="text-sm text-purple-500 mt-1">헬스체크: /api/health</p>
      <p className="text-xs text-purple-400 mt-1">평균 응답: 50ms</p>
    </div>
  );
}

// 빠른 링크 컴포넌트
function QuickLinks() {
  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        ⚡ 빠른 링크
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Link 
          href="/" 
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105 text-center"
        >
          🏠 메인 페이지
        </Link>
        <Link 
          href="/dashboard" 
          className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105 text-center"
        >
          📊 API 대시보드
        </Link>
        <Link 
          href="/api/health" 
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105 text-center"
        >
          💚 헬스체크
        </Link>
        <Link 
          href="/api/hotels" 
          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105 text-center"
        >
          🏨 호텔 API
        </Link>
      </div>
    </div>
  );
}

// 시스템 정보 컴포넌트
function SystemInfo() {
  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        💻 시스템 정보
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-medium text-gray-900 mb-2">서버 정보</h3>
          <div className="space-y-1 text-sm text-gray-600">
            <p>• 프레임워크: Next.js 14.2.5</p>
            <p>• 포트: 3900</p>
            <p>• 환경: Development</p>
            <p>• 메모리: 최적화됨</p>
          </div>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-medium text-gray-900 mb-2">데이터베이스</h3>
          <div className="space-y-1 text-sm text-gray-600">
            <p>• 타입: PostgreSQL 16</p>
            <p>• 호스트: localhost:5432</p>
            <p>• 상태: 연결됨</p>
            <p>• 성능: 최적화됨</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* 헤더 */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">⚡ 관리자 대시보드</h1>
              <p className="mt-2 text-gray-600">고성능 시스템 관리 및 모니터링</p>
            </div>
            <div className="flex space-x-4">
              <Link 
                href="/"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                🏠 메인으로
              </Link>
              <Link 
                href="/dashboard"
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                📊 대시보드
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow-lg rounded-lg p-6">
          {/* 상태 카드들 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <Suspense fallback={<LoadingSpinner />}>
              <ServerStatusCard />
            </Suspense>
            <Suspense fallback={<LoadingSpinner />}>
              <WindowsServiceCard />
            </Suspense>
            <Suspense fallback={<LoadingSpinner />}>
              <ApiStatusCard />
            </Suspense>
          </div>

          {/* 빠른 링크 */}
          <Suspense fallback={<LoadingSpinner />}>
            <QuickLinks />
          </Suspense>

          {/* 시스템 정보 */}
          <Suspense fallback={<LoadingSpinner />}>
            <SystemInfo />
          </Suspense>
        </div>
      </div>
    </div>
  );
} 