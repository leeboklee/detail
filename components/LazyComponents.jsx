import React, { Suspense, useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useAppContext } from './AppContext.Context';

// 로딩 스피너 컴포넌트
const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-8">
    <div className="spinner"></div>
    <span className="ml-2 text-gray-600">로딩 중...</span>
  </div>
);

// 동적 컴포넌트들 - 기본 방식으로 단순화
const LazyHotelInfo = dynamic(
  () => import('./hotel/HotelInfo'),
  {
    loading: () => <LoadingSpinner />,
    ssr: false
  }
);

const LazyRoomInfo = dynamic(
  () => import('./room/RoomInfoEditor'),
  {
    loading: () => <LoadingSpinner />,
    ssr: false
  }
);

const LazyPriceTable = dynamic(
  () => import('./price/PriceTable'),
  {
    loading: () => <LoadingSpinner />,
    ssr: false
  }
);

const LazyPackage = dynamic(
  () => import('./package/Package'),
  {
    loading: () => <LoadingSpinner />,
    ssr: false
  }
);

const LazyCancelPolicy = dynamic(
  () => import('./cancel/CancelPolicy'),
  {
    loading: () => <LoadingSpinner />,
    ssr: false
  }
);

const LazyBookingInfo = dynamic(
  () => import('./booking/BookingInfo'),
  {
    loading: () => <LoadingSpinner />,
    ssr: false
  }
);

const LazyNotice = dynamic(
  () => import('./notice/Notice'),
  {
    loading: () => <LoadingSpinner />,
    ssr: false
  }
);

const LazyCheckInOutInfo = dynamic(
  () => import('./checkin/CheckInOutInfo'),
  {
    loading: () => <LoadingSpinner />,
    ssr: false
  }
);

const LazyPeriodInfo = dynamic(
  () => import('./period/PeriodInfo'),
  {
    loading: () => <LoadingSpinner />,
    ssr: false
  }
);

// 메인 LazyComponents 컴포넌트
export default function LazyComponents() {
  const { hotelInfo, setHotelInfo, sections, isHydrated } = useAppContext();
  const [activeTab, setActiveTab] = useState(null);

  const handleHotelUpdate = (name, value) => {
    console.log('호텔 정보 업데이트:', name, value);
    setHotelInfo(name, value);
  };

  // 하이드레이션 완료 후 첫 번째 활성 탭 설정
  useEffect(() => {
    if (isHydrated && sections && sections.length > 0) {
      const firstVisibleTab = sections.find((section) => section.visible);
      if (firstVisibleTab) {
        setActiveTab(firstVisibleTab.id);
      }
    }
  }, [isHydrated, sections]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
  };

  // 하이드레이션 중이거나 섹션이 없는 경우 처리
  if (!isHydrated) {
    return <div className="w-full p-4 text-center text-gray-500">로딩 중...</div>;
  }

  if (!sections || sections.length === 0) {
    return <div className="w-full p-4 text-center text-gray-500">탭 데이터가 없습니다.</div>;
  }

  // 보이는 섹션만 필터링
  const visibleSections = sections.filter((section) => section.visible);

  if (visibleSections.length === 0) {
    return <div className="w-full p-4 text-center text-gray-500">표시할 섹션이 없습니다.</div>;
  }

  // 탭별 컴포넌트 매핑
  const getTabComponent = (tabId) => {
    switch (tabId) {
      case 'hotel':
        return <LazyHotelInfo hotel={hotelInfo} update={handleHotelUpdate} />;
      case 'room':
        return <LazyRoomInfo />;
      case 'price':
        return <LazyPriceTable />;
      case 'package':
        return <LazyPackage />;
      case 'cancel':
        return <LazyCancelPolicy />;
      case 'booking':
        return <LazyBookingInfo />;
      case 'notice':
        return <LazyNotice />;
      case 'checkin':
        return <LazyCheckInOutInfo />;
      case 'period':
        return <LazyPeriodInfo />;
      default:
        return <div className="p-4 text-center text-gray-500">섹션 내용이 준비 중입니다.</div>;
    }
  };

  return (
    <div className="w-full h-full flex flex-col">
      {/* 탭 네비게이션 */}
      <div className="border-b border-gray-200 bg-white">
        <nav className="-mb-px flex space-x-4 overflow-x-auto" aria-label="Tabs">
          {visibleSections.map((section) => (
            <button
              key={section.id}
              onClick={() => handleTabChange(section.id)}
              className={`
                px-4 py-2 text-sm font-medium transition-all duration-300 whitespace-nowrap
                ${activeTab === section.id 
                  ? 'border-b-2 border-indigo-500 text-indigo-600' 
                  : 'border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
              `}
            >
              {section.label}
            </button>
          ))}
        </nav>
      </div>
      
      {/* 탭 콘텐츠 */}
      <div className="flex-1 overflow-y-auto">
        {visibleSections.map((section) => (
          <div
            key={section.id}
            className={`
              ${activeTab === section.id ? 'block' : 'hidden'}
              transition-opacity duration-300 ease-in-out h-full
            `}
          >
            {getTabComponent(section.id)}
          </div>
        ))}
      </div>
    </div>
  );
} 