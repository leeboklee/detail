'use client'

import React, { useState, useCallback, useEffect, Suspense, useRef, lazy } from 'react'
import { Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, Card, CardBody, Input, Textarea, Select, SelectItem, Chip, Divider, Spinner } from "@heroui/react"

// 핵심 컴포넌트들은 즉시 로딩 (안정성 확보)
import { HotelInfoSection } from '@/components/sections/HotelInfoSection'
import DraggableTabs from '@/components/DraggableTabs'
import ClientOnly from '@/components/ClientOnly'

// 안전한 lazy loading (에러 처리 포함)
const ErrorCollectorComponent = lazy(() => import('@/components/ErrorCollector').catch(() => ({ default: () => null })))
const RoomInfoEditor = lazy(() => import('@/components/room/RoomInfoEditor').catch(() => ({ default: () => null })))
const FacilitiesInfo = lazy(() => import('@/components/facilities/FacilitiesInfo').catch(() => ({ default: () => null })))
const CheckInOutInfo = lazy(() => import('@/components/checkin/CheckInOutInfo').catch(() => ({ default: () => null })))
const Package = lazy(() => import('@/components/package/Package').catch(() => ({ default: () => null })))
const PriceTable = lazy(() => import('@/components/price/PriceTable').catch(() => ({ default: () => null })))
const CancelPolicy = lazy(() => import('@/components/cancel/CancelPolicy').catch(() => ({ default: () => null })))
const BookingConfirmation = lazy(() => import('@/components/policy/BookingConfirmation').catch(() => ({ default: () => null })))
const Notice = lazy(() => import('@/components/notice/Notice').catch(() => ({ default: () => null })))
const EmbeddedBrowser = lazy(() => import('@/components/ui/EmbeddedBrowser').catch(() => ({ default: () => null })))
const DBStatusIndicator = lazy(() => import('@/components/DBStatusIndicator').catch(() => ({ default: () => null })))

// 인라인 편집 컴포넌트
const InlineRoomEditor = lazy(() => import('@/components/inline/InlineRoomEditor').catch(() => ({ default: () => null })))
const InlineFacilitiesEditor = lazy(() => import('@/components/inline/InlineFacilitiesEditor').catch(() => ({ default: () => null })))
const InlinePackageEditor = lazy(() => import('@/components/inline/InlinePackageEditor').catch(() => ({ default: () => null })))
const InlineNoticeEditor = lazy(() => import('@/components/inline/InlineNoticeEditor').catch(() => ({ default: () => null })))
const InlinePricingEditor = lazy(() => import('@/components/inline/InlinePricingEditor').catch(() => ({ default: () => null })))

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

// 아이콘 대신 이모지 사용 (일관성 유지)
const Icons = {
  settings: '⚙️',
  eye: '👁️',
  copy: '📋',
  refresh: '🔄',
  database: '🗄️',
  home: '🏠',
  users: '👥',
  dollar: '💰',
  file: '📄',
  calendar: '📅',
  shield: '🛡️',
  plus: '➕',
  edit: '✏️',
  delete: '🗑️',
  save: '💾',
  download: '📥',
  upload: '📤',
  check: '✅',
  warning: '⚠️',
  info: 'ℹ️'
}

// 초기 데이터
const INITIAL_DATA = {
  hotel: {
    name: '샘플 호텔',
    address: '서울시 강남구 테헤란로 123',
    description: '편안하고 아늑한 도심 속 휴식공간입니다.',
    phone: '02-1234-5678',
    imageUrl: '',
    email: '',
    website: ''
  },
  rooms: [
    {
      name: '스탠다드',
      type: '스탠다드',
      structure: '원룸',
      bedType: '퀸 베드 1개',
      view: '시티뷰',
      standardCapacity: 2,
      maxCapacity: 2,
      description: '편안한 숙면을 위한 퀸 베드가 구비된 스탠다드 룸입니다.',
      image: '',
      amenities: ['무료 Wi-Fi', '에어컨', 'TV', '미니바']
    }
  ],
  facilities: {
    general: ['무료 Wi-Fi', '24시간 프런트 데스크', '엘리베이터'],
    business: ['비즈니스 센터', '회의실'],
    leisure: ['피트니스 센터', '사우나'],
    dining: ['레스토랑', '카페', '룸서비스']
  },
  checkin: {
    checkInTime: '15:00',
    checkOutTime: '11:00',
    earlyCheckIn: '추가 요금 발생',
    lateCheckOut: '추가 요금 발생'
  },
  packages: [{
    name: '로맨틱 패키지',
    description: '커플을 위한 특별한 패키지',
    price: 150000,
    includes: ['샴페인', '꽃다발', '늦은 체크아웃'],
    salesPeriod: {
      start: '2025.08.04',
      end: '08.31'
    },
    stayPeriod: {
      start: '2025.08.24',
      end: '09.30'
    },
    productComposition: '객실 1박',
    notes: ['투숙 시 제공되는 상품 세부 구성에 대한 부분 협의를 불가합니다.'],
    constraints: ['성인 2명 기준', '추가 인원 시 별도 요금']
  }],
  pricing: {
    lodges: [{
      name: '샘플 호텔',
      rooms: [{
        roomType: '스탠다드',
        view: '시티뷰',
        prices: {
          weekday: 100000,
          friday: 120000,
          saturday: 150000
        }
      }]
    }],
    dayTypes: [
      { id: 'weekday', name: '주중(월~목)', type: 'weekday' },
      { id: 'friday', name: '금요일', type: 'friday' },
      { id: 'saturday', name: '토요일', type: 'saturday' }
    ]
  },
  cancel: {
    freeCancellation: '체크인 7일 전까지 무료 취소',
    cancellationFee: '체크인 3일 전~당일: 첫날 요금의 100%',
    noShow: '노쇼 시 전액 청구',
    modificationPolicy: '날짜 변경은 체크인 3일 전까지 가능'
  },
  booking: {
    reservationMethod: '온라인 예약 시스템',
    paymentMethods: ['신용카드', '계좌이체', '현금'],
    confirmationTime: '예약 후 24시간 이내 확인',
    specialRequests: '체크인 시 요청사항 전달 가능'
  },
  notices: [{
    title: '중요 안내',
    content: '체크인 시 신분증을 지참해 주세요.',
    type: 'important'
  }]
}

// 탭 설정 - 인라인/모달 구분 (컴포넌트 참조 제거)
const TAB_CONFIG = [
  { key: 'hotel', label: '호텔 정보', icon: Icons.home, displayType: 'modal' },
  { key: 'rooms', label: '객실 정보', icon: Icons.users, displayType: 'modal' },
  { key: 'facilities', label: '시설 정보', icon: Icons.settings, displayType: 'inline' },
  { key: 'checkin', label: '체크인/아웃', icon: Icons.calendar, displayType: 'inline' },
  { key: 'packages', label: '패키지', icon: Icons.file, displayType: 'modal' },
  { key: 'pricing', label: '요금표', icon: Icons.dollar, displayType: 'modal' },
  { key: 'cancel', label: '취소규정', icon: Icons.shield, displayType: 'inline' },
  { key: 'booking', label: '예약안내', icon: Icons.database, displayType: 'inline' },
  { key: 'notices', label: '공지사항', icon: Icons.file, displayType: 'modal' }
]

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
    case 'booking':
      return BookingConfirmation
    case 'notices':
      return Notice
    default:
      return null
  }
}

// 성능 최적화: 모든 컴포넌트를 lazy loading으로 처리

