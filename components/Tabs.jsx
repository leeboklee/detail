'use client';

import React, { useState, useEffect, Suspense } from 'react';

import Labels from '@/src/shared/labels';
import { useAppContext } from './AppContext.Context';
import { BOOKING_SECTION_STYLES } from './layout/LayoutStyles';

// 인라인 객실 편집기 동적 임포트
const InlineRoomEditor = React.lazy(() => import('./inline/InlineRoomEditor'));
// 요금표 컴포넌트 동적 임포트
const PriceTable = React.lazy(() => import('./price/PriceTable'));
// 패키지 컴포넌트 동적 임포트
const Package = React.lazy(() => import('./package/Package'));

const Tabs = () => {
  const { sections, hotelInfo, bookingInfo, layoutInfo, setHotelInfo } = useAppContext();
  const [hasMounted, setHasMounted] = useState(false);
  const [activeTab, setActiveTab] = useState(null);
  const [rooms, setRooms] = useState([]);

  // 클라이언트 마운트 확인
  useEffect(() => {
    setHasMounted(true);
  }, []);

  // hotelInfo 변경 시 미리보기 강제 업데이트
  useEffect(() => {
    console.log('hotelInfo 업데이트됨:', hotelInfo);
  }, [hotelInfo]);

  // bookingInfo 변경 시 미리보기 강제 업데이트  
  useEffect(() => {
    console.log('bookingInfo 업데이트됨:', bookingInfo);
  }, [bookingInfo]);

  // 객실 데이터 변경 시 hotelInfo에 저장
  useEffect(() => {
    try {
      if (rooms && rooms.length > 0 && setHotelInfo) {
        setHotelInfo('rooms', rooms);
        console.log('객실 데이터 업데이트됨:', rooms);
      }
    } catch (error) {
      console.error('객실 데이터 저장 오류:', error);
    }
  }, [rooms, setHotelInfo]);

  // 객실 데이터 초기 로드
  useEffect(() => {
    try {
      if (hotelInfo?.rooms && Array.isArray(hotelInfo.rooms)) {
        setRooms(hotelInfo.rooms);
      }
    } catch (error) {
      console.error('객실 데이터 로드 오류:', error);
      setRooms([]);
    }
  }, [hotelInfo?.rooms]);

  // 객실 데이터 변경 핸들러
  const handleRoomsChange = (updatedRooms) => {
    try {
      if (Array.isArray(updatedRooms)) {
        setRooms(updatedRooms);
      } else {
        console.warn('유효하지 않은 객실 데이터:', updatedRooms);
        setRooms([]);
      }
    } catch (error) {
      console.error('객실 데이터 변경 오류:', error);
      setRooms([]);
    }
  };

  // 섹션별 내용 생성 함수
  const generateSectionContent = (section) => {
    switch (section.id) {
      case 'hotel':
        return (
          <div className="p-3 sm:p-6 bg-white rounded-lg shadow-sm border">
            <h2 className="text-lg sm:text-2xl font-bold text-gray-800 mb-3 sm:mb-4">🏨 호텔 정보</h2>
            {hotelInfo?.name ? (
              <div className="space-y-3 sm:space-y-4">
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 sm:p-6 rounded-lg">
                  <h1 className="text-xl sm:text-3xl font-bold mb-1 sm:mb-2">{hotelInfo.name}</h1>
                  {hotelInfo.subtitle && <p className="text-sm sm:text-lg opacity-90">{hotelInfo.subtitle}</p>}
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-6">
                  {hotelInfo?.address && (
                    <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                      <h3 className="font-semibold text-gray-700 mb-2 text-sm sm:text-base">📍 주소</h3>
                      <p className="text-gray-600 text-sm sm:text-base break-words leading-relaxed">{hotelInfo.address}</p>
                    </div>
                  )}
                  
                  {hotelInfo?.description && (
                    <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                      <h3 className="font-semibold text-gray-700 mb-2 text-sm sm:text-base">📝 소개</h3>
                      <p className="text-gray-600 text-sm sm:text-base break-words leading-relaxed">{hotelInfo.description}</p>
                    </div>
                  )}
                  
                  {hotelInfo?.checkin_time && (
                    <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                      <h3 className="font-semibold text-gray-700 mb-2 text-sm sm:text-base">🕒 체크인</h3>
                      <p className="text-gray-600 text-sm sm:text-base leading-relaxed">{hotelInfo.checkin_time}</p>
                    </div>
                  )}
                  
                  {hotelInfo?.checkout_time && (
                    <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                      <h3 className="font-semibold text-gray-700 mb-2 text-sm sm:text-base">🕐 체크아웃</h3>
                      <p className="text-gray-600 text-sm sm:text-base leading-relaxed">{hotelInfo.checkout_time}</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-6 sm:py-8">
                <p className="text-sm sm:text-base">호텔 정보를 입력해주세요.</p>
              </div>
            )}
          </div>
        );
        
      case 'package':
        return (
          <div className="p-3 sm:p-6 bg-white rounded-lg shadow-sm border">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-2xl font-bold text-gray-800 mb-2 sm:mb-0">📦 패키지 정보</h2>
            </div>
            
            {/* 패키지 편집기 */}
            <Suspense fallback={<div className="text-center py-4 text-sm">패키지 편집기 로딩 중...</div>}>
              <Package 
                value={hotelInfo?.packages || []}
                onChange={(packages) => {
                  try {
                    if (setHotelInfo) {
                      setHotelInfo('packages', packages);
                      console.log('패키지 데이터 업데이트됨:', packages);
                    }
                  } catch (error) {
                    console.error('패키지 데이터 저장 오류:', error);
                  }
                }}
              />
            </Suspense>

            {/* 패키지 미리보기 */}
            {hotelInfo?.packages && hotelInfo.packages.length > 0 && (
              <div className="mt-6 sm:mt-8">
                <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">📋 패키지 미리보기</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  {hotelInfo.packages.map((pkg, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-3 sm:p-4">
                      <div className="flex items-center justify-between mb-2 sm:mb-3">
                        <h4 className="font-semibold text-gray-800 text-sm sm:text-base truncate pr-2">{pkg.name || `패키지 ${index + 1}`}</h4>
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded flex-shrink-0">
                          ₩{pkg.price?.toLocaleString() || '0'}
                        </span>
                      </div>
                      
                      {pkg.description && (
                        <p className="text-sm text-gray-600 mb-2 break-words">{pkg.description}</p>
                      )}
                      
                      <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-gray-600">
                        {pkg.salesPeriod?.start && pkg.salesPeriod?.end && (
                          <p><strong>판매기간:</strong> {pkg.salesPeriod.start} ~ {pkg.salesPeriod.end}</p>
                        )}
                        {pkg.stayPeriod?.start && pkg.stayPeriod?.end && (
                          <p><strong>투숙기간:</strong> {pkg.stayPeriod.start} ~ {pkg.stayPeriod.end}</p>
                        )}
                        {pkg.productComposition && (
                          <p><strong>상품구성:</strong> <span className="break-words">{pkg.productComposition}</span></p>
                        )}
                        {pkg.includes && pkg.includes.length > 0 && (
                          <div>
                            <strong>포함사항:</strong>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {pkg.includes.map((include, idx) => (
                                <span key={idx} className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">
                                  {include}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        {pkg.notes && pkg.notes.length > 0 && (
                          <div>
                            <strong>유의사항:</strong>
                            <div className="space-y-1 mt-1">
                              {pkg.notes.map((note, idx) => (
                                <p key={idx} className="text-xs text-gray-500 break-words">• {note}</p>
                              ))}
                            </div>
                          </div>
                        )}
                        {pkg.constraints && pkg.constraints.length > 0 && (
                          <div>
                            <strong>제약사항:</strong>
                            <div className="space-y-1 mt-1">
                              {pkg.constraints.map((constraint, idx) => (
                                <p key={idx} className="text-xs text-red-600 break-words">• {constraint}</p>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
              </div>
                  ))}
              </div>
              </div>
            )}
          </div>
        );
        
      case 'notice':
        return (
          <div className="p-3 sm:p-6 bg-white rounded-lg shadow-sm border">
            <h2 className="text-lg sm:text-2xl font-bold text-gray-800 mb-3 sm:mb-4">📢 안내사항</h2>
            <div className="space-y-3 sm:space-y-4">
              <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                <h3 className="font-semibold text-gray-700 mb-2 text-sm sm:text-base">📢 주요 안내</h3>
                <p className="text-gray-600 text-sm sm:text-base break-words leading-relaxed">{hotelInfo?.notice || '주요 안내사항을 입력해주세요.'}</p>
              </div>
              <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                <h3 className="font-semibold text-gray-700 mb-2 text-sm sm:text-base">⚠️ 주의사항</h3>
                <p className="text-gray-600 text-sm sm:text-base break-words leading-relaxed">{hotelInfo?.warning || '주의사항을 입력해주세요.'}</p>
              </div>
              <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                <h3 className="font-semibold text-gray-700 mb-2 text-sm sm:text-base">ℹ️ 추가 정보</h3>
                <p className="text-gray-600 text-sm sm:text-base break-words leading-relaxed">{hotelInfo?.additionalInfo || '추가 정보를 입력해주세요.'}</p>
              </div>
            </div>
          </div>
        );
        
      case 'rooms':
        return (
          <div className="p-3 sm:p-6 bg-white rounded-lg shadow-sm border">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-2xl font-bold text-gray-800 mb-2 sm:mb-0">🛏️ 객실 정보</h2>
              <span className="text-xs sm:text-sm text-gray-500">
                {rooms.length}개 객실
              </span>
            </div>
            
            {/* 인라인 객실 편집기 */}
            <Suspense fallback={<div className="text-center py-4 text-sm">객실 편집기 로딩 중...</div>}>
              <InlineRoomEditor 
                rooms={rooms} 
                onRoomsChange={handleRoomsChange}
              />
            </Suspense>

            {/* 객실 미리보기 */}
            {rooms.length > 0 && (
              <div className="mt-6 sm:mt-8">
                <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">📋 객실 미리보기</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  {rooms.map((room, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-3 sm:p-4">
                      <div className="flex items-center justify-between mb-2 sm:mb-3">
                        <h4 className="font-semibold text-gray-800 text-sm sm:text-base truncate pr-2">{room.name || `객실 ${index + 1}`}</h4>
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded flex-shrink-0">{room.type}</span>
                      </div>
                      
                      {room.image && (
                        <div className="mb-2 sm:mb-3">
                          <img 
                            src={room.image} 
                            alt={room.name} 
                            className="w-full h-24 sm:h-32 object-cover rounded"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                      
                      <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-gray-600">
                        {room.structure && <p><strong>구조:</strong> <span className="break-words">{room.structure}</span></p>}
                        {room.bedType && <p><strong>침대:</strong> <span className="break-words">{room.bedType}</span></p>}
                        {room.view && <p><strong>전망:</strong> <span className="break-words">{room.view}</span></p>}
                        <p><strong>수용인원:</strong> 기준 {room.standardCapacity}명 / 최대 {room.maxCapacity}명</p>
                        {room.description && <p><strong>설명:</strong> <span className="break-words">{room.description}</span></p>}
                        {room.amenities && room.amenities.length > 0 && (
                          <div>
                            <strong>편의시설:</strong>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {room.amenities.map((amenity, idx) => (
                                <span key={idx} className="text-xs bg-gray-100 text-gray-700 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded">
                                  {amenity}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
              </div>
                  ))}
              </div>
              </div>
            )}
          </div>
        );
        
      case 'price':
        return (
          <div className="p-3 sm:p-6 bg-white rounded-lg shadow-sm border">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-2xl font-bold text-gray-800">💰 요금표</h2>
            </div>
            
            {/* 요금표 편집기 */}
            <Suspense fallback={<div className="text-center py-4 text-sm">요금표 편집기 로딩 중...</div>}>
              <PriceTable 
                value={hotelInfo?.priceTable || {}}
                onChange={(priceData) => {
                  try {
                    if (setHotelInfo) {
                      setHotelInfo('priceTable', priceData);
                      console.log('요금표 데이터 업데이트됨:', priceData);
                    }
                  } catch (error) {
                    console.error('요금표 데이터 저장 오류:', error);
                  }
                }}
              />
            </Suspense>

            {/* 요금표 미리보기 */}
            {hotelInfo?.priceTable && Object.keys(hotelInfo.priceTable).length > 0 && (
              <div className="mt-6 sm:mt-8">
                <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">📋 요금표 미리보기</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-lg mb-3 text-contrast-fix">{hotelInfo.priceTable.title || '요금표'}</h4>
                  
                  {hotelInfo.priceTable.priceTable?.roomTypes && (
            <div className="space-y-4">
                      {hotelInfo.priceTable.priceTable.roomTypes.map((roomType, roomIndex) => (
                        <div key={roomIndex} className="border border-gray-200 rounded-lg p-3 bg-white">
                          <h5 className="font-semibold text-gray-800 mb-2 text-contrast-fix">{roomType.name}</h5>
                          {roomType.types && (
                            <div className="space-y-2">
                              {roomType.types.map((type, typeIndex) => (
                                <div key={typeIndex} className="ml-4">
                                  <h6 className="font-medium text-gray-700 text-contrast-fix">{type.name}</h6>
                                  {type.prices && (
                                    <div className="ml-4 text-sm text-gray-600">
                                      {Object.entries(type.prices).map(([period, days]) => (
                                        <div key={period} className="mt-1">
                                          <span className="font-medium text-contrast-fix">{period}: </span>
                                          {Object.entries(days).map(([day, price]) => (
                                            <span key={day} className="mr-3 text-contrast-fix">
                                              {day}: {price.toLocaleString()}원
                                            </span>
                                          ))}
                                        </div>
                                      ))}
              </div>
                                  )}
              </div>
                              ))}
              </div>
                          )}
            </div>
                      ))}
          </div>
                  )}
                  
                  {hotelInfo.priceTable.notes && hotelInfo.priceTable.notes.length > 0 && (
                    <div className="mt-4">
                      <h5 className="font-semibold text-gray-800 mb-2 text-contrast-fix">📝 안내사항</h5>
                      <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                        {hotelInfo.priceTable.notes.map((note, index) => (
                          <li key={index} className="text-contrast-fix">{note}</li>
                        ))}
                      </ul>
              </div>
                  )}
              </div>
              </div>
            )}
          </div>
        );
        
      case 'booking':
        return (
          <div className="p-3 sm:p-6 bg-white rounded-lg shadow-sm border">
            <h2 className="text-lg sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">📞 예약안내</h2>
            <BookingSectionRenderer bookingInfo={bookingInfo} layoutInfo={layoutInfo} />
          </div>
        );
        
      default:
        return (
          <div className="p-3 sm:p-6 bg-white rounded-lg shadow-sm border">
            <h2 className="text-lg sm:text-2xl font-bold text-gray-800 mb-3 sm:mb-4">{section.label}</h2>
            <div className="text-center text-gray-500 py-6 sm:py-8">
              <p className="text-sm sm:text-base">{section.label} 내용을 입력해주세요.</p>
            </div>
          </div>
        );
    }
  };

  // 첫 번째 활성 탭 설정
  useEffect(() => {
    if (hasMounted && sections && sections.length > 0 && activeTab === null) {
      const firstVisibleTab = sections.find((section) => section.visible);
      if (firstVisibleTab) {
        setActiveTab(firstVisibleTab.id);
      }
    }
  }, [hasMounted, sections, activeTab]);

  const handleTabChange = (tabId) => {
    if (hasMounted) {
      setActiveTab(tabId);
    }
  };

  // 클라이언트 마운트 전 로딩 상태
  if (!hasMounted) {
    return (
      <div className="w-full p-4 text-center text-gray-500">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="h-64 bg-gray-100 rounded"></div>
        </div>
      </div>
    );
  }

  if (!sections || sections.length === 0) {
    return <div className="w-full p-4 text-center text-gray-500">탭 데이터가 없습니다.</div>;
  }

  // 보이는 섹션만 필터링
  const visibleSections = sections.filter((section) => section.visible);

  if (visibleSections.length === 0) {
    return <div className="w-full p-4 text-center text-gray-500">표시할 섹션이 없습니다.</div>;
  }

  // activeTab이 설정되지 않았으면 첫 번째 탭으로 설정
  if (!activeTab && visibleSections.length > 0) {
    // 비동기로 탭 설정하여 렌더링 중 상태 변경 방지
    setTimeout(() => {
      setActiveTab(visibleSections[0].id);
    }, 0);
    return (
      <div className="w-full p-4 text-center text-gray-500">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="h-64 bg-gray-100 rounded"></div>
        </div>
      </div>
    );
  }

  // activeTab이 유효하지 않으면 첫 번째 탭으로 설정
  const currentActiveTab = activeTab && visibleSections.find(s => s.id === activeTab) ? activeTab : visibleSections[0]?.id;

  return (
    <div className="w-full">
      {/* 모바일 반응형 탭 네비게이션 */}
      <div className="border-b border-gray-200 overflow-hidden">
        <nav className="-mb-px flex overflow-x-auto scrollbar-hide" aria-label={Labels.TABS_1}>
          <div className="flex space-x-2 sm:space-x-4 min-w-max px-2 sm:px-0">
          {visibleSections.map((section) => (
            <button
              key={section.id}
              onClick={() => handleTabChange(section.id)}
              className={`
                  flex-shrink-0 px-2 sm:px-4 py-2 text-xs sm:text-sm font-medium transition-all duration-300 whitespace-nowrap
                  ${currentActiveTab === section.id 
                  ? 'border-b-2 border-indigo-500 text-indigo-600' 
                  : 'border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
              `}
            >
              {section.label}
            </button>
          ))}
          </div>
        </nav>
      </div>
      
      {/* 컨텐츠 영역 - 모바일 패딩 조정 */}
      <div className="mt-2 sm:mt-4">
        {visibleSections.map((section) => (
          <div
            key={section.id}
            className={`
              ${currentActiveTab === section.id ? 'block' : 'hidden'}
              transition-opacity duration-300 ease-in-out
            `}
          >
            {generateSectionContent(section)}
          </div>
        ))}
      </div>
    </div>
  );
};

// 예약안내 섹션 렌더러 컴포넌트
const BookingSectionRenderer = ({ bookingInfo, layoutInfo }) => {
  const [renderedContent, setRenderedContent] = useState('');
  
  useEffect(() => {
    try {
      console.log('BookingSectionRenderer 업데이트:', bookingInfo);
      
      // 숙박권 구매안내와 참고사항 분리 렌더링
      let content = '';
      
      // 숙박권 구매안내 섹션
      if (bookingInfo?.bookingText) {
        const lines = bookingInfo.bookingText.split('\n');
        const formattedContent = lines.map((line, index) => {
          if (line.trim() === '') return '<br>';
          
          // 경고 메시지 (⚠️ 포함)
          if (line.includes('⚠️')) {
            return `<div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 6px; padding: 12px; margin: 8px 0; color: #dc2626; font-weight: 600;">${line}</div>`;
          }
          
          // 번호 목록 (1. 2. 등)
          if (line.match(/^\d+\./)) {
            return `<p style="margin: 8px 0; font-weight: 500; color: #374151;">${line}</p>`;
          }
          
          // 특수 문자 포함된 줄 (* 등)
          if (line.startsWith('*') || line.startsWith('※')) {
            return `<p style="margin: 4px 0; color: #6b7280; font-size: 13px;">${line}</p>`;
          }
          
          // 일반 텍스트
          return `<p style="margin: 4px 0; color: #374151;">${line}</p>`;
        }).join('');
        
        content += `
          <div style="background: #f0f9ff; border: 2px solid #0ea5e9; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
            <h3 style="color: #0c4a6e; font-size: 20px; font-weight: 700; margin-bottom: 16px;">🏨 숙박권 구매안내</h3>
            <div style="color: #374151; line-height: 1.8;">
              ${formattedContent}
            </div>
          </div>
        `;
      }
      
      // 참고사항 섹션
      if (bookingInfo?.referenceNotes) {
        const lines = bookingInfo.referenceNotes.split('\n');
        const formattedContent = lines.map((line, index) => {
          if (line.trim() === '') return '<br>';
          return `<p style="margin: 4px 0; color: #374151;">${line}</p>`;
        }).join('');
        
        content += `
          <div style="background: #fef3c7; border: 2px solid #f59e0b; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
            <h3 style="color: #92400e; font-size: 20px; font-weight: 700; margin-bottom: 16px;">📋 참고사항</h3>
            <div style="color: #374151; line-height: 1.8;">
              ${formattedContent}
            </div>
          </div>
        `;
      }
      
      // 카톡 채널 정보
      if (bookingInfo?.kakaoChannel) {
        content += `
          <div style="background: #fbbf24; border-radius: 12px; padding: 20px; text-align: center;">
            <div style="display: flex; align-items: center; justify-content: center; gap: 12px; color: #92400e; font-weight: 600; font-size: 16px;">
              <span style="font-size: 24px;">💬</span>
              <span>${bookingInfo.kakaoChannel}</span>
            </div>
          </div>
        `;
      }
      
      if (content) {
        setRenderedContent(`
          <div class="space-y-4">
            ${content}
          </div>
        `);
        return;
      }
      
      // 기존 BookingInfo 형식 (하위 호환성)
      if (bookingInfo?.bookingText) {
        const lines = bookingInfo.bookingText.split('\n');
        const formattedContent = lines.map((line, index) => {
          if (line.trim() === '') return '<br>';
          if (line.includes('⚠️')) {
            return `<div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 6px; padding: 12px; margin: 8px 0; color: #dc2626; font-weight: 600;">${line}</div>`;
          }
          if (line.startsWith('*')) {
            return `<p style="margin: 4px 0; color: #6b7280; font-size: 13px;">${line}</p>`;
          }
          if (line.match(/^\d+\./)) {
            return `<p style="margin: 8px 0; font-weight: 500;">${line}</p>`;
          }
          return `<p style="margin: 4px 0;">${line}</p>`;
        }).join('');

        setRenderedContent(`
          <div class="p-6 bg-white rounded-lg shadow-sm border text-contrast-fix">
            <h2 class="text-2xl font-bold text-gray-800 mb-4">📞 예약안내</h2>
            <div class="space-y-2 leading-relaxed">
              ${formattedContent}
            </div>
          </div>
        `);
        return;
      }
      
      // 기본 메시지
      setRenderedContent(`
        <div class="p-6 bg-white rounded-lg shadow-sm border text-contrast-fix">
          <h2 class="text-2xl font-bold text-gray-800 mb-4">📞 예약안내</h2>
          <div class="text-center text-gray-500 py-8">
            <p>예약안내 내용을 입력해주세요.</p>
          </div>
        </div>
      `);
    } catch (error) {
      console.error('BookingSectionRenderer 오류:', error);
      setRenderedContent(`
        <div class="p-6 bg-white rounded-lg shadow-sm border text-contrast-fix">
          <h2 class="text-2xl font-bold text-gray-800 mb-4">📞 예약안내</h2>
          <div class="text-center text-red-500 py-8">
            <p>예약안내 렌더링 중 오류가 발생했습니다.</p>
          </div>
        </div>
      `);
    }
  }, [bookingInfo, layoutInfo]);
  
  return (
    <div 
      className="booking-section-preview"
      dangerouslySetInnerHTML={{ __html: renderedContent }}
    />
  );
};

export default Tabs;
