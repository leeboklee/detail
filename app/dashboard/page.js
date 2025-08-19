'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Dashboard() {
  const [endpoints, setEndpoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    // 프로젝트의 모든 API 엔드포인트 정보
    const apiEndpoints = [
      {
        path: '/api/health',
        method: 'GET',
        description: '서버 상태 확인',
        category: 'System',
        color: 'bg-green-500',
        status: 'active'
      },
      {
        path: '/api/hotels',
        method: 'GET',
        description: '호텔 목록 조회',
        category: 'Hotel',
        color: 'bg-blue-500',
        status: 'active'
      },
      {
        path: '/api/hotels/[id]',
        method: 'GET',
        description: '특정 호텔 정보 조회',
        category: 'Hotel',
        color: 'bg-blue-500',
        status: 'active'
      },
      {
        path: '/api/hotels/[id]/duplicate',
        method: 'POST',
        description: '호텔 복제',
        category: 'Hotel',
        color: 'bg-blue-500',
        status: 'active'
      },
      {
        path: '/api/hotels/[id]/export',
        method: 'GET',
        description: '호텔 정보 내보내기',
        category: 'Hotel',
        color: 'bg-blue-500',
        status: 'active'
      },
      {
        path: '/api/rooms',
        method: 'GET',
        description: '객실 목록 조회',
        category: 'Room',
        color: 'bg-purple-500',
        status: 'active'
      },
      {
        path: '/api/rooms/save',
        method: 'POST',
        description: '객실 정보 저장',
        category: 'Room',
        color: 'bg-purple-500',
        status: 'active'
      },
      {
        path: '/api/packages',
        method: 'GET',
        description: '패키지 목록 조회',
        category: 'Package',
        color: 'bg-orange-500',
        status: 'active'
      },
      {
        path: '/api/packages/save',
        method: 'POST',
        description: '패키지 정보 저장',
        category: 'Package',
        color: 'bg-orange-500',
        status: 'active'
      },
      {
        path: '/api/notices',
        method: 'GET',
        description: '공지사항 목록 조회',
        category: 'Notice',
        color: 'bg-red-500',
        status: 'active'
      },
      {
        path: '/api/notices/save',
        method: 'POST',
        description: '공지사항 저장',
        category: 'Notice',
        color: 'bg-red-500',
        status: 'active'
      },
      {
        path: '/api/price',
        method: 'GET',
        description: '가격 정보 조회',
        category: 'Price',
        color: 'bg-yellow-500',
        status: 'active'
      },
      {
        path: '/api/price-templates',
        method: 'GET',
        description: '가격 템플릿 조회',
        category: 'Price',
        color: 'bg-yellow-500',
        status: 'active'
      },
      {
        path: '/api/bookingInfo',
        method: 'GET',
        description: '예약 정보 조회',
        category: 'Booking',
        color: 'bg-indigo-500',
        status: 'active'
      },
      {
        path: '/api/cancel',
        method: 'POST',
        description: '예약 취소',
        category: 'Booking',
        color: 'bg-indigo-500',
        status: 'active'
      },
      {
        path: '/api/checkin',
        method: 'GET',
        description: '체크인 정보',
        category: 'Checkin',
        color: 'bg-teal-500',
        status: 'active'
      },
      {
        path: '/api/charges',
        method: 'GET',
        description: '추가 요금 정보',
        category: 'Charges',
        color: 'bg-pink-500',
        status: 'active'
      },
      {
        path: '/api/facilities',
        method: 'GET',
        description: '시설 정보',
        category: 'Facilities',
        color: 'bg-cyan-500',
        status: 'active'
      },
      {
        path: '/api/init-db',
        method: 'POST',
        description: '데이터베이스 초기화',
        category: 'System',
        color: 'bg-green-500',
        status: 'active'
      },
      {
        path: '/api/switch-database',
        method: 'POST',
        description: '데이터베이스 전환',
        category: 'System',
        color: 'bg-green-500',
        status: 'active'
      },
      {
        path: '/api/saveSession',
        method: 'POST',
        description: '세션 저장',
        category: 'System',
        color: 'bg-green-500',
        status: 'active'
      },
      {
        path: '/api/log-error',
        method: 'POST',
        description: '에러 로그 기록',
        category: 'System',
        color: 'bg-green-500',
        status: 'active'
      },
      {
        path: '/api/log-receiver',
        method: 'POST',
        description: '로그 수신',
        category: 'System',
        color: 'bg-green-500',
        status: 'active'
      },
      {
        path: '/api/client-log',
        method: 'POST',
        description: '클라이언트 로그',
        category: 'System',
        color: 'bg-green-500',
        status: 'active'
      },
      {
        path: '/api/generate',
        method: 'POST',
        description: 'HTML 생성',
        category: 'System',
        color: 'bg-green-500',
        status: 'active'
      },
      {
        path: '/api/test-dashboard',
        method: 'GET',
        description: '테스트 대시보드',
        category: 'Test',
        color: 'bg-gray-500',
        status: 'active'
      },
      {
        path: '/api/test-error',
        method: 'GET',
        description: '에러 테스트',
        category: 'Test',
        color: 'bg-gray-500',
        status: 'active'
      },
      {
        path: '/api/test-prisma-error',
        method: 'GET',
        description: 'Prisma 에러 테스트',
        category: 'Test',
        color: 'bg-gray-500',
        status: 'active'
      },
      {
        path: '/api/debug-env',
        method: 'GET',
        description: '환경 변수 디버그',
        category: 'Debug',
        color: 'bg-gray-500',
        status: 'active'
      }
    ];

    setEndpoints(apiEndpoints);
    setLoading(false);
  }, []);

  const categories = [...new Set(endpoints.map(endpoint => endpoint.category))];
  const filteredEndpoints = selectedCategory === 'all' 
    ? endpoints 
    : endpoints.filter(endpoint => endpoint.category === selectedCategory);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">대시보드 로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">API 대시보드</h1>
              <p className="mt-2 text-gray-600">연결된 모든 API 엔드포인트 현황</p>
            </div>
            <div className="flex space-x-4">
              <Link 
                href="/"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                메인으로
              </Link>
              <Link 
                href="/admin"
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                관리자
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 통계 카드 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100">
                <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">총 API</p>
                <p className="text-2xl font-semibold text-gray-900">{endpoints.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100">
                <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">카테고리</p>
                <p className="text-2xl font-semibold text-gray-900">{categories.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100">
                <svg className="h-8 w-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">GET 메서드</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {endpoints.filter(e => e.method === 'GET').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-orange-100">
                <svg className="h-8 w-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">POST 메서드</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {endpoints.filter(e => e.method === 'POST').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 카테고리 필터 */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-700">카테고리 필터:</span>
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              전체 ({endpoints.length})
            </button>
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category} ({endpoints.filter(e => e.category === category).length})
              </button>
            ))}
          </div>
        </div>

        {/* 페이지 엔드포인트 */}
        <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">페이지 엔드포인트</h2>
            <p className="text-sm text-gray-600 mt-1">사용자 접근 가능한 페이지들</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    경로
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    설명
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    상태
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    작업
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <code className="text-sm bg-blue-100 px-2 py-1 rounded font-mono text-blue-800">
                      /
                    </code>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      메인 페이지 - 호텔 정보 편집 및 미리보기
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      활성
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => window.open('http://localhost:3900/', '_blank')}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1 rounded transition-colors"
                      >
                        이동
                      </button>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText('http://localhost:3900/');
                          alert('URL이 클립보드에 복사되었습니다!');
                        }}
                        className="bg-gray-600 hover:bg-gray-700 text-white text-xs px-3 py-1 rounded transition-colors"
                        title="URL 복사"
                      >
                        📋
                      </button>
                    </div>
                  </td>
                </tr>
                <tr className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <code className="text-sm bg-purple-100 px-2 py-1 rounded font-mono text-purple-800">
                      /dashboard
                    </code>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      API 대시보드 - 모든 엔드포인트 현황 및 테스트
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      활성
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => window.open('http://localhost:3900/dashboard', '_blank')}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1 rounded transition-colors"
                      >
                        이동
                      </button>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText('http://localhost:3900/dashboard');
                          alert('URL이 클립보드에 복사되었습니다!');
                        }}
                        className="bg-gray-600 hover:bg-gray-700 text-white text-xs px-3 py-1 rounded transition-colors"
                        title="URL 복사"
                      >
                        📋
                      </button>
                    </div>
                  </td>
                </tr>
                <tr className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <code className="text-sm bg-orange-100 px-2 py-1 rounded font-mono text-orange-800">
                      /admin
                    </code>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      관리자 페이지 - 시스템 관리 및 설정
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      활성
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => window.open('http://localhost:3900/admin', '_blank')}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1 rounded transition-colors"
                      >
                        이동
                      </button>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText('http://localhost:3900/admin');
                          alert('URL이 클립보드에 복사되었습니다!');
                        }}
                        className="bg-gray-600 hover:bg-gray-700 text-white text-xs px-3 py-1 rounded transition-colors"
                        title="URL 복사"
                      >
                        📋
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* API 엔드포인트 테이블 */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              {selectedCategory === 'all' ? '전체 API 엔드포인트' : `${selectedCategory} API 엔드포인트`}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              총 {filteredEndpoints.length}개의 API
            </p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    메서드
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    경로
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    설명
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    카테고리
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    상태
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    작업
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredEndpoints.map((endpoint, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white ${endpoint.color}`}>
                        {endpoint.method}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <code className="text-sm bg-gray-100 px-2 py-1 rounded font-mono">
                        {endpoint.path}
                      </code>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs">
                        {endpoint.description}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {endpoint.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {endpoint.status === 'active' ? '활성' : '비활성'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            const url = `http://localhost:3900${endpoint.path}`;
                            if (endpoint.method === 'GET') {
                              window.open(url, '_blank');
                            } else {
                              alert(`${endpoint.method} 요청은 테스트 페이지에서 확인하세요.`);
                            }
                          }}
                          className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1 rounded transition-colors"
                        >
                          {endpoint.method === 'GET' ? '테스트' : '상세보기'}
                        </button>
                        
                        <button
                          onClick={() => {
                            const url = `http://localhost:3900${endpoint.path}`;
                            navigator.clipboard.writeText(url);
                            alert('URL이 클립보드에 복사되었습니다!');
                          }}
                          className="bg-gray-600 hover:bg-gray-700 text-white text-xs px-3 py-1 rounded transition-colors"
                          title="URL 복사"
                        >
                          📋
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 시스템 정보 */}
        <div className="bg-white rounded-lg shadow p-6 mt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">시스템 정보</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">데이터베이스</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p>• 타입: PostgreSQL 16</p>
                <p>• 호스트: localhost:5432</p>
                <p>• 데이터베이스: detailpage_local</p>
                <p>• 상태: 연결됨</p>
              </div>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-2">서버</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p>• 프레임워크: Next.js 14.2.5</p>
                <p>• 포트: 3900</p>
                <p>• 환경: Development</p>
                <p>• ORM: Prisma</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
