import dynamic from 'next/dynamic';
import React, { Suspense } from 'react';

// 로딩 컴포넌트
const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
    <span className="ml-2 text-gray-600">로딩 중...</span>
  </div>
);

// 에러 바운더리 컴포넌트
const ErrorFallback = ({ error, resetError }) => (
  <div className="p-4 border-l-4 border-red-500 bg-red-50">
    <div className="flex">
      <div className="ml-3">
        <h3 className="text-sm font-medium text-red-800">
          컴포넌트 로딩 오류
        </h3>
        <p className="mt-2 text-sm text-red-700">
          {error?.message || '알 수 없는 오류가 발생했습니다.'}
        </p>
        <button
          onClick={resetError}
          className="mt-2 text-sm bg-red-100 text-red-800 px-3 py-1 rounded hover:bg-red-200"
        >
          다시 시도
        </button>
      </div>
    </div>
  </div>
);

// Lazy Loading 컴포넌트들 정의
export const LazyHotelInfo = dynamic(
  () => import('./hotel/HotelInfo'),
  {
    loading: () => <LoadingSpinner />,
    ssr: false // 서버사이드 렌더링 비활성화로 성능 향상
  }
);

export const LazyRoomInfoEditor = dynamic(
  () => import('./room/RoomInfoEditor'),
  {
    loading: () => <LoadingSpinner />,
    ssr: false
  }
);

export const LazyFacilitiesInfo = dynamic(
  () => import('./facilities/FacilitiesInfo'),
  {
    loading: () => <LoadingSpinner />,
    ssr: false
  }
);

export const LazyPackage = dynamic(
  () => import('./package/Package'),
  {
    loading: () => <LoadingSpinner />,
    ssr: false
  }
);

export const LazySalePeriod = dynamic(
  () => import('./period/SalePeriod'),
  {
    loading: () => <LoadingSpinner />,
    ssr: false
  }
);

export const LazyChargesInfo = dynamic(
  () => import('./charges/ChargesInfo'),
  {
    loading: () => <LoadingSpinner />,
    ssr: false
  }
);

export const LazyPriceTable = dynamic(
  () => import('./price/PriceTable'),
  {
    loading: () => <LoadingSpinner />,
    ssr: false
  }
);

export const LazyCheckInOutInfo = dynamic(
  () => import('./checkin/CheckInOutInfo'),
  {
    loading: () => <LoadingSpinner />,
    ssr: false
  }
);

export const LazyCancelPolicy = dynamic(
  () => import('./cancel/CancelPolicy'),
  {
    loading: () => <LoadingSpinner />,
    ssr: false
  }
);

export const LazyBookingInfo = dynamic(
  () => import('./booking/BookingInfo'),
  {
    loading: () => <LoadingSpinner />,
    ssr: false
  }
);

export const LazyNotice = dynamic(
  () => import('./notice/Notice'),
  {
    loading: () => <LoadingSpinner />,
    ssr: false
  }
);

export const LazyAllTemplateManager = dynamic(
  () => import('./template/AllTemplateManager'),
  {
    loading: () => <LoadingSpinner />,
    ssr: false
  }
);

// HOC: 에러 바운더리가 포함된 Lazy 컴포넌트 래퍼
export const withLazyLoading = (LazyComponent, componentName = 'Component') => {
  return function LazyWrapper(props) {
    return (
      <Suspense fallback={<LoadingSpinner />}>
        <ErrorBoundary
          fallback={ErrorFallback}
          onError={(error) => {
            console.error(`${componentName} 로딩 오류:`, error);
          }}
        >
          <LazyComponent {...props} />
        </ErrorBoundary>
      </Suspense>
    );
  };
};

// 간단한 에러 바운더리 클래스 컴포넌트
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      const resetError = () => {
        this.setState({ hasError: false, error: null });
      };
      
      return this.props.fallback 
        ? this.props.fallback({ error: this.state.error, resetError })
        : <div>Something went wrong.</div>;
    }

    return this.props.children;
  }
}

// 래핑된 컴포넌트들 (에러 바운더리 포함)
export const SafeLazyHotelInfo = withLazyLoading(LazyHotelInfo, 'HotelInfo');
export const SafeLazyRoomInfoEditor = withLazyLoading(LazyRoomInfoEditor, 'RoomInfoEditor');
export const SafeLazyFacilitiesInfo = withLazyLoading(LazyFacilitiesInfo, 'FacilitiesInfo');
export const SafeLazyPackage = withLazyLoading(LazyPackage, 'Package');
export const SafeLazySalePeriod = withLazyLoading(LazySalePeriod, 'SalePeriod');
export const SafeLazyChargesInfo = withLazyLoading(LazyChargesInfo, 'ChargesInfo');
export const SafeLazyPriceTable = withLazyLoading(LazyPriceTable, 'PriceTable');
export const SafeLazyCheckInOutInfo = withLazyLoading(LazyCheckInOutInfo, 'CheckInOutInfo');
export const SafeLazyCancelPolicy = withLazyLoading(LazyCancelPolicy, 'CancelPolicy');
export const SafeLazyBookingInfo = withLazyLoading(LazyBookingInfo, 'BookingInfo');
export const SafeLazyNotice = withLazyLoading(LazyNotice, 'Notice');
export const SafeLazyAllTemplateManager = withLazyLoading(LazyAllTemplateManager, 'AllTemplateManager');

// 프리로딩 함수들 (선택적으로 사용)
export const preloadComponents = {
  hotelInfo: () => import('./hotel/HotelInfo'),
  roomInfo: () => import('./room/RoomInfoEditor'),
  facilities: () => import('./facilities/FacilitiesInfo'),
  package: () => import('./package/Package'),
  salePeriod: () => import('./period/SalePeriod'),
  charges: () => import('./charges/ChargesInfo'),
  checkin: () => import('./checkin/CheckInOutInfo'),
  cancel: () => import('./cancel/CancelPolicy'),
  booking: () => import('./booking/BookingInfo'),
  notice: () => import('./notice/Notice'),
  template: () => import('./template/AllTemplateManager')
};

// 모든 컴포넌트 프리로드 (옵션)
export const preloadAllComponents = () => {
  return Promise.all(Object.values(preloadComponents).map(loader => loader()));
}; 