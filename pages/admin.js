'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, Card, CardBody, Input, Textarea, Select, SelectItem, Chip, Divider, Spinner } from '@heroui/react'

// 컴포넌트 imports
import { HotelInfoSection } from '@/components/sections/HotelInfoSection'
import RoomInfoEditor from '@/components/room/RoomInfoEditor'
import FacilitiesInfo from '@/components/facilities/FacilitiesInfo'
import CheckInOutInfo from '@/components/checkin/CheckInOutInfo'
import Package from '@/components/package/Package'
import PriceTable from '@/components/price/PriceTable'
import CancelPolicy from '@/components/cancel/CancelPolicy'
import BookingConfirmation from '@/components/policy/BookingConfirmation'
import Notice from '@/components/notice/Notice'

// 아이콘 대신 이모지 사용
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
    includes: ['샴페인', '꽃다발', '늦은 체크아웃']
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

// 탭 설정
const TAB_CONFIG = [
  { key: 'hotel', label: '호텔 정보', icon: Icons.home, component: HotelInfoSection },
  { key: 'rooms', label: '객실 정보', icon: Icons.users, component: RoomInfoEditor },
  { key: 'facilities', label: '시설 정보', icon: Icons.settings, component: FacilitiesInfo },
  { key: 'checkin', label: '체크인/아웃', icon: Icons.calendar, component: CheckInOutInfo },
  { key: 'packages', label: '패키지', icon: Icons.file, component: Package },
  { key: 'pricing', label: '요금표', icon: Icons.dollar, component: PriceTable },
  { key: 'cancel', label: '취소규정', icon: Icons.shield, component: CancelPolicy },
  { key: 'booking', label: '예약안내', icon: Icons.database, component: BookingConfirmation },
  { key: 'notices', label: '공지사항', icon: Icons.file, component: Notice }
]

