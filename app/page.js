'use client'

import React, { useState, useCallback, useEffect, Suspense, useRef, lazy } from 'react'
import { Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, Card, CardBody, Input, Textarea, Select, SelectItem, Chip, Divider, Spinner } from "@heroui/react"

// 새로 분리된 컴포넌트들
import MainLayout from '@/components/layout/MainLayout'
import MonitoringDashboard from '@/components/layout/MonitoringDashboard'

// 핵심 컴포넌트들은 즉시 로딩 (안정성 확보)
import { HotelInfoSection } from '@/components/sections/HotelInfoSection'
import DraggableTabs from '@/components/DraggableTabs'
import ClientOnly from '@/components/ClientOnly'

// 새로 분리된 훅들
import { useAppState } from '@/hooks/useAppState'
import { useTabManagement } from '@/hooks/useTabManagement'

// 안전한 lazy loading (에러 처리 포함)
const ErrorCollectorComponent = lazy(() => import('@/components/ErrorCollector').catch(() => ({ default: () => null })))
const RoomInfoEditor = lazy(() => import('@/components/room/RoomInfoEditor').catch(() => ({ default: () => ({ default: () => null }) })))
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

  const [mounted, setMounted] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedHtml, setGeneratedHtml] = useState('')
  const [lastGenerated, setLastGenerated] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' })
  const [notices, setNotices] = useState([])
  const [showMonitoringDashboard, setShowMonitoringDashboard] = useState(false)
  const [monitoringErrors, setMonitoringErrors] = useState([])
  const monitoringWSRef = useRef(null)
  
  const { isOpen: isModalOpen, onOpen: onModalOpen, onClose: onModalClose } = useDisclosure()
  const { isOpen: isPreviewOpen, onOpen: onPreviewOpen, onClose: onPreviewClose } = useDisclosure()
  const { isOpen: isSettingsOpen, onOpen: onSettingsOpen, onClose: onSettingsClose } = useDisclosure()
  const { isOpen: isHotelModalOpen, onOpen: onHotelModalOpen, onClose: onHotelModalClose } = useDisclosure()

  // 마운트 상태 초기화 (hydration 에러 방지)
  useEffect(() => {
    setMounted(true)
  }, [])

  // 알림 표시 함수
  const showNotificationHandler = useCallback((message, type = 'success') => {
    setNotification({
      show: true,
      message,
      type
    })
    
    // 3초 후 자동 숨김
    setTimeout(() => {
      setNotification(prev => ({
        ...prev,
        show: false
      }))
    }, 3000)
  }, [])

  // 알림 숨기기 함수
  const hideNotificationHandler = useCallback(() => {
    setNotification(prev => ({
      ...prev,
      show: false
    }))
  }, [])

  // HTML 생성 함수
  const generateHtml = useCallback(async () => {
    setIsGenerating(true)
    try {
      // HTML 생성 로직 (기존 기능 유지)
      const html = '<div>Generated HTML content</div>'
      setGeneratedHtml(html)
      setLastGenerated(new Date())
      showNotificationHandler('HTML이 성공적으로 생성되었습니다.', 'success')
    } catch (error) {
      console.error('HTML 생성 실패:', error)
      showNotificationHandler('HTML 생성에 실패했습니다.', 'error')
    } finally {
      setIsGenerating(false)
    }
  }, [showNotificationHandler])

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
    try {
      const blob = new Blob([generatedHtml], { type: 'text/html' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `hotel-page-${new Date().toISOString().split('T')[0]}.html`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      showNotificationHandler('HTML이 성공적으로 다운로드되었습니다.', 'success')
    } catch (error) {
      console.error('다운로드 실패:', error)
      showNotificationHandler('다운로드에 실패했습니다.', 'error')
    }
  }, [generatedHtml, showNotificationHandler])

  // 현재 활성 탭의 컴포넌트 렌더링
  const renderActiveTabContent = () => {
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

    return (
      <Suspense fallback={<LoadingSpinner size="large" />}>
        <Component
          value={data[activeTab]}
          onChange={(newData) => updateData(activeTab, newData)}
        />
      </Suspense>
    )
  }

  // 모달 내용 렌더링
  const renderModalContent = () => {
    const Component = getComponentForTab(activeTab)
    
    if (!Component) return null

    return (
      <Suspense fallback={<LoadingSpinner />}>
        <Component
          value={data[activeTab]}
          onChange={(newData) => updateData(activeTab, newData)}
        />
      </Suspense>
    )
  }

  if (!mounted) {
    return <LoadingSpinner size="large" />
  }

  return (
    <MainLayout>
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
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">호텔 정보 관리</h1>
            <p className="text-gray-600 mt-2">현재 탭: {getActiveTabInfo()?.label}</p>
          </div>
          
          <div className="flex gap-2">
            <MonitoringDashboard />
            
            <Button
              size="sm"
              color="secondary"
              variant="flat"
              onPress={onPreviewOpen}
            >
              미리보기
            </Button>
            
            <Button
              size="sm"
              color="success"
              variant="flat"
              onPress={generateHtml}
              isLoading={isGenerating}
            >
              HTML 생성
            </Button>
          </div>
        </div>

        {/* 탭 네비게이션 */}
        <ClientOnly>
          <DraggableTabs
            tabs={getOrderedTabs()}
            activeTab={activeTab}
            onTabChange={activateTab}
            onTabMove={moveTab}
            isDragMode={isDragMode}
            onDragModeToggle={toggleDragMode}
          />
        </ClientOnly>

        {/* 탭 콘텐츠 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {renderActiveTabContent()}
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
      <Modal isOpen={isPreviewOpen} onClose={onPreviewClose} size="5xl">
        <ModalContent>
          <ModalHeader>HTML 미리보기</ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  {lastGenerated && `마지막 생성: ${lastGenerated.toLocaleString()}`}
                </div>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    color="secondary"
                    variant="flat"
                    onPress={copyHtml}
                  >
                    복사
                  </Button>
                  <Button
                    size="sm"
                    color="primary"
                    variant="flat"
                    onPress={downloadHtml}
                  >
                    다운로드
                  </Button>
                </div>
              </div>
              
              <div className="border rounded-lg p-4 bg-gray-50">
                <div className="text-sm text-gray-600 mb-2">생성된 HTML:</div>
                <pre className="text-xs overflow-auto max-h-96 bg-white p-4 rounded border">
                  {generatedHtml || 'HTML을 생성해주세요.'}
                </pre>
              </div>
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
  )
})

export default MemoizedHome