// 성능 최적화를 위한 메모이제이션
const MemoizedHome = React.memo(function Home() {
  const [data, setData] = useState(INITIAL_DATA)
  const [activeTab, setActiveTab] = useState('hotel') // 하이드레이션 에러 방지를 위해 항상 고정값 사용
  const [generatedHtml, setGeneratedHtml] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [lastGenerated, setLastGenerated] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' })
  const [notices, setNotices] = useState([])
  const [mounted, setMounted] = useState(false)
  const [tabOrder, setTabOrder] = useState(TAB_CONFIG.map(tab => tab.key))
  const [isDragMode, setIsDragMode] = useState(false)
  const [isMonitoringConnected, setIsMonitoringConnected] = useState(false)
  const [showMonitoringDashboard, setShowMonitoringDashboard] = useState(false) // 모니터링 대시보드 토글
  const [monitoringErrors, setMonitoringErrors] = useState([]) // 모니터링 오류 목록
  const monitoringWSRef = useRef(null)
  
  const { isOpen: isModalOpen, onOpen: onModalOpen, onClose: onModalClose } = useDisclosure()
  const { isOpen: isPreviewOpen, onOpen: onPreviewOpen, onClose: onPreviewClose } = useDisclosure()
  const { isOpen: isSettingsOpen, onOpen: onSettingsOpen, onClose: onSettingsClose } = useDisclosure()
  const { isOpen: isHotelModalOpen, onOpen: onHotelModalOpen, onClose: onHotelModalClose } = useDisclosure()

  // 마운트 상태 초기화 (hydration 에러 방지)
  useEffect(() => {
    setMounted(true)
    // 클라이언트에서만 localStorage에서 activeTab 복원
    const savedActiveTab = localStorage.getItem('activeTab')
    if (savedActiveTab) {
      setActiveTab(savedActiveTab)
    }
    // 클라이언트에서만 탭 순서 복원 (초기 hydration 이후 적용)
    const savedOrder = localStorage.getItem('tabOrder')
    if (savedOrder) {
      try {
        const parsed = JSON.parse(savedOrder)
        if (Array.isArray(parsed) && parsed.length) setTabOrder(parsed)
      } catch {}
    }
  }, [])

  // 데이터 업데이트 함수
  const updateData = useCallback((key, newData) => {
    console.log('🔧 updateData 호출:', { key, newData, currentData: data[key] });
    setData(prev => {
      const updated = {
        ...prev,
        [key]: newData
      };
      console.log('🔧 데이터 업데이트 완료:', { key, oldValue: prev[key], newValue: updated[key] });
      return updated;
    })
  }, [data])

  // 탭 순서 변경 함수
  const moveTab = useCallback((fromIndex, toIndex) => {
    setTabOrder(prev => {
      const newOrder = [...prev]
      const [movedTab] = newOrder.splice(fromIndex, 1)
      newOrder.splice(toIndex, 0, movedTab)
      
      // 로컬 스토리지에 저장 (클라이언트에서만)
      if (typeof window !== 'undefined') {
        localStorage.setItem('tabOrder', JSON.stringify(newOrder))
      }
      
      setNotification({
        show: true,
        message: '탭 순서가 변경되었습니다.',
        type: 'success'
      })
      
      return newOrder
    })
  }, [])

  // 모니터링 연결 함수
  const connectMonitoring = useCallback(() => {
    try {
      // WebSocket 연결 시도
      const ws = new WebSocket('ws://localhost:3901')
      monitoringWSRef.current = ws
      
      ws.onopen = () => {
        console.log('✅ 모니터링 연결 성공!')
        setIsMonitoringConnected(true)
        setNotification({
          show: true,
          message: '✅ 실시간 모니터링이 연결되었습니다!',
          type: 'success'
        })
        
        // 오류 수집 시작
        const originalError = console.error
        const originalWarn = console.warn
        
        console.error = function(...args) {
          const message = args.join(' ')
          
          // Hydration 오류 감지
          if (message.includes('Text content does not match server-rendered HTML') ||
              message.includes('Server:') && message.includes('Client:')) {
            ws.send(JSON.stringify({
              type: 'hydration-error',
              message: message,
              priority: 'high',
              timestamp: new Date().toISOString()
            }))
            console.log('🔍 Hydration 오류 감지됨:', message)
          }
          
          // 일반 오류도 전송
          ws.send(JSON.stringify({
            type: 'console-error',
            message: message,
            priority: 'high',
            timestamp: new Date().toISOString()
          }))
          
          originalError.apply(console, args)
        }
        
        console.warn = function(...args) {
          const message = args.join(' ')
          ws.send(JSON.stringify({
            type: 'console-warn',
            message: message,
            priority: 'medium',
            timestamp: new Date().toISOString()
          }))
          originalWarn.apply(console, args)
        }
        
        // 전역 오류 이벤트 리스너
        window.addEventListener('error', (event) => {
          const errorMessage = event.message || ''
          
          if (errorMessage.includes('Text content does not match server-rendered HTML') ||
              errorMessage.includes('hydration') ||
              (errorMessage.includes('Server:') && errorMessage.includes('Client:'))) {
            ws.send(JSON.stringify({
              type: 'hydration-error',
              message: errorMessage,
              priority: 'high',
              timestamp: new Date().toISOString()
            }))
            console.log('🔍 Hydration 오류 감지됨:', errorMessage)
          }
          
          ws.send(JSON.stringify({
            type: 'window-error',
            message: errorMessage,
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno,
            priority: 'high',
            timestamp: new Date().toISOString()
          }))
        })
        
        // Promise 오류 리스너
        window.addEventListener('unhandledrejection', (event) => {
          ws.send(JSON.stringify({
            type: 'unhandled-rejection',
            message: event.reason?.toString() || 'Unknown rejection',
            priority: 'high',
            timestamp: new Date().toISOString()
          }))
        })
        
        // 네트워크 요청 모니터링
        const originalFetch = window.fetch
        window.fetch = function(...args) {
          const startTime = Date.now()
          const url = args[0]
          
          return originalFetch.apply(this, args).then(response => {
            const endTime = Date.now()
            const duration = endTime - startTime
            
            ws.send(JSON.stringify({
              type: 'network-request',
              url: url,
              method: 'GET',
              status: response.status,
              statusText: response.statusText,
              duration: duration,
              timestamp: new Date().toISOString()
            }))
            
            return response
          }).catch(error => {
            const endTime = Date.now()
            const duration = endTime - startTime
            
            ws.send(JSON.stringify({
              type: 'network-error',
              url: url,
              method: 'GET',
              error: error.message,
              duration: duration,
              timestamp: new Date().toISOString()
            }))
            
            throw error
          })
        }
        
        // XMLHttpRequest 모니터링
        const originalXHROpen = XMLHttpRequest.prototype.open
        const originalXHRSend = XMLHttpRequest.prototype.send
        
        XMLHttpRequest.prototype.open = function(method, url, ...args) {
          this._monitorData = { method, url, startTime: Date.now() }
          return originalXHROpen.apply(this, [method, url, ...args])
        }
        
        XMLHttpRequest.prototype.send = function(...args) {
          const xhr = this
          const monitorData = xhr._monitorData
          
          xhr.addEventListener('load', function() {
            const endTime = Date.now()
            const duration = endTime - monitorData.startTime
            
            ws.send(JSON.stringify({
              type: 'network-request',
              url: monitorData.url,
              method: monitorData.method,
              status: xhr.status,
              statusText: xhr.statusText,
              duration: duration,
              timestamp: new Date().toISOString()
            }))
          })
          
          xhr.addEventListener('error', function() {
            const endTime = Date.now()
            const duration = endTime - monitorData.startTime
            
            ws.send(JSON.stringify({
              type: 'network-error',
              url: monitorData.url,
              method: monitorData.method,
              error: 'Network error',
              duration: duration,
              timestamp: new Date().toISOString()
            }))
          })
          
          return originalXHRSend.apply(this, args)
        }
        
        // DOM 변경 감지
        const observer = new MutationObserver((mutations) => {
          mutations.forEach((mutation) => {
            if (mutation.type === 'childList') {
              mutation.addedNodes.forEach((node) => {
                if (node.nodeType === Node.ELEMENT_NODE) {
                  const hydrationElements = node.querySelectorAll('[data-hydration-error], .hydration-error')
                  if (hydrationElements.length > 0) {
                    ws.send(JSON.stringify({
                      type: 'hydration-error',
                      message: 'DOM에서 Hydration 오류 요소 발견',
                      priority: 'high',
                      timestamp: new Date().toISOString()
                    }))
                  }
                }
              })
            }
          })
        })
        
        observer.observe(document.body, {
          childList: true,
          subtree: true,
          attributes: true
        })
        
        // 주기적 체크
        setInterval(() => {
          const hydrationErrors = document.querySelectorAll('[data-hydration-error], .hydration-error')
          if (hydrationErrors.length > 0) {
            ws.send(JSON.stringify({
              type: 'hydration-error',
              message: '주기적 체크에서 Hydration 오류 발견',
              priority: 'high',
              timestamp: new Date().toISOString()
            }))
          }
        }, 3000)
        
        // 명령어 실행 함수
        window.executeFixCommand = function(command) {
          console.log('🔧 명령어 실행:', command)
          
          switch(command) {
            case 'fix-hydration':
              console.log('🔄 Hydration 오류 수정: 페이지 새로고침')
              window.location.reload()
              break
            case 'reload':
              console.log('🔄 페이지 새로고침')
              window.location.reload()
              break
            case 'clear-storage':
              console.log('🗑️ 로컬 스토리지 클리어')
              localStorage.clear()
              sessionStorage.clear()
              break
            default:
              console.log('❌ 알 수 없는 명령어:', command)
          }
        }
        
        // WebSocket 메시지 수신
        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data)
            if (data.type === 'fix-command' && window.executeFixCommand) {
              window.executeFixCommand(data.command)
            }
            
            // 오류 데이터 수집
            if (data.type && data.message) {
              setMonitoringErrors(prev => [{
                ...data,
                id: Date.now() + Math.random()
              }, ...prev.slice(0, 49)]) // 최대 50개 유지
            }
          } catch (error) {
            console.error('❌ WebSocket 메시지 처리 오류:', error)
          }
        }
      }
      
      ws.onclose = () => {
        console.log('❌ 모니터링 연결 해제됨')
        setIsMonitoringConnected(false)
        setNotification({
          show: true,
          message: '❌ 모니터링 연결이 해제되었습니다.',
          type: 'warning'
        })
        monitoringWSRef.current = null
      }
      
      ws.onerror = (error) => {
        console.error('❌ WebSocket 오류:', error)
        setIsMonitoringConnected(false)
        setNotification({
          show: true,
          message: '❌ 모니터링 연결에 실패했습니다.',
          type: 'danger'
        })
      }
      
    } catch (error) {
      console.error('❌ 모니터링 연결 실패:', error)
      setNotification({
        show: true,
        message: '❌ 모니터링 서버에 연결할 수 없습니다.',
        type: 'danger'
      })
    }
  }, [])
  
  // 탭 순서 초기화 함수
  const resetTabOrder = useCallback(() => {
    const defaultOrder = TAB_CONFIG.map(tab => tab.key)
    setTabOrder(defaultOrder)
    if (typeof window !== 'undefined') {
      localStorage.setItem('tabOrder', JSON.stringify(defaultOrder))
    }
    setNotification({
      show: true,
      message: '탭 순서가 초기화되었습니다.',
      type: 'success'
    })
  }, [])

  // 데이터 저장 함수
  const saveData = useCallback(async () => {
    setIsLoading(true)
    try {
      // 로컬 스토리지에 저장
      localStorage.setItem('hotelData', JSON.stringify(data))
      
      // DB에 저장
      const response = await fetch('/api/hotels', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: data.hotel.name,
          address: data.hotel.address,
          description: data.hotel.description,
          phone: data.hotel.phone,
          email: data.hotel.email,
          website: data.hotel.website,
          imageUrl: data.hotel.imageUrl,
          rooms: data.rooms,
          facilities: data.facilities,
          checkin: data.checkin,
          packages: data.packages,
          pricing: data.pricing,
          cancel: data.cancel,
          booking: data.booking,
          notices: data.notices
        })
      })
      
      const result = await response.json()
      
      if (result.success) {
        setNotification({
          show: true,
          message: '데이터가 로컬 스토리지와 DB에 성공적으로 저장되었습니다.',
          type: 'success'
        })
      } else {
        setNotification({
          show: true,
          message: `DB 저장 실패: ${result.message}`,
          type: 'error'
        })
      }
    } catch (error) {
      console.error('저장 오류:', error)
      setNotification({
        show: true,
        message: '데이터 저장 중 오류가 발생했습니다.',
        type: 'error'
      })
    } finally {
      setIsLoading(false)
    }
  }, [data])

  // 데이터 로드 함수
  const loadData = useCallback(async () => {
    setIsLoading(true)
    try {
      // 먼저 로컬 스토리지에서 로드
      const savedData = localStorage.getItem('hotelData')
      if (savedData) {
        setData(JSON.parse(savedData))
        setNotification({
          show: true,
          message: '로컬 스토리지에서 데이터를 로드했습니다.',
          type: 'success'
        })
      } else {
        // DB에서 최신 데이터 로드 시도
        try {
          const response = await fetch('/api/hotels')
          const result = await response.json()
          
          if (result.success && result.data && result.data.length > 0) {
            // 가장 최근 호텔 데이터 사용
            const latestHotel = result.data[result.data.length - 1]
            setData({
              hotel: {
                name: latestHotel.name || '',
                address: latestHotel.address || '',
                description: latestHotel.description || '',
                phone: latestHotel.phone || '',
                email: latestHotel.email || '',
                website: latestHotel.website || '',
                imageUrl: latestHotel.imageUrl || ''
              },
              rooms: latestHotel.rooms || [],
              facilities: latestHotel.facilities || {},
              checkin: latestHotel.checkin || {},
              packages: latestHotel.packages || [],
              pricing: latestHotel.pricing || {},
              cancel: latestHotel.cancel || {},
              booking: latestHotel.booking || {},
              notices: latestHotel.notices || []
            })
            setNotification({
              show: true,
              message: 'DB에서 데이터를 로드했습니다.',
              type: 'success'
            })
          } else {
            setNotification({
              show: true,
              message: '저장된 데이터가 없습니다.',
              type: 'warning'
            })
          }
        } catch (dbError) {
          console.error('DB 로드 오류:', dbError)
          setNotification({
            show: true,
            message: 'DB 연결에 실패했습니다. 로컬 데이터만 사용합니다.',
            type: 'warning'
          })
        }
      }
    } catch (error) {
      setNotification({
        show: true,
        message: '데이터 로드 중 오류가 발생했습니다.',
        type: 'error'
      })
    } finally {
      setIsLoading(false)
    }
  }, [])

  // HTML 생성 함수
  const generateHTML = useCallback(async () => {
    setIsGenerating(true)
    try {
      // 간단한 HTML 생성 로직
      const html = `
        <!DOCTYPE html>
        <html lang="ko">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${data.hotel.name}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
            .hotel-info { background: #f5f5f5; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
            .section { margin-bottom: 20px; }
            h1, h2 { color: #333; }
          </style>
        </head>
        <body>
          <div class="hotel-info">
            <h1>${data.hotel.name}</h1>
            <p><strong>주소:</strong> ${data.hotel.address}</p>
            <p><strong>전화:</strong> ${data.hotel.phone}</p>
            <p>${data.hotel.description}</p>
          </div>
          
          <div class="section">
            <h2>객실 정보</h2>
            ${data.rooms.map(room => `
              <div style="border: 1px solid #ddd; padding: 15px; margin: 10px 0; border-radius: 5px;">
                <h3>${room.name}</h3>
                <p><strong>타입:</strong> ${room.type}</p>
                <p><strong>구조:</strong> ${room.structure}</p>
                <p><strong>베드:</strong> ${room.bedType}</p>
                <p><strong>뷰:</strong> ${room.view}</p>
                <p><strong>수용인원:</strong> ${room.standardCapacity}명 (최대 ${room.maxCapacity}명)</p>
                <p>${room.description}</p>
              </div>
            `).join('')}
          </div>
          
          <div class="section">
            <h2>시설 정보</h2>
            <h3>일반 시설</h3>
            <ul>${data.facilities.general.map(f => `<li>${f}</li>`).join('')}</ul>
            <h3>비즈니스 시설</h3>
            <ul>${data.facilities.business.map(f => `<li>${f}</li>`).join('')}</ul>
            <h3>레저 시설</h3>
            <ul>${data.facilities.leisure.map(f => `<li>${f}</li>`).join('')}</ul>
            <h3>식음료</h3>
            <ul>${data.facilities.dining.map(f => `<li>${f}</li>`).join('')}</ul>
          </div>
          
          <div class="section">
            <h2>체크인/아웃</h2>
            <p><strong>체크인:</strong> ${data.checkin.checkInTime}</p>
            <p><strong>체크아웃:</strong> ${data.checkin.checkOutTime}</p>
            <p><strong>얼리 체크인:</strong> ${data.checkin.earlyCheckIn}</p>
            <p><strong>레이트 체크아웃:</strong> ${data.checkin.lateCheckOut}</p>
          </div>
          
          <div class="section">
            <h2>패키지</h2>
            ${data.packages.map(pkg => `
              <div style="border: 1px solid #ddd; padding: 15px; margin: 10px 0; border-radius: 5px;">
                <h3>${pkg.name}</h3>
                <p>${pkg.description}</p>
                <p><strong>가격:</strong> ${pkg.price.toLocaleString()}원</p>
                <p><strong>포함사항:</strong></p>
                <ul>${pkg.includes.map(item => `<li>${item}</li>`).join('')}</ul>
              </div>
            `).join('')}
          </div>
          
          <div class="section" style="background: linear-gradient(to bottom, #dbeafe, #ffffff); padding: 30px; border-radius: 10px;">
            ${data.pricing && Object.keys(data.pricing).length > 0 ? `
              <!-- 헤더 -->
              <div style="text-align: center; margin-bottom: 30px;">
                <h2 style="color: #1e40af; font-size: 24px; font-weight: bold; margin-bottom: 10px;">
                  ${data.pricing.title || '소노휴 양평 리조트 룰온리'}
                </h2>
                    </div>

              <!-- 판매기간 -->
              <div style="background: #2563eb; color: white; text-align: center; padding: 15px; margin-bottom: 20px; border-radius: 5px;">
                <h3 style="font-weight: bold; font-size: 18px; margin: 0 0 5px 0;">상품 판매기간</h3>
                <p style="font-size: 16px; margin: 0;">
                  ${data.pricing.salesPeriod?.start || '2025.08.04'}~${data.pricing.salesPeriod?.end || '08.31'}
                </p>
                </div>

              <!-- 투숙기간 -->
              <div style="background: #2563eb; color: white; text-align: center; padding: 15px; margin-bottom: 20px; border-radius: 5px;">
                <h3 style="font-weight: bold; font-size: 18px; margin: 0 0 5px 0;">투숙 적용기간</h3>
                <p style="font-size: 16px; margin: 0;">
                  ${data.pricing.stayPeriod?.start || '2025.08.24'}~${data.pricing.stayPeriod?.end || '09.30'}
                </p>
              </div>

              <!-- 상품구성 -->
              <div style="background: #2563eb; color: white; text-align: center; padding: 15px; margin-bottom: 20px; border-radius: 5px;">
                <h3 style="font-weight: bold; font-size: 18px; margin: 0 0 5px 0;">상품구성</h3>
                <p style="font-size: 16px; margin: 0;">${data.pricing.roomInfo || '객실 1박'}</p>
              </div>

              <!-- 주의사항 -->
              ${data.pricing.notes && data.pricing.notes.length > 0 ? `
                <div style="margin-bottom: 30px;">
                  <ul style="list-style: none; padding: 0; font-size: 14px;">
                    ${data.pricing.notes.map(note => `
                      <li style="margin-bottom: 5px; display: flex; align-items: flex-start;">
                        <span style="color: #2563eb; margin-right: 8px;">●</span>
                        <span>${note}</span>
                      </li>
                    `).join('')}
                  </ul>
                </div>
              ` : ''}

              <!-- 추가요금 안내 -->
              <div style="background: #2563eb; color: white; text-align: center; padding: 15px; margin-bottom: 20px; border-radius: 5px;">
                <h3 style="font-weight: bold; font-size: 18px; margin: 0;">추가요금 안내</h3>
              </div>

              ${data.pricing.additionalInfo ? `
                <div style="margin-bottom: 20px; font-size: 14px;">
                  <p style="margin-bottom: 8px;"><strong>* 결제 대표요금:</strong> ${data.pricing.additionalInfo.paymentInfo || '패밀리 스탠다드 / 주중'}</p>
                  <p style="margin-bottom: 8px;"><strong>* 추가요금 결제방법:</strong> ${data.pricing.additionalInfo.additionalCharges || '구매후 접수 및 결제 페이지 진출'}</p>
                  <p style="margin-bottom: 8px;"><strong>* ${data.pricing.additionalInfo.availabilityInfo || '현장수량 소진시 사전 공지없이 가격변동될 수 있습니다.'}</strong></p>
                </div>
              ` : ''}

              <!-- 요금표 -->
              ${data.pricing.priceTable?.roomTypes && data.pricing.priceTable.roomTypes.length > 0 ? `
                <div style="overflow-x: auto;">
                  <table style="width: 100%; border-collapse: collapse; border: 2px solid #666; background: white;">
                    <thead>
                      <tr style="background: #e5e7eb;">
                        <th style="border: 1px solid #666; padding: 10px; text-align: center; font-weight: bold;">평형</th>
                        <th style="border: 1px solid #666; padding: 10px; text-align: center; font-weight: bold;">타입</th>
                        <th style="border: 1px solid #666; padding: 10px; text-align: center; font-weight: bold;">
                          요일<br/>(08.24~09.30)
                        </th>
                        <th style="border: 1px solid #666; padding: 10px; text-align: center; font-weight: bold;">추가요금</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${data.pricing.priceTable.roomTypes.map((roomType, roomIndex) => 
                        roomType.types.map((type, typeIndex) => `
                          <tr>
                            ${typeIndex === 0 ? `
                              <td style="border: 1px solid #666; padding: 12px; text-align: center; font-weight: bold; background: #fce7f3;" rowspan="${roomType.types.length}">
                                ${roomType.name}
                              </td>
                            ` : ''}
                            <td style="border: 1px solid #666; padding: 12px; text-align: center;">
                              ${type.name}
                            </td>
                            <td style="border: 1px solid #666; padding: 8px;">
                              <div style="text-align: center;">
                                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px; font-size: 12px; font-weight: bold; margin-bottom: 4px;">
                                  <span>주중</span>
                                  <span>추가요금</span>
                                </div>
                                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px; font-size: 12px; margin-bottom: 2px;">
                                  <span>금요일</span>
                                  <span>${(type.prices?.weekdays?.friday || 0).toLocaleString()}</span>
                                </div>
                                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px; font-size: 12px;">
                                  <span>토요일</span>
                                  <span>${(type.prices?.weekdays?.saturday || 0).toLocaleString()}</span>
                                </div>
                              </div>
                            </td>
                            <td style="border: 1px solid #666; padding: 12px; text-align: center; color: #dc2626; font-weight: bold;">
                              추가요금없음<br/>
                              ${(type.prices?.weekdays?.weekend || 0).toLocaleString()}
                            </td>
                          </tr>
                        `).join('')
                      ).join('')}
                    </tbody>
                  </table>
                </div>
              ` : ''}
            ` : '<p>요금표 정보를 입력해주세요.</p>'}
          </div>
          
          <div class="section">
            <h2>취소 규정</h2>
            <p><strong>무료 취소:</strong> ${data.cancel.freeCancellation}</p>
            <p><strong>취소 수수료:</strong> ${data.cancel.cancellationFee}</p>
            <p><strong>노쇼:</strong> ${data.cancel.noShow}</p>
            <p><strong>변경 정책:</strong> ${data.cancel.modificationPolicy}</p>
          </div>
          
          <div class="section">
            <h2>예약 안내</h2>
            <p><strong>예약 방법:</strong> ${data.booking.reservationMethod}</p>
            <p><strong>결제 방법:</strong> ${data.booking.paymentMethods.join(', ')}</p>
            <p><strong>확인 시간:</strong> ${data.booking.confirmationTime}</p>
            <p><strong>특별 요청:</strong> ${data.booking.specialRequests}</p>
          </div>
          
          <div class="section">
            <h2>공지사항</h2>
            ${data.notices.map(notice => `
              <div style="border: 1px solid #ddd; padding: 15px; margin: 10px 0; border-radius: 5px;">
                <h3>${notice.title}</h3>
                <p>${notice.content}</p>
              </div>
            `).join('')}
          </div>
        </body>
        </html>
      `
      
      setGeneratedHtml(html)
      setLastGenerated(new Date())
      setNotification({
        show: true,
        message: 'HTML이 성공적으로 생성되었습니다.',
        type: 'success'
      })
    } catch (error) {
      setNotification({
        show: true,
        message: 'HTML 생성 중 오류가 발생했습니다.',
        type: 'error'
      })
    } finally {
      setIsGenerating(false)
    }
  }, [data])

  // 클립보드 복사 함수
  const copyToClipboard = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(generatedHtml)
      setNotification({
        show: true,
        message: 'HTML이 클립보드에 복사되었습니다.',
        type: 'success'
      })
    } catch (error) {
      setNotification({
        show: true,
        message: '클립보드 복사 중 오류가 발생했습니다.',
        type: 'error'
      })
    }
  }, [generatedHtml])

  // HTML 다운로드 함수
  const downloadHtml = useCallback(() => {
    const blob = new Blob([generatedHtml], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${data.hotel.name}-상세페이지.html`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    setNotification({
      show: true,
      message: 'HTML 파일이 다운로드되었습니다.',
      type: 'success'
    })
  }, [generatedHtml, data.hotel.name])

  // 알림 자동 숨김
  useEffect(() => {
    if (notification.show) {
      const timer = setTimeout(() => {
        setNotification({ show: false, message: '', type: 'success' })
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [notification.show])

  // 탭 순서 로컬 스토리지 동기화
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('tabOrder')
      if (saved) {
        try {
          const parsedOrder = JSON.parse(saved)
          // 유효한 탭 키만 필터링
          const validOrder = parsedOrder.filter(key => 
            TAB_CONFIG.some(tab => tab.key === key)
          )
          if (validOrder.length === TAB_CONFIG.length) {
            setTabOrder(validOrder)
          }
        } catch (error) {
          console.error('탭 순서 로드 오류:', error)
        }
      }
    }
  }, [])

  // 자동 저장 (데이터 변경 시)
  useEffect(() => {
    const autoSaveTimer = setTimeout(() => {
      if (data && Object.keys(data).length > 0) {
        // 로컬 스토리지에만 자동 저장 (DB는 수동 저장)
        localStorage.setItem('hotelData', JSON.stringify(data))
      }
    }, 2000) // 2초 후 자동 저장

    return () => clearTimeout(autoSaveTimer)
  }, [data])

  // 탭 클릭 핸들러 - 모든 탭은 우선 인라인으로 표시
  const handleTabClick = (tab) => {
    setActiveTab(tab.key)
    // localStorage에 현재 탭 저장 (클라이언트에서만)
    if (typeof window !== 'undefined') {
      localStorage.setItem('activeTab', tab.key)
    }
    // 탭 클릭 시에는 모달을 열지 않고, 메인 화면에서 먼저 보여줌
    // 편집/추가 버튼을 클릭할 때만 모달이 열림
  }

  // 현재 탭의 입력 필드 렌더링
  const renderInputFields = () => {
    switch (activeTab) {
      case 'hotel':
        return (
          <div className="space-y-4">
            <div className="input-container">
              <Input
                label="호텔 이름"
                placeholder="호텔의 전체 이름을 입력하세요"
                value={data.hotel.name || ''}
                onChange={(e) => updateData('hotel', { ...data.hotel, name: e.target.value })}
                classNames={{
                  input: "text-overlap-fix",
                  inputWrapper: "text-overlap-fix"
                }}
              />
            </div>
            <div className="input-container">
              <Input
                label="호텔 주소"
                placeholder="호텔의 주소를 입력하세요"
                value={data.hotel.address || ''}
                onChange={(e) => updateData('hotel', { ...data.hotel, address: e.target.value })}
                classNames={{
                  input: "text-overlap-fix",
                  inputWrapper: "text-overlap-fix"
                }}
              />
            </div>
            <div className="input-container">
              <Textarea
                label="호텔 설명"
                placeholder="호텔에 대한 간략한 설명을 입력하세요"
                value={data.hotel.description || ''}
                onChange={(e) => updateData('hotel', { ...data.hotel, description: e.target.value })}
                minRows={3}
                classNames={{
                  input: "text-overlap-fix",
                  inputWrapper: "text-overlap-fix"
                }}
              />
            </div>
            <div className="input-container">
              <Input
                label="전화번호"
                placeholder="02-1234-5678"
                value={data.hotel.phone || ''}
                onChange={(e) => updateData('hotel', { ...data.hotel, phone: e.target.value })}
                classNames={{
                  input: "text-overlap-fix",
                  inputWrapper: "text-overlap-fix"
                }}
              />
            </div>
            <div className="input-container">
              <Input
                label="이메일"
                placeholder="info@hotel.com"
                value={data.hotel.email || ''}
                onChange={(e) => updateData('hotel', { ...data.hotel, email: e.target.value })}
                classNames={{
                  input: "text-overlap-fix",
                  inputWrapper: "text-overlap-fix"
                }}
              />
            </div>
            <div className="input-container">
              <Input
                label="웹사이트"
                placeholder="https://www.hotel.com"
                value={data.hotel.website || ''}
                onChange={(e) => updateData('hotel', { ...data.hotel, website: e.target.value })}
                classNames={{
                  input: "text-overlap-fix",
                  inputWrapper: "text-overlap-fix"
                }}
              />
            </div>
          </div>
        )
      
      case 'rooms':
        return (
          <div className="space-y-4">
            <div className="input-container">
              <Input
                label="객실 이름"
                placeholder="스탠다드, 디럭스, 스위트"
                value={data.rooms?.[0]?.name || ''}
                onChange={(e) => {
                  const updatedRooms = [...(data.rooms || [])];
                  if (updatedRooms[0]) {
                    updatedRooms[0].name = e.target.value;
                    updateData('rooms', updatedRooms);
                  }
                }}
                classNames={{
                  input: "text-overlap-fix",
                  inputWrapper: "text-overlap-fix"
                }}
              />
            </div>
            <div className="input-container">
              <Input
                label="객실 타입"
                placeholder="스탠다드, 디럭스, 스위트"
                value={data.rooms?.[0]?.type || ''}
                onChange={(e) => {
                  const updatedRooms = [...(data.rooms || [])];
                  if (updatedRooms[0]) {
                    updatedRooms[0].type = e.target.value;
                    updateData('rooms', updatedRooms);
                  }
                }}
                classNames={{
                  input: "text-overlap-fix",
                  inputWrapper: "text-overlap-fix"
                }}
              />
            </div>
            <div className="input-container">
              <Textarea
                label="객실 설명"
                placeholder="편안한 숙면을 위한 퀸 베드가 구비된 스탠다드 룸입니다."
                value={data.rooms?.[0]?.description || ''}
                onChange={(e) => {
                  const updatedRooms = [...(data.rooms || [])];
                  if (updatedRooms[0]) {
                    updatedRooms[0].description = e.target.value;
                    updateData('rooms', updatedRooms);
                  }
                }}
                minRows={3}
                classNames={{
                  input: "text-overlap-fix",
                  inputWrapper: "text-overlap-fix"
                }}
              />
            </div>
            <Suspense fallback={<LoadingSpinner />}>
              <InlineRoomEditor
                rooms={data.rooms}
                onRoomsChange={(rooms) => updateData('rooms', rooms)}
              />
            </Suspense>
          </div>
        )
      
      case 'facilities':
        return (
          <div className="space-y-4">
            <Suspense fallback={<LoadingSpinner />}>
              <InlineFacilitiesEditor
                facilities={data.facilities}
                onFacilitiesChange={(facilities) => updateData('facilities', facilities)}
              />
            </Suspense>
          </div>
        )
      
      case 'checkin':
        return (
          <div className="space-y-4">
            <div className="input-container">
              <Input
                label="체크인 시간"
                placeholder="15:00"
                value={data.checkin?.checkInTime || ''}
                onChange={(e) => updateData('checkin', { ...data.checkin, checkInTime: e.target.value })}
                classNames={{
                  input: "text-overlap-fix",
                  inputWrapper: "text-overlap-fix"
                }}
              />
            </div>
            <div className="input-container">
              <Input
                label="체크아웃 시간"
                placeholder="11:00"
                value={data.checkin?.checkOutTime || ''}
                onChange={(e) => updateData('checkin', { ...data.checkin, checkOutTime: e.target.value })}
                classNames={{
                  input: "text-overlap-fix",
                  inputWrapper: "text-overlap-fix"
                }}
              />
            </div>
            <div className="input-container">
              <Input
                label="얼리 체크인"
                placeholder="추가 요금 발생"
                value={data.checkin?.earlyCheckIn || ''}
                onChange={(e) => updateData('checkin', { ...data.checkin, earlyCheckIn: e.target.value })}
                classNames={{
                  input: "text-overlap-fix",
                  inputWrapper: "text-overlap-fix"
                }}
              />
            </div>
            <div className="input-container">
              <Input
                label="레이트 체크아웃"
                placeholder="추가 요금 발생"
                value={data.checkin?.lateCheckOut || ''}
                onChange={(e) => updateData('checkin', { ...data.checkin, lateCheckOut: e.target.value })}
                classNames={{
                  input: "text-overlap-fix",
                  inputWrapper: "text-overlap-fix"
                }}
              />
            </div>
            <Suspense fallback={<LoadingSpinner />}>
              <InlineCheckInOutInfo
                checkin={data.checkin}
                onCheckinChange={(checkin) => updateData('checkin', checkin)}
              />
            </Suspense>
          </div>
        )
      
      case 'packages':
        return (
          <div className="space-y-4">
            <Suspense fallback={<LoadingSpinner />}>
              <InlinePackageEditor
                packages={data.packages}
                onPackagesChange={(packages) => updateData('packages', packages)}
              />
            </Suspense>
          </div>
        )
      
      case 'pricing':
        return (
          <div className="space-y-4">
            <div className="input-container">
              <Input
                label="요금표 제목"
                placeholder="예: 객실 요금표, 시즌별 요금표"
                value={data.pricing?.title || ''}
                onChange={(e) => updateData('pricing', { ...data.pricing, title: e.target.value })}
                classNames={{
                  input: "text-overlap-fix",
                  inputWrapper: "text-overlap-fix"
                }}
              />
            </div>
            <div className="input-container">
              <Input
                label="결제 대표요금"
                placeholder="결제대표요금 스탠다드 / 주중"
                value={data.pricing?.representativePrice || ''}
                onChange={(e) => updateData('pricing', { ...data.pricing, representativePrice: e.target.value })}
                classNames={{
                  input: "text-overlap-fix",
                  inputWrapper: "text-overlap-fix"
                }}
              />
            </div>
            <div className="input-container">
              <Input
                label="요금표 기간"
                placeholder="08.24~09.30"
                value={data.pricing?.period || ''}
                onChange={(e) => updateData('pricing', { ...data.pricing, period: e.target.value })}
                classNames={{
                  input: "text-overlap-fix",
                  inputWrapper: "text-overlap-fix"
                }}
              />
            </div>
            <div className="input-container">
              <Textarea
                label="추가 정보"
                placeholder="추가요금 결제방법 페이지 진출\n현장수량 소진시 안내 공지없이 가격변동될 수 있습니다"
                value={data.pricing?.additionalInfo || ''}
                onChange={(e) => updateData('pricing', { ...data.pricing, additionalInfo: e.target.value })}
                minRows={3}
                classNames={{
                  input: "text-overlap-fix",
                  inputWrapper: "text-overlap-fix"
                }}
              />
            </div>
            <Suspense fallback={<LoadingSpinner />}>
              <InlinePricingEditor
                pricing={data.pricing}
                onPricingChange={(pricing) => updateData('pricing', pricing)}
              />
            </Suspense>
          </div>
        )
      
      case 'cancel':
        return (
          <div className="space-y-4">
            <Suspense fallback={<LoadingSpinner />}>
              <InlineCancelPolicy
                cancel={data.cancel}
                onCancelChange={(cancel) => updateData('cancel', cancel)}
              />
            </Suspense>
          </div>
        )
      
      case 'booking':
        return (
          <div className="space-y-4">
            <Suspense fallback={<LoadingSpinner />}>
              <InlineBookingConfirmation
                booking={data.booking}
                onBookingChange={(booking) => updateData('booking', booking)}
              />
            </Suspense>
          </div>
        )
      
      case 'notices':
        return (
          <div className="space-y-4">
            <Suspense fallback={<LoadingSpinner />}>
              <InlineNoticeEditor
                notices={notices}
                onNoticesChange={setNotices}
              />
            </Suspense>
          </div>
        )
      
      default:
        return <div>선택된 탭에 대한 입력 필드가 없습니다.</div>
    }
  }

  // 현재 탭의 미리보기 렌더링
  const renderPreview = () => {
    switch (activeTab) {
      case 'hotel':
        return data.hotel.name ? (
          <div className="space-y-4">
            <h3 className="text-lg font-bold">{data.hotel.name}</h3>
            {data.hotel.address && <p><strong>주소:</strong> {data.hotel.address}</p>}
            {data.hotel.phone && <p><strong>전화:</strong> {data.hotel.phone}</p>}
            {data.hotel.email && <p><strong>이메일:</strong> {data.hotel.email}</p>}
            {data.hotel.website && <p><strong>웹사이트:</strong> {data.hotel.website}</p>}
            {data.hotel.description && <p>{data.hotel.description}</p>}
          </div>
        ) : (
          <div className="empty-state">
            <span className="empty-state-icon">👁️</span>
            <p>호텔 정보를 입력해주세요</p>
          </div>
        )
      
      case 'rooms':
        return data.rooms && data.rooms.length > 0 ? (
          <div className="space-y-4">
            <h3 className="text-lg font-bold">객실 정보</h3>
            {data.rooms.map((room, index) => (
              <div key={index} className="border rounded-lg p-4 bg-gray-50">
                <h4 className="font-semibold text-lg">{room.name || room.type}</h4>
                <p className="text-gray-600 text-sm">
                  {room.structure} • {room.bedType} • {room.view}
                </p>
                <p className="text-gray-600 text-sm">
                  수용인원: {room.standardCapacity}명 (최대 {room.maxCapacity}명)
                </p>
                {room.description && (
                  <p className="text-gray-700 mt-2">{room.description}</p>
                )}
                {room.amenities && room.amenities.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {room.amenities.slice(0, 3).map(amenity => (
                      <Chip key={amenity} size="sm" variant="flat">
                        {amenity}
                      </Chip>
                    ))}
                    {room.amenities.length > 3 && (
                      <Chip size="sm" variant="flat">+{room.amenities.length - 3}</Chip>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <span className="empty-state-icon">👥</span>
            <p>객실 정보를 입력해주세요</p>
          </div>
        )
      
      case 'facilities':
        return data.facilities ? (
          <div className="space-y-4">
            <h3 className="text-lg font-bold">시설 정보</h3>
            {Object.entries(data.facilities).map(([category, facilities]) => (
              <div key={category} className="border rounded-lg p-4 bg-gray-50">
                <h4 className="font-semibold text-lg mb-2">
                  {category === 'general' && '일반 시설'}
                  {category === 'business' && '비즈니스 시설'}
                  {category === 'leisure' && '레저 시설'}
                  {category === 'dining' && '식음료 시설'}
                </h4>
                {facilities && facilities.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {facilities.map((facility, index) => (
                      <Chip key={index} variant="flat" color="primary">
                        {facility}
                      </Chip>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">등록된 시설이 없습니다.</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <span className="empty-state-icon">⚙️</span>
            <p>시설 정보를 입력해주세요</p>
          </div>
        )
      
      case 'packages':
        return data.packages && data.packages.length > 0 ? (
          <div className="space-y-4">
            <h3 className="text-lg font-bold">패키지 정보</h3>
            {data.packages.map((pkg, index) => (
              <div key={index} className="border rounded-lg p-4 bg-gray-50">
                <h4 className="font-semibold text-lg">{pkg.name}</h4>
                <p className="text-gray-600 text-sm">
                  ₩{pkg.price?.toLocaleString() || 0}
                </p>
                {pkg.description && (
                  <p className="text-gray-700 mt-2">{pkg.description}</p>
                )}

                {/* 판매기간 */}
                {pkg.salesPeriod?.start && pkg.salesPeriod?.end && (
                  <div className="mt-3 p-2 bg-blue-100 rounded">
                    <p className="text-sm font-medium text-blue-800">판매기간</p>
                    <p className="text-sm text-blue-700">{pkg.salesPeriod.start} ~ {pkg.salesPeriod.end}</p>
                  </div>
                )}

                {/* 투숙기간 */}
                {pkg.stayPeriod?.start && pkg.stayPeriod?.end && (
                  <div className="mt-2 p-2 bg-green-100 rounded">
                    <p className="text-sm font-medium text-green-800">투숙 적용기간</p>
                    <p className="text-sm text-green-700">{pkg.stayPeriod.start} ~ {pkg.stayPeriod.end}</p>
                  </div>
                )}

                {/* 상품구성 */}
                {pkg.productComposition && (
                  <div className="mt-2 p-2 bg-purple-100 rounded">
                    <p className="text-sm font-medium text-purple-800">상품구성</p>
                    <p className="text-sm text-purple-700">{pkg.productComposition}</p>
                  </div>
                )}

                {/* 포함사항 */}
                {pkg.includes && pkg.includes.length > 0 && (
                  <div className="mt-3">
                    <p className="text-sm font-medium text-gray-800 mb-1">포함사항</p>
                    <div className="flex flex-wrap gap-1">
                    {pkg.includes.map((include, includeIndex) => (
                      <Chip key={includeIndex} size="sm" variant="flat" color="success">
                        {include}
                      </Chip>
                    ))}
                    </div>
                  </div>
                )}

                {/* 유의사항 */}
                {pkg.notes && pkg.notes.length > 0 && (
                  <div className="mt-3">
                    <p className="text-sm font-medium text-gray-800 mb-1">유의사항</p>
                    <div className="flex flex-wrap gap-1">
                      {pkg.notes.map((note, noteIndex) => (
                        <Chip key={noteIndex} size="sm" variant="flat" color="warning">
                          {note}
                        </Chip>
                      ))}
                    </div>
                  </div>
                )}

                {/* 제약사항 */}
                {pkg.constraints && pkg.constraints.length > 0 && (
                  <div className="mt-3">
                    <p className="text-sm font-medium text-gray-800 mb-1">제약사항</p>
                    <div className="flex flex-wrap gap-1">
                      {pkg.constraints.map((constraint, constraintIndex) => (
                        <Chip key={constraintIndex} size="sm" variant="flat" color="danger">
                          {constraint}
                        </Chip>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <span className="empty-state-icon">📄</span>
            <p>패키지 정보를 입력해주세요</p>
          </div>
        )
      
      case 'pricing':
        return data.pricing && Object.keys(data.pricing).length > 0 ? (
          <div className="bg-gradient-to-b from-blue-50 to-white p-6 rounded-lg">
            {/* 헤더 */}
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-blue-800 mb-2">
                {data.pricing.title || '소노휴 양평 리조트 룰온리'}
              </h2>
                    </div>



            {/* 주의사항 */}
            {data.pricing.notes && data.pricing.notes.length > 0 && (
              <div className="mb-6">
                <ul className="text-sm space-y-1">
                  {data.pricing.notes.map((note, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-blue-600 mr-2">●</span>
                      <span>{note}</span>
                    </li>
                  ))}
                </ul>
                </div>
            )}

            {/* 추가요금 안내 */}
            {/* 결제 대표요금 - 요금표 위로 이동 */}
            {data.pricing.additionalInfo?.paymentInfo && (
              <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="font-bold text-lg text-blue-800 mb-2">결제 대표요금</h3>
                <p className="text-blue-700">{data.pricing.additionalInfo.paymentInfo}</p>
              </div>
            )}

            {/* 추가요금 안내 */}
            <div className="bg-blue-600 text-white text-center py-3 mb-4 rounded">
              <h3 className="font-bold text-lg">추가요금 안내</h3>
            </div>

            {data.pricing.additionalInfo && (
              <div className="mb-4 space-y-2 text-sm">
                <p><strong>* 추가요금 결제방법:</strong> {data.pricing.additionalInfo.additionalCharges || '구매후 접수 및 결제 페이지 진출'}</p>
                <p><strong>* {data.pricing.additionalInfo.availabilityInfo || '현장수량 소진시 사전 공지없이 가격변경될 수 있습니다.'}</strong></p>
              </div>
            )}

            {/* 추가요금표 */}
            {data.pricing.priceTable?.roomTypes && data.pricing.priceTable.roomTypes.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border-2 border-gray-400 bg-white">
                  <thead>
                    <tr className="bg-gray-200">
                      <th className="border border-gray-400 p-2 text-center font-bold">평형</th>
                      <th className="border border-gray-400 p-2 text-center font-bold">타입</th>
                      <th className="border border-gray-400 p-2 text-center font-bold">요일별 추가요금</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.pricing.priceTable.roomTypes.map((roomType, roomIndex) => (
                      roomType.types.map((type, typeIndex) => (
                        <tr key={`${roomType.id}-${type.id}`}>
                          {typeIndex === 0 && (
                            <td 
                              className="border border-gray-400 p-3 text-center font-bold bg-pink-100"
                              rowSpan={roomType.types.length}
                            >
                              {roomType.name}
                            </td>
                          )}
                          <td className="border border-gray-400 p-3 text-center">
                            {type.name}
                          </td>
                          <td className="border border-gray-400 p-3">
                            <div className="space-y-2">
                              <div className="grid grid-cols-2 gap-4">
                                <div className="text-center">
                                  <div className="text-xs font-bold text-gray-600 mb-1">
                                    {type.dayNames?.friday || '금요일'}
                                  </div>
                                  <div className="text-sm font-semibold">
                                    {type.prices?.weekdays?.friday ? 
                                      `₩${parseInt(type.prices.weekdays.friday).toLocaleString()}` : 
                                      '추가요금 없음'
                                    }
                                  </div>
                                </div>
                                <div className="text-center">
                                  <div className="text-xs font-bold text-gray-600 mb-1">
                                    {type.dayNames?.saturday || '토요일'}
                                  </div>
                                  <div className="text-sm font-semibold">
                                    {type.prices?.weekdays?.saturday ? 
                                      `₩${parseInt(type.prices.weekdays.saturday).toLocaleString()}` : 
                                      '추가요금 없음'
                                    }
                                  </div>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          <div className="empty-state">
            <span className="empty-state-icon">💰</span>
            <p>요금표를 입력해주세요</p>
          </div>
        )
      
      case 'notices':
        return notices && notices.length > 0 ? (
          <div className="space-y-4">
            <h3 className="text-lg font-bold">공지사항</h3>
            {notices.map((notice, index) => (
              <div key={index} className="border rounded-lg p-4 bg-gray-50">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-semibold text-lg">{notice.title}</h4>
                  <Chip
                    size="sm"
                    color={notice.priority === 'high' ? 'danger' : notice.priority === 'normal' ? 'primary' : 'default'}
                    variant="flat"
                  >
                    {notice.priority === 'high' ? '높음' : notice.priority === 'normal' ? '보통' : '낮음'}
                  </Chip>
                  {!notice.isActive && (
                    <Chip size="sm" color="default" variant="flat">
                      비활성
                    </Chip>
                  )}
                </div>
                {notice.content && (
                  <p className="text-gray-700 whitespace-pre-wrap">{notice.content}</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <span className="empty-state-icon">📄</span>
            <p>공지사항을 입력해주세요</p>
          </div>
        )
      
      case 'checkin':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-bold">체크인/아웃 정보</h3>
            {data.checkin.checkInTime && <p><strong>체크인:</strong> {data.checkin.checkInTime}</p>}
            {data.checkin.checkOutTime && <p><strong>체크아웃:</strong> {data.checkin.checkOutTime}</p>}
            {data.checkin.earlyCheckIn && <p><strong>얼리 체크인:</strong> {data.checkin.earlyCheckIn}</p>}
            {data.checkin.lateCheckOut && <p><strong>레이트 체크아웃:</strong> {data.checkin.lateCheckOut}</p>}
          </div>
        )
      
      case 'cancel':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-bold">취소 및 환불 규정</h3>
            
            {/* 규정 설명 */}
            {data.cancel?.description && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-800 mb-2">규정 설명</h4>
                <p className="text-gray-700 whitespace-pre-wrap">{data.cancel.description}</p>
              </div>
            )}
            
            {/* 계절별 규정 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* 비수기 규정 */}
              {data.cancel?.offSeason && data.cancel.offSeason.length > 0 && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2">비수기 규정</h4>
                  <div className="space-y-2">
                    {data.cancel.offSeason.map((rule, index) => (
                      <div key={index} className="text-sm">
                        <span className="font-medium">{rule.days}</span>
                        <span className="text-blue-600 ml-2">{rule.rate}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* 준성수기 규정 */}
              {data.cancel?.midSeason && data.cancel.midSeason.length > 0 && (
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-yellow-800 mb-2">준성수기 규정</h4>
                  <div className="space-y-2">
                    {data.cancel.midSeason.map((rule, index) => (
                      <div key={index} className="text-sm">
                        <span className="font-medium">{rule.days}</span>
                        <span className="text-yellow-600 ml-2">{rule.rate}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* 성수기 규정 */}
              {data.cancel?.highSeason && data.cancel.highSeason.length > 0 && (
                <div className="bg-red-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-red-800 mb-2">성수기 규정</h4>
                  <div className="space-y-2">
                    {data.cancel.highSeason.map((rule, index) => (
                      <div key={index} className="text-sm">
                        <span className="font-medium">{rule.days}</span>
                        <span className="text-red-600 ml-2">{rule.rate}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* 추가 참고사항 */}
            {data.cancel?.notes && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-800 mb-2">추가 참고사항</h4>
                <p className="text-gray-700 whitespace-pre-wrap">{data.cancel.notes}</p>
              </div>
            )}
            
            {/* 데이터가 없을 때 */}
            {(!data.cancel || Object.keys(data.cancel).length === 0 || 
              (!data.cancel.description && !data.cancel.offSeason && !data.cancel.midSeason && 
               !data.cancel.highSeason && !data.cancel.notes)) && (
              <div className="empty-state">
                <span className="empty-state-icon">📋</span>
                <p>취소 규정을 입력해주세요</p>
              </div>
            )}
          </div>
        )
      
        case 'booking':
          return (
            <div className="space-y-4">
              <h3 className="text-lg font-bold">예약 안내</h3>
              {data.booking?.bookingText ? (
                <div className="text-sm whitespace-pre-wrap leading-6 bg-white rounded-md p-4 border">
                  {data.booking.bookingText}
                </div>
              ) : (
                <p className="text-sm text-gray-500">왼쪽 입력 내용을 작성하면 미리보기에 표시됩니다.</p>
              )}
            </div>
          )
      
      default:
        return (
          <div className="empty-state">
            <span className="empty-state-icon">{TAB_CONFIG.find(tab => tab.key === activeTab)?.icon}</span>
            <p>해당 섹션의 정보를 편집해주세요</p>
          </div>
        )
    }
  }

  // 연결/해제 토글 함수
  const toggleMonitoring = useCallback(() => {
    const ws = monitoringWSRef.current
    if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) {
      try { ws.close() } catch (e) {}
      setIsMonitoringConnected(false)
      setNotification({ show: true, message: '❌ 모니터링 연결이 해제되었습니다.', type: 'warning' })
      monitoringWSRef.current = null
    } else {
      connectMonitoring()
    }
  }, [connectMonitoring])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* 실시간 오류 수집기 */}
      <Suspense fallback={<LoadingSpinner />}>
        <ErrorCollectorComponent />
      </Suspense>
      
      {/* 알림 */}
      {notification.show && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
          notification.type === 'success' ? 'bg-green-500 text-white' :
          notification.type === 'error' ? 'bg-red-500 text-white' :
          'bg-blue-500 text-white'
        }`}>
          {notification.message}
        </div>
      )}

      {/* 헤더 */}
      <div className="bg-white shadow-lg border-b">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                🏨 호텔 상세페이지 관리자
                {isLoading && <Spinner size="sm" />}
              </h1>
              <p className="text-gray-600 mt-2 text-lg">호텔 정보를 관리하고 HTML을 생성하세요</p>
            </div>
            <div className="flex gap-3">
              <Suspense fallback={<LoadingSpinner />}>
                <DBStatusIndicator />
              </Suspense>
              <Button
                color="primary"
                variant="flat"
                onPress={onSettingsOpen}
                startContent={Icons.settings}
              >
                설정
              </Button>
              <Button
                color="primary"
                variant="flat"
                onPress={onPreviewOpen}
                startContent={Icons.eye}
              >
                미리보기
              </Button>
              <Button
                color="success"
                onPress={generateHTML}
                isLoading={isGenerating}
                startContent={Icons.refresh}
              >
                HTML 생성
              </Button>
              {generatedHtml && (
                <>
                  <Button
                    color="secondary"
                    onPress={copyToClipboard}
                    startContent={Icons.copy}
                  >
                    복사
                  </Button>
                  <Button
                    color="primary"
                    onPress={downloadHtml}
                    startContent={Icons.download}
                  >
                    다운로드
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 탭 메뉴 */}
      <div className="bg-white border-b">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {isDragMode ? (
                <Suspense fallback={<LoadingSpinner />}>
                  <DraggableTabs
                    tabs={tabOrder.map(tabKey => TAB_CONFIG.find(t => t.key === tabKey)).filter(Boolean)}
                    activeTab={activeTab}
                    onTabClick={handleTabClick}
                    onOrderChange={moveTab}
                    mounted={mounted}
                  />
                </Suspense>
            ) : (
                <div className="flex gap-1 overflow-x-auto whitespace-nowrap">
                {tabOrder.map((tabKey, index) => {
                  const tab = TAB_CONFIG.find(t => t.key === tabKey)
                  if (!tab) return null
                  
                  return (
                    <div key={tab.key} className="flex items-center">
                      <button
                        className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                          mounted && activeTab === tab.key
                            ? 'border-blue-500 text-blue-600 bg-blue-50'
                            : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                        }`}
                        onClick={() => handleTabClick(tab)}
                      >
                        <span className="text-lg">{mounted ? tab.icon : '⏳'}</span>
                        {tab.label}
                      </button>
                      
                      {/* 순서 변경 버튼들 */}
                      <div className="flex flex-col ml-1">
                        {index > 0 && (
                          <button
                            onClick={() => moveTab(index, index - 1)}
                            className="text-xs text-gray-400 hover:text-blue-500 p-1"
                            title="위로 이동"
                          >
                            ↑
                          </button>
                        )}
                        {index < tabOrder.length - 1 && (
                          <button
                            onClick={() => moveTab(index, index + 1)}
                            className="text-xs text-gray-400 hover:text-blue-500 p-1"
                            title="아래로 이동"
                          >
                            ↓
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
            
            {/* 드래그 모드 토글 버튼 */}
            <Button
              size="sm"
              variant={isDragMode ? "solid" : "bordered"}
              color={isDragMode ? "primary" : "default"}
              onPress={() => setIsDragMode(!isDragMode)}
              className="ml-2 text-xs"
              title="드래그 앤 드롭 모드"
            >
              {isDragMode ? "📋 드래그 모드" : "📋 일반 모드"}
            </Button>
            
            {/* 순서 초기화 버튼 */}
            <Button
              size="sm"
              variant="bordered"
              onPress={resetTabOrder}
              className="ml-2 text-xs"
              title="탭 순서 초기화"
            >
              🔄 초기화
            </Button>
            
            {/* 모니터링 연결 버튼 */}
            <Button
              size="sm"
              variant={isMonitoringConnected ? "solid" : "bordered"}
              color={isMonitoringConnected ? "success" : "danger"}
              onPress={toggleMonitoring}
              className="ml-2 text-xs"
              title="실시간 오류 모니터링 연결"
            >
              {isMonitoringConnected ? "✅ 연결됨" : "❌ 연결해제"}
            </Button>
            
            {/* 모니터링 대시보드 토글 버튼 */}
            <Button
              size="sm"
              variant="bordered"
              color="secondary"
              onPress={() => setShowMonitoringDashboard(!showMonitoringDashboard)}
              className="ml-2 text-xs"
              title="모니터링 대시보드 토글"
            >
              {showMonitoringDashboard ? "📊 대시보드 숨기기" : "📊 대시보드 보기"}
            </Button>
            
            {/* API 대시보드 링크 */}
            <Button
              as="a"
              href="/dashboard"
              size="sm"
              variant="bordered"
              color="primary"
              className="ml-2 text-xs"
              title="API 대시보드로 이동"
            >
              🔗 API 대시보드
            </Button>
          </div>
        </div>
      </div>

      {/* 메인 컨텐츠 영역 - 1:1 매칭 레이아웃 */}
      <Suspense fallback={<LoadingSpinner size="large" />}>
        <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* 입력 필드 영역 - 인라인 표시 항목들 */}
          <div className="space-y-6">
              <Card className="p-6 min-h-[85vh] overflow-visible">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">
                  <span suppressHydrationWarning>{mounted ? TAB_CONFIG.find(tab => tab.key === activeTab)?.icon : '🏠'}</span>
                </span>
                <h2 className="text-xl font-bold">
                  <span suppressHydrationWarning>{mounted ? TAB_CONFIG.find(tab => tab.key === activeTab)?.label : '호텔 정보'}</span>
                </h2>
                <Chip size="sm" color="primary" variant="flat">인라인 표시</Chip>
                {mounted && TAB_CONFIG.find(tab => tab.key === activeTab)?.displayType === 'modal' && (
                  <Chip size="sm" color="warning" variant="flat">편집 가능</Chip>
                )}
              </div>
              
              {/* 모든 탭 인라인 표시 */}
              {(() => {
                const Component = getComponentForTab(activeTab);
                if (Component) {
                  return (
                    <Suspense fallback={<LoadingSpinner />}>
                      <Component 
                        value={data[activeTab]} 
                        onChange={(newData) => updateData(activeTab, newData)} 
                      />
                    </Suspense>
                  );
                } else {
                  return renderInputFields();
                }
              })()}
            </Card>
          </div>

            {/* 미리보기 영역 */}
            <div className="space-y-6">
              <Card className="p-6 min-h-[85vh] overflow-visible">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">{Icons.eye}</span>
                <h2 className="text-xl font-bold">미리보기</h2>
              </div>
              
                <div className="bg-gray-50 rounded-lg p-4 min-h-[900px] preview-content">      
                <Suspense fallback={<LoadingSpinner size="large" />}>
                  {renderPreview()}
                </Suspense>
              </div>
            </Card>
          </div>
        </div>
      </div>
      </Suspense>

      {/* 호텔 정보도 인라인으로 표시 - 모달 비활성화 */}
      {false && (
      <Modal
        isOpen={false}
        onClose={onHotelModalClose}
        size="2xl"
        scrollBehavior="inside"
        placement="top-center"
        backdrop="opaque"
        classNames={{
          base: "max-w-[60vw] max-h-[70vh] mx-auto mt-4 shadow-2xl border border-gray-200",
          wrapper: "flex items-start justify-center pt-4 px-4",
          backdrop: "bg-white/80 backdrop-blur-sm",
          body: "p-0",
          header: "border-b border-gray-200 bg-white",
          footer: "border-t border-gray-200 bg-gray-50"
        }}
      >
        <ModalContent>
          <ModalHeader className="flex items-center justify-between px-6 py-4 border-b">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{Icons.home}</span>
              <span className="text-xl font-bold">호텔 정보</span>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                color="primary"
                variant="bordered"
                onPress={saveData}
                isLoading={isLoading}
                startContent={Icons.save}
              >
                저장
              </Button>
            </div>
          </ModalHeader>
          <ModalBody className="p-6">
            <Suspense fallback={<LoadingSpinner />}>
              <HotelInfoSection
                value={data.hotel}
                onChange={newData => updateData('hotel', newData)}
              />
            </Suspense>
          </ModalBody>
          <ModalFooter>
            <Button color="danger" variant="light" onPress={onHotelModalClose}>
              취소
            </Button>
            <Button color="primary" onPress={onHotelModalClose}>
              완료
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      )}

      {/* 개별 컴포넌트가 자체 모달 관리 - 메인 모달 제거 */}
      {false && (
        <Modal
          isOpen={false}
          onClose={onModalClose}
          size="2xl"
          scrollBehavior="inside"
          placement="top-center"
          backdrop="opaque"
          classNames={{
            base: "max-w-[60vw] max-h-[70vh] mx-auto mt-4 shadow-2xl border border-gray-200",
            wrapper: "flex items-start justify-center pt-4 px-4",
            backdrop: "bg-white/80 backdrop-blur-sm",
            body: "p-0",
            header: "border-b border-gray-200 bg-white",
            footer: "border-t border-gray-200 bg-gray-50"
          }}
        >
          <ModalContent>
            <ModalHeader className="flex items-center justify-between px-6 py-4 border-b bg-white sticky top-0 z-10">
              <div className="flex items-center gap-3">
                {mounted ? (
                  TAB_CONFIG.find(tab => tab.key === activeTab) && (
                    <>
                      <span className="text-2xl" suppressHydrationWarning>{TAB_CONFIG.find(tab => tab.key === activeTab).icon}</span>
                      <span className="text-xl font-bold" suppressHydrationWarning>{TAB_CONFIG.find(tab => tab.key === activeTab).label}</span>
                    </>
                  )
                ) : (
                  <>
                    <span className="text-2xl" suppressHydrationWarning>🏠</span>
                    <span className="text-xl font-bold" suppressHydrationWarning>호텔 정보</span>
                  </>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  color="primary"
                  variant="bordered"
                  onPress={saveData}
                  isLoading={isLoading}
                  startContent={Icons.save}
                >
                  💾 DB 저장
                </Button>
              </div>
            </ModalHeader>
            
            <ModalBody className="p-6 max-h-[60vh] overflow-y-auto bg-white">
              {(() => {
                const Component = getComponentForTab(activeTab);
                if (Component) {
                  return (
                    <Suspense fallback={<LoadingSpinner />}>
                      <Component
                        value={data[activeTab] || []}
                        onChange={(newData) => updateData(activeTab, newData)}
                      />
                    </Suspense>
                  );
                }
                return (
                  <div className="text-center py-8">
                    <p className="text-gray-500">컴포넌트를 찾을 수 없습니다.</p>
                  </div>
                );
              })()}
            </ModalBody>
            
            <ModalFooter className="px-6 py-4 border-t bg-gray-50 sticky bottom-0">
              <Button color="danger" variant="light" onPress={onModalClose}>
                취소
              </Button>
              <Button color="primary" onPress={onModalClose}>
                완료
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}

      {/* 미리보기 모달 */}
      <Modal 
        isOpen={isPreviewOpen} 
        onClose={onPreviewClose}
        size="full"
        scrollBehavior="inside"
        placement="center"
        backdrop="opaque"
        classNames={{
          base: "w-[375px] h-[667px] mx-auto shadow-2xl border border-gray-200 bg-white",
          wrapper: "flex items-center justify-center p-4",
          backdrop: "bg-black/50 backdrop-blur-sm",
          body: "p-0",
          header: "border-b border-gray-200 bg-white sticky top-0 z-10",
          footer: "border-t border-gray-200 bg-gray-50 sticky bottom-0"
        }}
      >
        <ModalContent>
          <ModalHeader className="flex items-center justify-between px-4 py-3 border-b bg-white sticky top-0 z-10" style={{ height: '60px' }}>
            <div className="flex items-center gap-2">
              <span className="text-xl">{Icons.eye}</span>
              <span className="text-lg font-bold">미리보기</span>
            </div>
            <div className="flex items-center gap-1">
              <Button
                size="sm"
                color="primary"
                onPress={generateHTML}
                isLoading={isGenerating}
                startContent={Icons.refresh}
                className="text-xs"
              >
                🔄
              </Button>
              {generatedHtml && (
                <>
                  <Button
                    size="sm"
                    color="success"
                    onPress={copyToClipboard}
                    startContent={Icons.copy}
                    className="text-xs"
                  >
                    📋
                  </Button>
                  <Button
                    size="sm"
                    color="primary"
                    onPress={downloadHtml}
                    startContent={Icons.download}
                    className="text-xs"
                  >
                    💾
                  </Button>
                </>
              )}
              <Button
                size="sm"
                color="danger"
                variant="flat"
                onPress={onPreviewClose}
                className="ml-2 text-xs bg-red-100 hover:bg-red-200"
              >
                ✕
              </Button>
            </div>
          </ModalHeader>
          <ModalBody className="p-0 overflow-hidden">
            {generatedHtml ? (
              <div className="w-full h-full" style={{ height: 'calc(667px - 120px)' }}>
                <EmbeddedBrowser html={generatedHtml} />
              </div>
            ) : (
              <div className="flex items-center justify-center h-full p-4" style={{ height: 'calc(667px - 120px)' }}>
                <div className="text-center">
                  <span className="text-4xl mb-4">{Icons.eye}</span>
                  <p className="text-gray-500 text-base mb-6">HTML을 먼저 생성해주세요</p>
                  <Button
                    color="primary"
                    size="lg"
                    onPress={generateHTML}
                    isLoading={isGenerating}
                    startContent={Icons.refresh}
                  >
                    HTML 생성
                  </Button>
                </div>
              </div>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* 설정 모달 */}
      <Modal 
        isOpen={isSettingsOpen} 
        onClose={onSettingsClose}
        size="lg"
        scrollBehavior="inside"
        placement="center"
        backdrop="opaque"
        classNames={{
          base: "max-w-[45vw] max-h-[55vh] mx-auto shadow-xl border border-gray-300",
          wrapper: "flex items-center justify-center p-6",
          backdrop: "bg-white/85 backdrop-blur-md",
          body: "p-0",
          header: "border-b border-gray-300 bg-white",
          footer: "border-t border-gray-300 bg-gray-50"
        }}
      >
        <ModalContent>
          <ModalHeader className="flex items-center gap-3">
            <span className="text-2xl">{Icons.settings}</span>
            <span className="text-xl font-bold">설정</span>
          </ModalHeader>
          <ModalBody className="p-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">데이터 관리</h3>
                <div className="flex gap-3">
                  <Button
                    color="primary"
                    variant="bordered"
                    onPress={loadData}
                    isLoading={isLoading}
                    startContent={Icons.upload}
                  >
                    데이터 로드
                  </Button>
                  <Button
                    color="success"
                    variant="bordered"
                    onPress={saveData}
                    isLoading={isLoading}
                    startContent={Icons.save}
                  >
                    데이터 저장
                  </Button>
                </div>
              </div>
              
              <Divider />
              
              <div>
                <h3 className="text-lg font-semibold mb-3">HTML 생성</h3>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    마지막 생성: {lastGenerated ? lastGenerated.toLocaleString() : '없음'}
                  </p>
                  <Button
                    color="primary"
                    onPress={generateHTML}
                    isLoading={isGenerating}
                    startContent={Icons.refresh}
                  >
                    HTML 생성
                  </Button>
                </div>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button color="primary" onPress={onSettingsClose}>
              완료
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* 모니터링 대시보드 */}
      {showMonitoringDashboard && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[80vh] overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 flex justify-between items-center">
              <h2 className="text-xl font-bold">🚀 실시간 브라우저 모니터링</h2>
              <Button
                size="sm"
                variant="light"
                color="white"
                onPress={() => setShowMonitoringDashboard(false)}
              >
                ✕
              </Button>
            </div>
            
            <div className="p-4">
              <div className="mb-4 flex items-center gap-4">
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                  isMonitoringConnected 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {isMonitoringConnected ? '✅ 연결됨' : '❌ 연결 안됨'}
                </div>
                <div className="text-sm text-gray-600">
                  수집된 오류: {monitoringErrors.length}개
                </div>
              </div>
              
              <div className="max-h-96 overflow-y-auto border rounded-lg">
                {monitoringErrors.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <div className="text-4xl mb-2">📊</div>
                    <p>오류가 수집되면 여기에 표시됩니다...</p>
                    <p className="text-sm mt-2">
                      {!isMonitoringConnected && '먼저 "🔗 모니터링 연결" 버튼을 클릭하세요'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 p-4">
                    {monitoringErrors.map((error) => (
                      <div
                        key={error.id}
                        className={`p-3 rounded-lg border-l-4 ${
                          error.type === 'hydration-error' ? 'border-yellow-400 bg-yellow-50' :
                          error.type === 'network-request' ? 'border-green-400 bg-green-50' :
                          error.type === 'network-error' ? 'border-orange-400 bg-orange-50' :
                          'border-red-400 bg-red-50'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="text-sm text-gray-500 mb-1">
                              {new Date(error.timestamp).toLocaleTimeString()}
                            </div>
                            <div className="font-medium text-gray-800 mb-1">
                              {error.message}
                            </div>
                            <div className="text-xs text-gray-600">
                              타입: {error.type}
                            </div>
                            {error.url && (
                              <div className="text-xs text-blue-600 mt-1">
                                URL: {error.url}
                              </div>
                            )}
                            {error.duration && (
                              <div className="text-xs text-green-600 mt-1">
                                응답시간: {error.duration}ms
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
})

export default MemoizedHome
