'use client'

import React, { useState, useCallback, useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import { Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, Input, Select, SelectItem } from "@heroui/react"

// 새로 분리된 컴포넌트들
import MainLayout from '@/components/layout/MainLayout'
import MonitoringDashboard from '@/components/layout/MonitoringDashboard'

// 핵심 컴포넌트들은 즉시 로딩 (안정성 확보)
import DraggableTabs from '@/components/DraggableTabs'
import ClientOnly from '@/components/ClientOnly'

// 새로 분리된 훅들
import { useAppState } from '@/hooks/useAppState'
import { useTabManagement } from '@/hooks/useTabManagement'

// 일반 임포트로 컴포넌트 로딩 (청크 오류 방지)
import HotelInfoSection from '@/components/hotel/HotelInfo';
import RoomInfoEditor from '@/components/room/RoomInfoEditor';
import FacilitiesInfo from '@/components/facilities/FacilitiesInfo';
import CheckInOutInfo from '@/components/checkin/CheckInOutInfo';
import Package from '@/components/package/Package';
import PriceTable from '@/components/price/PriceTable';
import CancelPolicy from '@/components/cancel/CancelPolicy';
import BookingInfo from '@/components/booking/BookingInfo';
import Notice from '@/components/notice/Notice';
import CommonInfo from '@/components/common/CommonInfo';
import Preview from '@/components/Preview';
import TemplateManager from '@/components/TemplateManager';

// 로딩 스피너 컴포넌트
function LoadingSpinner({ size = "default" }) {
  const spinnerSize = size === "small" ? "h-4 w-4" : size === "large" ? "h-32 w-32" : "h-8 w-8"
  
  return (
    <div className="flex items-center justify-center p-4">
      <div className={`animate-spin rounded-full border-b-2 border-blue-600 ${spinnerSize}`}></div>
      {size === "large" && <span className="ml-4 text-gray-600">로딩 중...</span>}
    </div>
  )
}

// 컴포넌트 매핑 함수 (안전한 렌더링)
const getComponentForTab = (tabKey) => {
  switch (tabKey) {
    case 'hotel':
      return HotelInfoSection
    case 'rooms':
      return RoomInfoEditor
    case 'facilities':
      return FacilitiesInfo
    case 'checkin':
      return CheckInOutInfo
    case 'packages':
      return Package
    case 'pricing':
      return PriceTable
    case 'cancel':
      return CancelPolicy
    case 'common':
      return CommonInfo
    case 'booking':
      return BookingInfo
    case 'notices':
      return Notice
    default:
      return null
  }
}

  // 성능 최적화를 위한 메모이제이션
const MemoizedHome = React.memo(function Home() {
  // 새로 분리된 훅들 사용
  const {
    data,
    updateData,
    resetData,
    exportData,
    importData,
    showNotification,
    hideNotification,
    setLoading,
    setHtmlGenerationState
  } = useAppState()

  const {
    activeTab,
    tabOrder,
    isDragMode,
    activateTab,
    moveTab,
    resetTabOrder,
    toggleDragMode,
    getActiveTabInfo,
    getTabInfo,
    getOrderedTabs,
    isModalTab,
    isInlineTab
  } = useTabManagement()

  // onChangeForTab 함수를 컴포넌트 레벨로 이동
  const onChangeForTab = useCallback((updated) => {
    console.log('=== onChangeForTab 호출됨 ===');
    console.log('activeTab:', activeTab);
    console.log('받은 데이터:', updated);
    
    if (activeTab === 'booking') {
      console.log('예약안내 탭 - updateData 호출');
      updateData('bookingInfo', updated);
    } else {
      console.log('다른 탭 - updateData 호출');
      updateData(activeTab, updated);
    }
  }, [activeTab, updateData])

  const [mounted, setMounted] = useState(false)
  const [previewRefreshKey, setPreviewRefreshKey] = useState(0)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedHtml, setGeneratedHtml] = useState('')
  const [device, setDevice] = useState('desktop') // desktop, galaxy, iphone
  const [lastGenerated, setLastGenerated] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' })
  const [notices, setNotices] = useState([])
  const [showMonitoringDashboard, setShowMonitoringDashboard] = useState(false)
  const [monitoringErrors, setMonitoringErrors] = useState([])
  const monitoringWSRef = useRef(null)
  const notificationTimeoutRef = useRef(null)
  
  const { isOpen: isModalOpen, onOpen: onModalOpen, onClose: onModalClose } = useDisclosure()
  const { isOpen: isPreviewOpen, onOpen: onPreviewOpen, onClose: onPreviewClose } = useDisclosure()
  const { isOpen: isSettingsOpen, onOpen: onSettingsOpen, onClose: onSettingsClose } = useDisclosure()
  const { isOpen: isHotelModalOpen, onOpen: onHotelModalOpen, onClose: onHotelModalClose } = useDisclosure()
  const { isOpen: isBackupModalOpen, onOpen: onBackupOpen, onClose: onBackupClose } = useDisclosure()

  // 마운트 상태 초기화 (hydration 에러 방지)
  useEffect(() => {
    setMounted(true)
  }, [])

  // 알림 표시 함수
  const showNotificationHandler = useCallback((message, type = 'success') => {
    // 기존 타이머 정리
    if (notificationTimeoutRef.current) {
      clearTimeout(notificationTimeoutRef.current)
      notificationTimeoutRef.current = null
    }

    setNotification({
      show: true,
      message,
      type
    })
    
    // 3초 후 자동 숨김 (ref에 저장)
    notificationTimeoutRef.current = setTimeout(() => {
      setNotification(prev => ({
        ...prev,
        show: false
      }))
      notificationTimeoutRef.current = null
    }, 3000)
  }, [])

  // 알림 숨기기 함수
  const hideNotificationHandler = useCallback(() => {
    // timeout 정리
    if (notificationTimeoutRef.current) {
      clearTimeout(notificationTimeoutRef.current)
      notificationTimeoutRef.current = null
    }
    
    setNotification(prev => ({
      ...prev,
      show: false
    }))
  }, [])

  // cleanup 함수 등록
  const registerCleanup = useCallback((cleanup) => {
    // cleanup 함수를 즉시 실행하여 메모리 정리
    if (typeof cleanup === 'function') {
      try {
        cleanup()
      } catch (error) {
        console.warn('Cleanup 함수 실행 중 오류:', error)
      }
    }
  }, [])

  // HTML 생성 함수
  const generateHtml = useCallback(async () => {
    setIsGenerating(true)
    try {
      const html = `
        <!DOCTYPE html>
        <html lang="ko">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${data.hotel?.name || '호텔 정보'} - 🛍️ 쇼핑몰 스타일 상세페이지</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: 'Pretendard', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
              line-height: 1.6; 
              color: #2d3748; 
              background: #ffffff;
            }
            
            /* 쇼핑몰 스타일 헤더 */
            .ecommerce-header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 2rem;
              margin-bottom: 0;
              position: sticky;
              top: 0;
              z-index: 100;
              box-shadow: 0 2px 20px rgba(0,0,0,0.1);
            }
            .ecommerce-header .header-content {
              max-width: 1200px;
              margin: 0 auto;
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            .ecommerce-header h1 {
              font-size: 1.8rem;
              font-weight: 700;
            }
            .ecommerce-header .hotel-rating {
              display: flex;
              align-items: center;
              gap: 0.5rem;
            }
            .container { 
              max-width: 1200px; 
              margin: 0 auto; 
              padding: 20px;
            }
            .hotel-header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 40px;
              border-radius: 20px;
              margin-bottom: 30px;
              text-align: center;
              box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            }
            .hotel-header h1 {
              color: white;
              margin: 0;
              font-size: 2.5em;
              text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
            }
            .hotel-header p {
              font-size: 1.3em;
              opacity: 0.9;
              margin: 15px 0 0 0;
            }
            .info-section { 
              margin-bottom: 30px; 
              padding: 30px; 
              background: white;
              border-radius: 15px; 
              border-left: 5px solid #3498db;
              box-shadow: 0 5px 20px rgba(0,0,0,0.1);
            }
            .info-section h2 { 
              color: #2c3e50; 
              margin-bottom: 25px; 
              font-size: 1.8em;
              display: flex;
              align-items: center;
              gap: 10px;
            }
            .info-item { 
              margin: 15px 0; 
              padding: 15px 0; 
              border-bottom: 1px solid #ecf0f1;
              display: flex;
              align-items: center;
            }
            .info-label { 
              font-weight: bold; 
              color: #2c3e50; 
              min-width: 140px;
              font-size: 1.1em;
            }
            .info-value { 
              color: #7f8c8d; 
              margin-left: 20px;
              flex: 1;
              font-size: 1.1em;
            }
            .room-grid {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
              gap: 20px;
              margin-top: 20px;
            }
            .room-card {
              background: #f8f9fa;
              padding: 25px;
              border-radius: 12px;
              border: 2px solid #e9ecef;
              transition: transform 0.2s, box-shadow 0.2s;
            }
            .room-card:hover {
              transform: translateY(-2px);
              box-shadow: 0 8px 25px rgba(0,0,0,0.15);
            }
            .room-name {
              font-size: 1.3em;
              font-weight: bold;
              color: #2c3e50;
              margin-bottom: 15px;
              padding-bottom: 10px;
              border-bottom: 2px solid #3498db;
            }
            .room-details {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 15px;
              margin-bottom: 15px;
            }
            .room-detail {
              font-size: 0.95em;
            }
            .room-detail strong {
              color: #34495e;
            }
            .room-description {
              background: white;
              padding: 15px;
              border-radius: 8px;
              margin-top: 15px;
              border-left: 3px solid #3498db;
            }
            .pricing-table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
              background: white;
              border-radius: 8px;
              overflow: hidden;
              box-shadow: 0 3px 15px rgba(0,0,0,0.1);
            }
            .pricing-table th,
            .pricing-table td {
              padding: 15px;
              text-align: left;
              border-bottom: 1px solid #ecf0f1;
            }
            .pricing-table th {
              background: #3498db;
              color: white;
              font-weight: bold;
            }
            .pricing-table tr:nth-child(even) {
              background: #f8f9fa;
            }
            .pricing-table tr:hover {
              background: #e3f2fd;
            }
            .policy-item {
              background: #fff3cd;
              border: 1px solid #ffeaa7;
              border-radius: 8px;
              padding: 20px;
              margin: 15px 0;
            }
            .policy-title {
              font-weight: bold;
              color: #856404;
              margin-bottom: 10px;
              font-size: 1.1em;
          }
            .policy-content {
              color: #856404;
              line-height: 1.6;
            }
            .facility-grid {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
              gap: 15px;
              margin-top: 20px;
            }
            .facility-category {
              background: #e8f5e8;
              padding: 20px;
              border-radius: 10px;
              border: 2px solid #4caf50;
            }
            .facility-category h4 {
              color: #2e7d32;
              margin-bottom: 15px;
              font-size: 1.2em;
            }
            .facility-list {
              color: #388e3c;
              line-height: 1.6;
            }
            .checkin-info {
              background: #e3f2fd;
              padding: 25px;
              border-radius: 12px;
              border: 2px solid #2196f3;
            }
            .checkin-info h4 {
              color: #1565c0;
              margin-bottom: 20px;
              font-size: 1.3em;
            }
            .checkin-detail {
              margin: 12px 0;
              padding: 10px;
              background: white;
              border-radius: 6px;
              border-left: 3px solid #2196f3;
            }
            .package-grid {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
              gap: 20px;
              margin-top: 20px;
            }
            .package-card {
              background: #f3e5f5;
              padding: 25px;
              border-radius: 12px;
              border: 2px solid #9c27b0;
              transition: transform 0.2s;
            }
            .package-card:hover {
              transform: translateY(-3px);
            }
            .package-title {
              font-size: 1.2em;
              font-weight: bold;
              color: #6a1b9a;
              margin-bottom: 15px;
            }
            .package-content {
              color: #7b1fa2;
              line-height: 1.6;
            }
            .generated-info {
              background: #f8f9fa;
              padding: 25px;
              border-radius: 15px;
              margin-top: 40px;
              text-align: center;
              border: 3px dashed #dee2e6;
            }
            .generated-info p {
              margin: 8px 0;
              color: #6c757d;
              font-size: 1.1em;
            }
            @media (max-width: 768px) {
              .container { padding: 15px; }
              .hotel-header { padding: 30px 20px; }
              .hotel-header h1 { font-size: 2em; }
              .info-section { padding: 20px; }
              .room-grid { grid-template-columns: 1fr; }
              .room-details { grid-template-columns: 1fr; }
            }
          </style>
        </head>
        <body>
          <!-- 쇼핑몰 스타일 헤더 -->
          <header class="ecommerce-header">
            <div class="header-content">
              <h1>🏨 ${data.hotel?.name || '프리미엄 호텔'}</h1>
              <div class="hotel-rating">
                <span>⭐⭐⭐⭐⭐</span>
                <span>5.0</span>
              </div>
            </div>
          </header>

          <!-- 메인 상품 정보 영역 -->
          <div class="container">
            <!-- 호텔 메인 정보 카드 -->
            <div class="product-hero" style="background: white; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); margin: 2rem 0; padding: 2rem;">
              <div style="display: grid; grid-template-columns: 1fr 300px; gap: 2rem; align-items: start;">
                <div>
                  <div class="product-badge" style="display: inline-block; background: #e53e3e; color: white; padding: 0.5rem 1rem; border-radius: 20px; font-size: 0.85rem; font-weight: 600; margin-bottom: 1rem;">
                    🔥 인기 상품
                  </div>
                  <h2 style="font-size: 1.75rem; font-weight: 700; color: #2d3748; margin-bottom: 1rem; line-height: 1.2;">
                    ${data.hotel?.name || '럭셔리 호텔'}
                  </h2>
                  <div style="color: #718096; font-size: 1rem; margin-bottom: 1.5rem; line-height: 1.6;">
                    ${data.hotel?.description || '최고의 서비스와 편안한 휴식을 제공하는 프리미엄 호텔입니다.'}
                  </div>
                  <div class="hotel-features" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.75rem; margin-bottom: 1.5rem;">
                    ${data.hotel?.address ? `<div style="display: flex; align-items: center; gap: 0.5rem; padding: 0.75rem; background: #f7fafc; border-radius: 8px;"><span>📍</span><span style="color: #4a5568; font-size: 0.9rem;">${data.hotel.address}</span></div>` : ''}
                    ${data.hotel?.phone ? `<div style="display: flex; align-items: center; gap: 0.5rem; padding: 0.75rem; background: #f7fafc; border-radius: 8px;"><span>📞</span><span style="color: #4a5568; font-size: 0.9rem;">${data.hotel.phone}</span></div>` : ''}
                  </div>
                </div>
                <div class="price-section" style="background: #f8f9fa; padding: 1.5rem; border-radius: 12px; border: 2px solid #e2e8f0;">
                  <div style="text-align: center;">
                    <div style="color: #e53e3e; font-size: 0.9rem; font-weight: 600; margin-bottom: 0.5rem;">특가 할인</div>
                    <div style="font-size: 1.75rem; font-weight: 700; color: #2d3748; margin-bottom: 0.5rem;">₩150,000~</div>
                    <div style="color: #718096; font-size: 0.85rem; text-decoration: line-through; margin-bottom: 1rem;">₩200,000</div>
                    <button style="width: 100%; background: #3182ce; color: white; padding: 0.75rem 1rem; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; margin-bottom: 0.5rem;">
                      🛒 예약하기
                    </button>
                    <button style="width: 100%; background: transparent; color: #3182ce; padding: 0.75rem 1rem; border: 2px solid #3182ce; border-radius: 8px; font-weight: 600; cursor: pointer;">
                      💝 찜하기
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- 객실 정보 섹션 -->
            ${(() => {
              const roomsArr = Array.isArray(data.rooms) ? data.rooms : Array.isArray(data.rooms?.rooms) ? data.rooms.rooms : [];
              if (roomsArr.length > 0) {
                return `
                  <div class="info-section">
                    <h2>🛏️ 객실 정보</h2>
                    <div class="room-grid">
                      ${roomsArr.map(room => (
                        '<div class="room-card">' +
                          '<div class="room-name">' + (room.name || '이름 없음') + '</div>' +
                          '<div class="room-details">' +
                            (room.type ? '<div class="room-detail"><strong>타입:</strong> ' + room.type + '</div>' : '') +
                            (room.structure ? '<div class="room-detail"><strong>구조:</strong> ' + room.structure + '</div>' : '') +
                            (room.bedType ? '<div class="room-detail"><strong>베드:</strong> ' + room.bedType + '</div>' : '') +
                            (room.view ? '<div class="room-detail"><strong>전망:</strong> ' + room.view + '</div>' : '') +
                            (room.standardCapacity ? '<div class="room-detail"><strong>기본 인원:</strong> ' + room.standardCapacity + '명</div>' : '') +
                            (room.maxCapacity ? '<div class="room-detail"><strong>최대 인원:</strong> ' + room.maxCapacity + '</div>' : '') +
                          '</div>' +
                          (room.description ? '<div class="room-description"><strong>설명:</strong> ' + room.description + '</div>' : '') +
                        '</div>'
                      )).join('')}
                    </div>
                  </div>
                `;
              }
              return '';
            })()}
            
            <!-- 요금표 섹션 -->
            ${data.pricing ? `
              <div class="info-section">
                <h2>💰 요금표</h2>
                ${data.pricing.roomTypes && data.pricing.roomTypes.length > 0 ? `
                  <table class="pricing-table">
                    <thead>
                      <tr>
                        <th>객실 타입</th>
                        <th>기간</th>
                        <th>요금</th>
                        <th>비고</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${data.pricing.roomTypes.map(roomType => 
                        roomType.periods ? roomType.periods.map(period => 
                          '<tr>' +
                            '<td>' + (roomType.name || '이름 없음') + '</td>' +
                            '<td>' + (period.startDate || '') + ' ~ ' + (period.endDate || '') + '</td>' +
                            '<td>' + (period.price ? period.price.toLocaleString() + '원' : '가격 미정') + '</td>' +
                            '<td>' + (period.note || '') + '</td>' +
                          '</tr>'
                        ).join('') : ''
                      ).join('')}
                    </tbody>
                  </table>
                ` : '<p>등록된 요금 정보가 없습니다.</p>'}
              </div>
            ` : ''}
            
            <!-- 취소 정책 섹션 -->
            ${data.cancelPolicies && data.cancelPolicies.length > 0 ? `
              <div class="info-section">
                <h2>📋 취소 정책</h2>
                ${data.cancelPolicies.map(policy => 
                  '<div class="policy-item">' +
                    '<div class="policy-title">' + (policy.policyType || '정책') + '</div>' +
                    '<div class="policy-content">' +
                      (policy.description || '') +
                      (policy.cancellationFee ? '<br><strong>취소 수수료:</strong> ' + policy.cancellationFee : '') +
                      (policy.refundRate ? '<br><strong>환불 비율:</strong> ' + policy.refundRate + '%' : '') +
                      (policy.noticePeriod ? '<br><strong>사전 통보 기간:</strong> ' + policy.noticePeriod : '') +
                    '</div>' +
                  '</div>'
                ).join('')}
              </div>
            ` : ''}
            
            <!-- 시설 정보 섹션 -->
            ${data.facilities && Object.keys(data.facilities).length > 0 ? `
              <div class="info-section">
                <h2>✨ 시설 정보</h2>
                <div class="facility-grid">
                  ${Object.entries(data.facilities).map(([category, items]) => 
                    '<div class="facility-category">' +
                      '<h4>' + (category === 'general' ? '일반' : category === 'business' ? '비즈니스' : category === 'leisure' ? '레저' : category === 'dining' ? '식음료' : category) + '</h4>' +
                      '<div class="facility-list">' +
                        (Array.isArray(items) && items.length > 0 ? items.join(', ') : '시설 정보 없음') +
                      '</div>' +
                    '</div>'
                  ).join('')}
                </div>
              </div>
            ` : ''}
            
            <!-- 체크인/아웃 정보 섹션 -->
            ${data.checkin ? `
              <div class="info-section">
                <h2>🕐 체크인/아웃 정보</h2>
                <div class="checkin-info">
                  ${data.checkin.checkInTime ? '<div class="checkin-detail"><strong>체크인:</strong> ' + data.checkin.checkInTime + '</div>' : ''}
                  ${data.checkin.checkOutTime ? '<div class="checkin-detail"><strong>체크아웃:</strong> ' + data.checkin.checkOutTime + '</div>' : ''}
                  ${data.checkin.earlyCheckIn ? '<div class="checkin-detail"><strong>얼리체크인:</strong> ' + data.checkin.earlyCheckIn + '</div>' : ''}
                  ${data.checkin.lateCheckOut ? '<div class="checkin-detail"><strong>레이트체크아웃:</strong> ' + data.checkin.lateCheckOut + '</div>' : ''}
                  ${data.checkin.checkInLocation ? '<div class="checkin-detail"><strong>체크인장소:</strong> ' + data.checkin.checkInLocation + '</div>' : ''}
                  ${data.checkin.checkOutLocation ? '<div class="checkin-detail"><strong>체크아웃장소:</strong> ' + data.checkin.checkOutLocation + '</div>' : ''}
                  ${data.checkin.specialInstructions ? '<div class="checkin-detail"><strong>특별안내:</strong> ' + data.checkin.specialInstructions + '</div>' : ''}
                  ${data.checkin.requiredDocuments ? '<div class="checkin-detail"><strong>필요서류:</strong> ' + data.checkin.requiredDocuments + '</div>' : ''}
                  ${data.checkin.ageRestrictions ? '<div class="checkin-detail"><strong>연령제한:</strong> ' + data.checkin.ageRestrictions + '</div>' : ''}
                  ${data.checkin.petPolicy ? '<div class="checkin-detail"><strong>반려동물:</strong> ' + data.checkin.petPolicy + '</div>' : ''}
                </div>
              </div>
            ` : ''}
            
            <!-- 패키지 정보 섹션 -->
            ${data.packages && Array.isArray(data.packages) && data.packages.length > 0 ? `
              <div class="info-section">
                <h2>🎁 패키지 정보</h2>
                <div class="package-grid">
                  ${data.packages.map(pkg => 
                    '<div class="package-card">' +
                      '<div class="package-title">' + (pkg.name || '패키지명') + '</div>' +
                      '<div class="package-content">' +
                        (pkg.description || '') +
                        (pkg.price ? '<br><strong>가격:</strong> ' + pkg.price.toLocaleString() + '원' : '') +
                        (pkg.duration ? '<br><strong>기간:</strong> ' + pkg.duration : '') +
                      '</div>' +
                    '</div>'
                  ).join('')}
                </div>
              </div>
            ` : ''}
            
            <!-- 예약안내 섹션 -->
            ${data.bookingInfo ? `
              <div class="info-section">
                <h2>📞 ${data.bookingInfo.title || '예약안내'}</h2>
                <div class="booking-content">
                  <div class="purchase-guide-section">
                    <h3 style="color: #0c4a6e; margin-bottom: 15px; font-size: 1.2em;">📋 숙박권 구매안내</h3>
                    <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; border-left: 4px solid #0ea5e9; margin-bottom: 20px;">
                      <div style="white-space: pre-line; line-height: 1.8; color: #0c4a6e;">
                        ${data.bookingInfo.purchaseGuide || ''}
                      </div>
                    </div>
                  </div>
                  
                  <div class="reference-notes-section">
                    <h3 style="color: #92400e; margin-bottom: 15px; font-size: 1.2em;">📋 참고사항</h3>
                    <div style="background: #fef3c7; padding: 20px; border-radius: 8px; border-left: 4px solid #f59e0b; margin-bottom: 20px;">
                      <div style="white-space: pre-line; line-height: 1.8; color: #92400e;">
                        ${data.bookingInfo.referenceNotes || ''}
                      </div>
                    </div>
                  </div>
                  
                  ${data.bookingInfo.kakaoChannel ? `
                    <div class="kakao-channel-section" style="text-align: center; margin-top: 20px;">
                      <div style="background: #fbbf24; padding: 12px 24px; border-radius: 8px; color: #92400e; font-weight: 600; display: inline-block;">
                        💬 ${data.bookingInfo.kakaoChannel}
                      </div>
                    </div>
                  ` : ''}
                </div>
              </div>
            ` : ''}
            
            <!-- 생성 정보 -->
            <div class="generated-info">
              <p><strong>생성일시:</strong> ${new Date().toLocaleString('ko-KR')}</p>
              <p><strong>시스템:</strong> 호텔 정보 관리 시스템</p>
              <p><strong>버전:</strong> 1.0.0</p>
            </div>
          </div>
        </body>
        </html>
      `
      
      setGeneratedHtml(html)
      setLastGenerated(new Date())
      showNotificationHandler('HTML이 성공적으로 생성되었습니다.', 'success')
    } catch (error) {
      console.error('HTML 생성 실패:', error)
      showNotificationHandler('HTML 생성에 실패했습니다.', 'error')
    } finally {
      setIsGenerating(false)
    }
  }, [data, showNotificationHandler])

  // HTML 복사 함수
  const copyHtml = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(generatedHtml)
      showNotificationHandler('HTML이 클립보드에 복사되었습니다.', 'success')
    } catch (error) {
      console.error('복사 실패:', error)
      showNotificationHandler('복사에 실패했습니다.', 'error')
    }
  }, [generatedHtml, showNotificationHandler])

  // HTML 다운로드 함수
  const downloadHtml = useCallback(() => {
    let url = null
    let cleanup = null
    
    try {
      const blob = new Blob([generatedHtml], { type: 'text/html' })
      url = URL.createObjectURL(blob)
      
      const a = document.createElement('a')
      a.href = url
      a.download = `hotel-page-${new Date().toISOString().split('T')[0]}.html`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      
      showNotificationHandler('HTML이 성공적으로 다운로드되었습니다.', 'success')
      
      // cleanup 함수 등록
      cleanup = () => {
        if (url) {
          URL.revokeObjectURL(url)
          url = null
        }
      }
      registerCleanup(cleanup)
      
    } catch (error) {
      console.error('다운로드 실패:', error)
      showNotificationHandler('다운로드에 실패했습니다.', 'error')
      
      // 오류 발생 시에도 cleanup
      if (url) {
        URL.revokeObjectURL(url)
      }
    }
  }, [generatedHtml, showNotificationHandler, registerCleanup])

  // 활성 탭 데이터 변경 핸들러 메모이제이션
  const handleActiveTabChange = useCallback(
    (newData) => {
      updateData(activeTab, newData)
    },
    [activeTab, updateData]
  )

  // 컴포넌트 언마운트 시 cleanup
  useEffect(() => {
    return () => {
      // 메모리 정리
      if (monitoringWSRef.current) {
        monitoringWSRef.current.close()
        monitoringWSRef.current = null
      }
      // 알림 timeout 정리
      if (notificationTimeoutRef.current) {
        clearTimeout(notificationTimeoutRef.current)
        notificationTimeoutRef.current = null
      }
      setNotification({ show: false, message: '', type: 'success' })
      // HTML blob URL 정리
      if (generatedHtml) {
        setGeneratedHtml('')
      }
    }
  }, [generatedHtml])

  // 자동 디버깅 시스템
  const autoDebug = useCallback(() => {
    console.log('🔍 === 자동 디버깅 시스템 시작 ===');
    
    // 현재 상태 분석
    const debugInfo = {
      activeTab,
      dataKeys: Object.keys(data),
      dataValues: data,
      hasData: Object.keys(data).length > 0,
      currentTabData: data[activeTab],
      currentTabDataKeys: data[activeTab] ? Object.keys(data[activeTab]) : [],
      currentTabDataLength: data[activeTab] ? Object.keys(data[activeTab]).length : 0
    };
    
    console.log('🔍 디버깅 정보:', debugInfo);
    
    // 문제점 자동 감지
    const issues = [];
    
    if (!activeTab) {
      issues.push('❌ activeTab이 설정되지 않음');
    }
    
    if (!data[activeTab]) {
      issues.push(`❌ ${activeTab} 탭의 데이터가 없음`);
    } else if (Object.keys(data[activeTab]).length === 0) {
      issues.push(`❌ ${activeTab} 탭의 데이터가 비어있음`);
    }
    
    if (issues.length > 0) {
      console.log('🔍 발견된 문제점들:');
      issues.forEach(issue => console.log(issue));
    } else {
      console.log('✅ 모든 상태가 정상입니다');
    }
    
    return { debugInfo, issues };
  }, [activeTab, data]);
  
  // 컴포넌트 마운트 시 자동 디버깅 실행
  useEffect(() => {
    if (mounted) {
      console.log('🚀 컴포넌트 마운트됨, 자동 디버깅 실행');
      autoDebug();
    }
  }, [mounted, autoDebug]);

  // 글로벌 트리거 함수: 섹션별 미리보기 생성 트리거
  useEffect(() => {
    window.triggerPreview = (sectionType) => {
      console.log('[App] triggerPreview called for', sectionType);
      setPreviewRefreshKey(Date.now());
    };
    return () => {
      try { delete window.triggerPreview } catch (e) {}
    };
  }, []);
  
  // activeTab 변경 시 자동 디버깅 실행
  useEffect(() => {
    if (mounted && activeTab) {
      console.log(`🔄 탭 변경됨: ${activeTab}, 자동 디버깅 실행`);
      autoDebug();
    }
  }, [activeTab, mounted, autoDebug]);

  // 현재 활성 탭의 컴포넌트 렌더링
  const renderActiveTabContent = () => {
    // 디버그: 현재 activeTab과 해당 데이터 출력
    if (typeof window !== 'undefined') {
      try {
        console.debug('[Preview Debug] renderActiveTabContent activeTab:', activeTab, 'dataForTab:', data?.[activeTab])
      } catch (e) {
        console.debug('[Preview Debug] renderActiveTabContent error reading data')
      }
    }
    const Component = getComponentForTab(activeTab)
    
    if (!Component) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-500">선택된 탭에 대한 컴포넌트를 찾을 수 없습니다.</p>
        </div>
      )
    }

    if (isModalTab(activeTab)) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-500">이 탭은 모달로 표시됩니다.</p>
          <Button
            color="primary"
            variant="flat"
            onPress={onModalOpen}
          >
            모달 열기
          </Button>
        </div>
      )
    }

    const valueForTab = activeTab === 'hotel'
      ? data.hotel
      : activeTab === 'booking'
        ? data.bookingInfo
        : data[activeTab]



    console.log('=== renderActiveTabContent 디버깅 ===');
    console.log('activeTab:', activeTab);
    console.log('valueForTab:', valueForTab);
    console.log('onChangeForTab 함수:', onChangeForTab);
    console.log('Component:', Component);

    return (
      <Component
        value={valueForTab}
        onChange={onChangeForTab}
        displayMode={false}
      />
    )
  }

  // 모달 내용 렌더링
  const renderModalContent = () => {
    const Component = getComponentForTab(activeTab)
    
    if (!Component) return null

    const valueForTab = activeTab === 'hotel'
      ? data.hotel
      : activeTab === 'booking'
        ? data.bookingInfo
        : data[activeTab]

    return (
      <Component
        value={valueForTab}
        onChange={onChangeForTab}
        displayMode={false}
      />
    )
  }

  if (!mounted) {
    return <LoadingSpinner size="large" />
  }

  return (
    <MainLayout 
      onGenerateHtml={generateHtml}
      isGenerating={isGenerating}
      generatedHtml={generatedHtml}
      lastGenerated={lastGenerated}
      onExportData={exportData}
      onImportData={importData}
      data={data}
      activeTab={activeTab}
    >
      {/* 알림 표시 */}
      {notification.show && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
          notification.type === 'success' ? 'bg-green-500 text-white' :
          notification.type === 'error' ? 'bg-red-500 text-white' :
          'bg-blue-500 text-white'
        }`}>
          <div className="flex items-center justify-between">
            <span>{notification.message}</span>
            <Button
              size="sm"
              variant="light"
              onPress={hideNotificationHandler}
              className="ml-4"
            >
              ✕
            </Button>
          </div>
        </div>
      )}

      {/* 메인 콘텐츠 */}
      <div className="space-y-6">
        {/* 헤더 섹션 */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">호텔 정보 관리</h1>
            <p className="text-gray-600 mt-2">현재 탭: {getActiveTabInfo()?.label}</p>
            <p className="text-sm text-blue-600 mt-1">모든 정보를 입력한 후 상단의 생성 버튼을 클릭하세요</p>
          </div>
          
          <div className="flex flex-col gap-3">
            <div className="flex gap-2">
              <MonitoringDashboard />
              
              {/* 통합 생성 버튼 */}
              <Button
                size="lg"
                color="primary"
                variant="solid"
                onPress={generateHtml}
                isLoading={isGenerating}
                className="font-bold px-6"
              >
                🎯 전체 미리보기 생성
              </Button>
              
              {/* 템플릿 관리 버튼 */}
              <TemplateManager 
                onLoadTemplate={(templateData) => {
                  // 템플릿 데이터를 현재 상태에 로드
                  Object.keys(templateData).forEach(key => {
                    updateData(key, templateData[key]);
                  });
                }}
                onSaveTemplate={(savedTemplate) => {
                  console.log('템플릿 저장 완료:', savedTemplate);
                }}
              />
              
              {/* 백업/복원 버튼 추가 */}
              <Button
                size="sm"
                color="warning"
                variant="flat"
                onPress={() => setShowBackupModal(true)}
              >
                💾 백업/복원
              </Button>
            </div>
            
            {/* 생성 버튼 설명 */}
            <div className="text-center p-2 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-xs text-blue-700">
                💡 모든 탭의 정보를 입력한 후 이 버튼을 클릭하면 전체 HTML 미리보기가 생성됩니다
              </p>
            </div>
          </div>
        </div>

        {/* 탭 네비게이션 */}
        <ClientOnly>
          <DraggableTabs
            tabs={getOrderedTabs()}
            activeTab={activeTab}
            onTabClick={activateTab}
            onOrderChange={moveTab}
            mounted={mounted}
          />
        </ClientOnly>

        {/* 2단 레이아웃: 왼쪽 편집, 오른쪽 미리보기 */}
        <div className="flex gap-6">
          {/* 왼쪽: 탭 콘텐츠 */}
          <div className="flex-1 bg-white rounded-lg shadow-sm border border-gray-200 p-6 min-w-0">
            {renderActiveTabContent()}
          </div>
          
          {/* 오른쪽: 미리보기 (모바일 사이즈) */}
          <div className="w-[375px] flex-shrink-0 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">개별 미리보기</h3>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  color="secondary"
                  variant="flat"
                  onPress={onPreviewOpen}
                >
                  전체화면
                </Button>
                <Button
                  size="sm"
                  color="primary"
                  variant="flat"
                  onPress={() => {
                    // 복사 기능
                    navigator.clipboard.writeText(JSON.stringify(data[activeTab], null, 2));
                    showNotificationHandler('데이터가 클립보드에 복사되었습니다.');
                  }}
                >
                  복사
                </Button>
              </div>
            </div>
            <div className="border rounded-lg p-3 bg-gray-100 min-h-[400px] overflow-hidden">
              <Preview data={data} activeTab={activeTab} />
            </div>
          </div>
        </div>
      </div>

      {/* 모달들 */}
      <Modal isOpen={isModalOpen} onClose={onModalClose} size="5xl">
        <ModalContent>
          <ModalHeader>
            {getActiveTabInfo()?.label} - 상세 편집
          </ModalHeader>
          <ModalBody>
            {renderModalContent()}
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onModalClose}>
              닫기
            </Button>
            <Button color="primary" onPress={onModalClose}>
              저장
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* 미리보기 모달 */}
      <Modal isOpen={isPreviewOpen} onClose={onPreviewClose} size="4xl">
        <ModalContent className="max-w-6xl mx-auto">
          <ModalHeader>HTML 미리보기</ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  {lastGenerated ? `마지막 생성: ${lastGenerated.toLocaleString()}` : 'HTML이 자동으로 생성되었습니다.'}
                </div>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    color="secondary"
                    variant="flat"
                    onPress={copyHtml}
                    isDisabled={!generatedHtml || isGenerating}
                  >
                    복사
                  </Button>
                  <Button
                    size="sm"
                    color="primary"
                    variant="flat"
                    onPress={downloadHtml}
                    isDisabled={!generatedHtml || isGenerating}
                  >
                    다운로드
                  </Button>
                </div>
              </div>
              
              {/* 디바이스 선택 */}
              <div className="flex justify-center space-x-4">
                <Button
                  size="sm"
                  variant={device === 'desktop' ? 'solid' : 'flat'}
                  color={device === 'desktop' ? 'primary' : 'default'}
                  onPress={() => setDevice('desktop')}
                >
                  🖥️ Desktop (1200px)
                </Button>
                <Button
                  size="sm"
                  variant={device === 'tablet' ? 'solid' : 'flat'}
                  color={device === 'tablet' ? 'primary' : 'default'}
                  onPress={() => setDevice('tablet')}
                >
                  📱 Tablet (768px)
                </Button>
                <Button
                  size="sm"
                  variant={device === 'mobile' ? 'solid' : 'flat'}
                  color={device === 'mobile' ? 'primary' : 'default'}
                  onPress={() => setDevice('mobile')}
                >
                  📱 Mobile (375px)
                </Button>
              </div>
              
              {/* HTML 생성 중 로딩 상태 */}
              {isGenerating && (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">HTML을 생성하고 있습니다...</p>
                </div>
              )}
              
              {/* 전체 페이지 미리보기 */}
              {generatedHtml && !isGenerating ? (
                <div className="border rounded-lg overflow-hidden bg-white">
                  <div className="bg-gray-100 px-4 py-2 border-b text-sm text-gray-600">
                    <span className="font-medium">현재 탭:</span> {getActiveTabInfo()?.label || '알 수 없음'} | 
                    <span className="font-medium ml-2">디바이스:</span> {
                      device === 'desktop' ? 'Desktop (1200px)' :
                      device === 'tablet' ? 'Tablet (768px)' :
                      'Mobile (375px)'
                    }
                  </div>
                  <div className="flex justify-center bg-gray-200 p-4">
                    <div 
                      className="bg-white shadow-lg overflow-hidden"
                      style={{
                        width: device === 'desktop' ? '100%' : 
                               device === 'tablet' ? '768px' : '375px',
                        maxWidth: '100%'
                      }}
                    >
                      <iframe
                        title="html-preview"
                        srcDoc={generatedHtml}
                        sandbox="allow-same-origin allow-popups allow-forms allow-scripts"
                        className="w-full"
                        style={{ 
                          height: device === 'desktop' ? '70vh' : 
                                   device === 'tablet' ? '80vh' : '90vh',
                          border: 'none'
                        }}
                      />
                    </div>
                  </div>
                </div>
              ) : !isGenerating ? (
                <div className="text-center text-gray-500 py-16">
                  <p className="mb-2">HTML 생성에 실패했습니다.</p>
                  <p className="text-sm">다시 시도해주세요.</p>
                </div>
              ) : null}
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onPreviewClose}>
              닫기
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* 설정 모달 */}
      <Modal isOpen={isSettingsOpen} onClose={onSettingsClose} size="2xl">
        <ModalContent>
          <ModalHeader>시스템 설정</ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  시스템 이름
                </label>
                <Input
                  placeholder="시스템 이름을 입력하세요"
                  defaultValue="호텔 정보 관리 시스템"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  테마 설정
                </label>
                <Select placeholder="테마를 선택하세요">
                  <SelectItem key="light">라이트 모드</SelectItem>
                  <SelectItem key="dark">다크 모드</SelectItem>
                  <SelectItem key="auto">자동</SelectItem>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  언어 설정
                </label>
                <Select placeholder="언어를 선택하세요">
                  <SelectItem key="ko">한국어</SelectItem>
                  <SelectItem key="en">English</SelectItem>
                  <SelectItem key="ja">日本語</SelectItem>
                </Select>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onSettingsClose}>
              취소
            </Button>
            <Button color="primary" onPress={onSettingsClose}>
              저장
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </MainLayout>
  );
});

export default MemoizedHome;