export default function AdminPage() {
  const [data, setData] = useState(INITIAL_DATA)
  const [activeTab, setActiveTab] = useState('hotel')
  const [generatedHtml, setGeneratedHtml] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [lastGenerated, setLastGenerated] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' })
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState('grid') // grid, list
  
  const { isOpen: isModalOpen, onOpen: onModalOpen, onClose: onModalClose } = useDisclosure()
  const { isOpen: isPreviewOpen, onOpen: onPreviewOpen, onClose: onPreviewClose } = useDisclosure()
  const { isOpen: isSettingsOpen, onOpen: onSettingsOpen, onClose: onSettingsClose } = useDisclosure()
  // 호텔 정보 모달 상태 추가
  const { isOpen: isHotelModalOpen, onOpen: onHotelModalOpen, onClose: onHotelModalClose } = useDisclosure();

  // 알림 표시 함수
  const showNotification = useCallback((message, type = 'success') => {
    setNotification({ show: true, message, type })
    setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 3000)
  }, [])

  // 데이터 업데이트 핸들러
  const updateData = useCallback((section, newData) => {
    setData(prev => ({
      ...prev,
      [section]: newData
    }))
    console.log(`${section} 데이터 업데이트:`, newData)
    showNotification(`${section} 데이터가 업데이트되었습니다.`)
  }, [showNotification])

  // 데이터 저장 함수
  const saveData = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/saveSession', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      if (response.ok) {
        showNotification('데이터가 성공적으로 저장되었습니다.', 'success')
      } else {
        throw new Error('저장 실패')
      }
    } catch (error) {
      showNotification('데이터 저장 중 오류가 발생했습니다.', 'error')
    } finally {
      setIsLoading(false)
    }
  }, [data, showNotification])

  // 데이터 로드 함수
  const loadData = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/saveSession')
      if (response.ok) {
        const result = await response.json()
        if (result.status === 'success' && result.data) {
          // id 필드를 제외한 데이터만 설정
          const { id, ...dataToSet } = result.data
          setData(dataToSet)
          showNotification('데이터가 성공적으로 로드되었습니다.', 'success')
        } else {
          showNotification('저장된 데이터가 없습니다.', 'warning')
        }
      } else {
        throw new Error('데이터 로드 실패')
      }
    } catch (error) {
      showNotification('데이터 로드 중 오류가 발생했습니다.', 'error')
    } finally {
      setIsLoading(false)
    }
  }, [showNotification])

  // HTML 생성 함수
  const generateHTML = useCallback(async () => {
    setIsGenerating(true)
    console.log('HTML 생성 시작...')
    
    try {
      const fullHtml = `<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${data.hotel.name} - 호텔 상세정보</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: 'Noto Sans KR', -apple-system, BlinkMacSystemFont, sans-serif; 
            line-height: 1.6; color: #333; background: #f8f9fa; padding: 20px; 
        }
        .container { 
            max-width: 1200px; margin: 0 auto; background: white; 
            border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); overflow: hidden; 
        }
        .section { padding: 32px; border-bottom: 1px solid #eee; }
        .section:last-child { border-bottom: none; }
        h1 { font-size: 2.5em; color: #2c3e50; margin-bottom: 1em; }
        h2 { font-size: 2em; color: #34495e; margin-bottom: 0.8em; border-bottom: 3px solid #3498db; padding-bottom: 0.5em; }
        h3 { font-size: 1.5em; color: #2c3e50; margin-bottom: 0.6em; }
        p { margin-bottom: 1em; line-height: 1.8; }
        .grid { display: grid; gap: 20px; margin: 20px 0; }
        .grid-2 { grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); }
        .card { border: 1px solid #ddd; border-radius: 8px; padding: 20px; background: #fafafa; }
        .table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .table th, .table td { border: 1px solid #ddd; padding: 12px; text-align: left; }
        .table th { background: #f2f2f2; font-weight: 600; }
        .highlight { background: #e8f4fd; padding: 20px; border-radius: 8px; border-left: 4px solid #3498db; }
        .badge { display: inline-block; background: #3498db; color: white; padding: 4px 12px; border-radius: 20px; font-size: 0.9em; margin: 2px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="section">
            <h1>${data.hotel.name}</h1>
            <p><strong>주소:</strong> ${data.hotel.address}</p>
            <p>${data.hotel.description}</p>
            <p><strong>전화번호:</strong> ${data.hotel.phoneNumber}</p>
            <p><strong>체크인:</strong> ${data.hotel.checkInTime} | <strong>체크아웃:</strong> ${data.hotel.checkOutTime}</p>
        </div>
        
        <div class="section">
            <h2>객실 정보</h2>
            <div class="grid grid-2">
                ${data.rooms.map(room => `
                    <div class="card">
                        <h3>${room.roomType} (${room.view})</h3>
                        <p><strong>크기:</strong> ${room.roomSize}</p>
                        <p><strong>침대:</strong> ${room.bedInfo}</p>
                        <p><strong>최대 인원:</strong> ${room.maxOccupancy}명</p>
                        <p>${room.description}</p>
                        <div>
                            <strong>편의시설:</strong>
                            ${room.amenities.map(amenity => `<span class="badge">${amenity}</span>`).join('')}
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
        
        <div class="section">
            <h2>패키지 정보</h2>
            <div class="grid grid-2">
                ${data.packages.map(pkg => `
                    <div class="card">
                        <h3>${pkg.name}</h3>
                        <p>${pkg.description}</p>
                        <p><strong>가격:</strong> ${pkg.price.toLocaleString()}원</p>
                        <div>
                            <strong>포함사항:</strong>
                            ${pkg.includes.map(item => `<span class="badge">${item}</span>`).join('')}
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
        
        <div class="section">
            <h2>취소/환불 규정</h2>
            <div class="highlight">
                <p><strong>무료 취소:</strong> ${data.cancel.freeCancellation}</p>
                <p><strong>취소 수수료:</strong> ${data.cancel.cancellationFee}</p>
                <p><strong>노쇼:</strong> ${data.cancel.noShow}</p>
                <p><strong>변경 정책:</strong> ${data.cancel.modificationPolicy}</p>
            </div>
        </div>
    </div>
</body>
</html>`

      setGeneratedHtml(fullHtml)
      setLastGenerated(new Date())
      console.log('HTML 생성 완료, 길이:', fullHtml.length)
    } catch (error) {
      console.error('HTML 생성 오류:', error)
    } finally {
      setIsGenerating(false)
    }
  }, [data])

  // 클립보드 복사
  const copyToClipboard = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(generatedHtml)
      showNotification('HTML이 클립보드에 복사되었습니다!', 'success')
    } catch (error) {
      console.error('복사 실패:', error)
      // 폴백: 텍스트 영역 사용
      const textArea = document.createElement('textarea')
      textArea.value = generatedHtml
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      showNotification('HTML이 클립보드에 복사되었습니다!', 'success')
    }
  }, [generatedHtml, showNotification])

  // HTML 다운로드
  const downloadHtml = useCallback(() => {
    const blob = new Blob([generatedHtml], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `hotel-${Date.now()}.html`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    showNotification('HTML 파일이 다운로드되었습니다.', 'success')
  }, [generatedHtml, showNotification])

  // 현재 탭 설정
  const currentTabConfig = TAB_CONFIG.find(tab => tab.key === activeTab)
  const CurrentComponent = currentTabConfig?.component

  // 필터링된 탭 설정
  const filteredTabs = TAB_CONFIG.filter(tab => 
    tab.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tab.key.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // 탭 클릭 핸들러 수정
  const handleTabClick = (tab) => {
    setActiveTab(tab.key);
    if (tab.key === 'hotel') {
      onHotelModalOpen();
    } else if (tab.key === 'rooms' || tab.key === 'notices') {
      onModalOpen();
    }
  };

  // value 전달 로직 가독성 및 오류 방지 개선
  let sectionValue = data[activeTab];
  if (activeTab === 'rooms' && (!data.rooms || !Array.isArray(data.rooms) || data.rooms.length === 0)) {
    sectionValue = [{
      name: '', type: '', structure: '', bedType: '', view: '', standardCapacity: 2, maxCapacity: 2, description: '', image: '', amenities: []
    }];
  } else if (activeTab === 'hotel' && (!data.hotel || typeof data.hotel !== 'object')) {
    sectionValue = { name: '', address: '', description: '', imageUrl: '', phone: '', email: '', website: '' };
  } else if (activeTab === 'notices' && (!data.notices || !Array.isArray(data.notices) || data.notices.length === 0)) {
    sectionValue = [{ content: '' }];
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
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
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                🏨 호텔 상세페이지 관리자
                {isLoading && <Spinner size="sm" />}
              </h1>
              <p className="text-gray-600 mt-2 text-lg">호텔 정보를 관리하고 HTML을 생성하세요</p>
            </div>
            <div className="flex gap-3">
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

      {/* 1. 상단 가로 탭 메뉴 추가 */}
      <div className="flex gap-2 border-b bg-white px-6 pt-4">
        {TAB_CONFIG.map(tab => (
          <button
            key={tab.key}
            className={`tab ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => handleTabClick(tab)}
            type="button"
          >
            <span className="text-xl mr-1">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* 메인 컨텐츠: 선택된 탭만 가로 카드로 보여줌 */}
      <div className="flex flex-row gap-6 mt-8 px-6">
        {TAB_CONFIG.filter(tab => tab.key === activeTab).map(tab => (
          <Card
            key={tab.key}
            isPressable
            className="w-full max-w-xl hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-105"
            onPress={() => handleTabClick(tab)}
          >
            <CardBody className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl">
                  <span className="text-3xl">{tab.icon}</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-1">{tab.label}</h3>
                  <p className="text-gray-600 text-sm">
                    {tab.key === 'hotel' && '기본 정보 관리'}
                    {tab.key === 'rooms' && `${data.rooms.length}개 객실`}
                    {tab.key === 'facilities' && '시설 및 편의시설'}
                    {tab.key === 'checkin' && '체크인/아웃 정책'}
                    {tab.key === 'packages' && `${data.packages.length}개 패키지`}
                    {tab.key === 'pricing' && '요금 및 가격표'}
                    {tab.key === 'cancel' && '취소 및 환불 규정'}
                    {tab.key === 'booking' && '예약 관련 안내'}
                    {tab.key === 'notices' && `${data.notices.length}개 공지`}
                  </p>
                  <div className="mt-2">
                    <Chip size="sm" color="primary" variant="flat">
                      편집 가능
                    </Chip>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* 2. 모달(팝업) 동작 오류 수정: CurrentComponent, useDisclosure, 조건 명확화 */}
      {/* 호텔 정보 모달(별도) */}
      <Modal
        key="hotel"
        isOpen={isHotelModalOpen}
        onClose={onHotelModalClose}
        size="5xl"
        scrollBehavior="inside"
        classNames={{ base: "max-h-[90vh]", body: "p-0" }}
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
            <HotelInfoSection
              value={data.hotel}
              onChange={newData => updateData('hotel', newData)}
            />
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
      {/* 기존 공통 모달(rooms, notices만) */}
      {activeTab !== 'hotel' && (
        <Modal
          key={activeTab}
          isOpen={isModalOpen}
          onClose={onModalClose}
          size="5xl"
          scrollBehavior="inside"
          classNames={{ base: "max-h-[90vh]", body: "p-0" }}
        >
          <ModalContent>
            <ModalHeader className="flex items-center justify-between px-6 py-4 border-b">
              <div className="flex items-center gap-3">
                {TAB_CONFIG.find(tab => tab.key === activeTab) && (
                  <>
                    <span className="text-2xl">{TAB_CONFIG.find(tab => tab.key === activeTab).icon}</span>
                    <span className="text-xl font-bold">{TAB_CONFIG.find(tab => tab.key === activeTab).label}</span>
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
                  저장
                </Button>
              </div>
            </ModalHeader>
            <ModalBody className="p-6">
              {TAB_CONFIG.find(tab => tab.key === activeTab)?.component && (
                React.createElement(
                  TAB_CONFIG.find(tab => tab.key === activeTab).component,
                  {
                    value: sectionValue,
                    onChange: (newData) => updateData(activeTab, newData)
                  }
                )
              )}
            </ModalBody>
            <ModalFooter>
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
      >
        <ModalContent>
          <ModalHeader className="flex items-center justify-between px-6 py-4 border-b">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{Icons.eye}</span>
              <span className="text-xl font-bold">미리보기</span>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                color="primary"
                onPress={generateHTML}
                isLoading={isGenerating}
                startContent={Icons.refresh}
              >
                새로고침
              </Button>
              {generatedHtml && (
                <>
                  <Button
                    size="sm"
                    color="success"
                    onPress={copyToClipboard}
                    startContent={Icons.copy}
                  >
                    복사
                  </Button>
                  <Button
                    size="sm"
                    color="primary"
                    onPress={downloadHtml}
                    startContent={Icons.download}
                  >
                    다운로드
                  </Button>
                </>
              )}
            </div>
          </ModalHeader>
          <ModalBody className="p-0">
            {generatedHtml ? (
              <iframe
                srcDoc={generatedHtml}
                className="w-full h-full min-h-[80vh]"
                title="미리보기"
              />
            ) : (
              <div className="flex items-center justify-center h-96">
                <div className="text-center">
                  <span className="text-6xl mb-4">{Icons.eye}</span>
                  <p className="text-gray-500 text-lg mb-6">HTML을 먼저 생성해주세요</p>
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
        size="2xl"
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
                <h3 className="text-lg font-semibold mb-3">HTML 생성 설정</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span>자동 저장</span>
                    <input type="checkbox" defaultChecked className="w-4 h-4" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>미리보기 자동 새로고침</span>
                    <input type="checkbox" defaultChecked className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button color="danger" variant="light" onPress={onSettingsClose}>
              취소
            </Button>
            <Button color="primary" onPress={onSettingsClose}>
              저장
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  )
} 