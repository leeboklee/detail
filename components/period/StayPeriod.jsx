'use client';

import React, { useEffect, useState } from 'react';
import styles from './StayPeriod.module.css';

/**
 * 호텔 상세 페이지 생성기 - 투숙일 컴포넌트
 * 패키지 투숙일 정보 입력 및 관리
 */
export default function StayPeriod({ data = {}, onChange }) {
  const [saveMessage, setSaveMessage] = useState('');
  const [stayData, setStayData] = useState({
    stayStartDate: '',
    stayEndDate: '',
    checkInTime: '15:00',
    checkOutTime: '11:00',
    minimumStay: '1박',
    maximumStay: '',
    blackoutDates: '',
    seasonalRates: '',
    weekendSurcharge: '',
    holidaySurcharge: '',
    cancellationPolicy: '',
    // 추가요금 항목들 (동적 관리)
    additionalCharges: [
      { id: 1, name: '주차비', price: '10,000원/일', description: '지하주차장 이용' },
      { id: 2, name: '조식', price: '20,000원/인', description: '뷔페식 조식' }
    ],
    // 할인 정책들
    discountPolicies: [],
    // 요금 계산 설정
    priceCalculation: {
      basePrice: '',
      taxRate: 10,
      serviceChargeRate: 0,
      roundingRule: 'round' // round, floor, ceil
    },
    ...data
  });

  // 추가요금 항목 관리
  const [nextChargeId, setNextChargeId] = useState(3);
  const [showChargeCalculator, setShowChargeCalculator] = useState(false);

  // 데이터 변경 시 부모 컴포넌트에 전달
  useEffect(() => {
    if (onChange) {
      onChange(stayData);
    }
  }, [stayData, onChange]);

  // 입력 필드 변경 핸들러
  const handleInputChange = (field, value) => {
    setStayData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // 추가요금 항목 추가
  const handleAddCharge = () => {
    const newCharge = {
      id: nextChargeId,
      name: '',
      price: '',
      description: ''
    };
    setStayData(prev => ({
      ...prev,
      additionalCharges: [...prev.additionalCharges, newCharge]
    }));
    setNextChargeId(prev => prev + 1);
  };

  // 추가요금 항목 수정
  const handleChargeChange = (id, field, value) => {
    setStayData(prev => ({
      ...prev,
      additionalCharges: prev.additionalCharges.map(charge =>
        charge.id === id ? { ...charge, [field]: value } : charge
      )
    }));
  };

  // 추가요금 항목 삭제
  const handleRemoveCharge = (id) => {
    setStayData(prev => ({
      ...prev,
      additionalCharges: prev.additionalCharges.filter(charge => charge.id !== id)
    }));
  };

  // 할인 정책 추가
  const handleAddDiscount = () => {
    const newDiscount = {
      id: Date.now(),
      name: '',
      type: 'percentage', // percentage, fixed
      value: '',
      condition: ''
    };
    setStayData(prev => ({
      ...prev,
      discountPolicies: [...prev.discountPolicies, newDiscount]
    }));
  };

  // 할인 정책 수정
  const handleDiscountChange = (id, field, value) => {
    setStayData(prev => ({
      ...prev,
      discountPolicies: prev.discountPolicies.map(discount =>
        discount.id === id ? { ...discount, [field]: value } : discount
      )
    }));
  };

  // 할인 정책 삭제
  const handleRemoveDiscount = (id) => {
    setStayData(prev => ({
      ...prev,
      discountPolicies: prev.discountPolicies.filter(discount => discount.id !== id)
    }));
  };

  // 요금 계산 설정 변경
  const handlePriceCalculationChange = (field, value) => {
    setStayData(prev => ({
      ...prev,
      priceCalculation: {
        ...prev.priceCalculation,
        [field]: value
      }
    }));
  };

  // 샘플 데이터 로드
  const loadSampleData = () => {
    const sampleData = {
      stayStartDate: '2024-03-01',
      stayEndDate: '2024-12-31',
      checkInTime: '15:00',
      checkOutTime: '11:00',
      minimumStay: '1박',
      maximumStay: '30박',
      blackoutDates: '2024-12-24~25, 2024-12-31~2025-01-01',
      seasonalRates: '성수기(7-8월, 12월): 기본 요금의 130%\n비수기(1-2월): 기본 요금의 80%',
      weekendSurcharge: '20%',
      holidaySurcharge: '30%',
      cancellationPolicy: '체크인 3일 전까지 무료 취소\n체크인 1-2일 전: 50% 위약금\n당일 취소: 100% 위약금',
      additionalCharges: [
        { id: 1, name: '주차비', price: '10,000원/일', description: '지하주차장 이용' },
        { id: 2, name: '조식', price: '20,000원/인', description: '뷔페식 조식' },
        { id: 3, name: '엑스트라베드', price: '30,000원/박', description: '추가 침대 제공' },
        { id: 4, name: '레이트체크아웃', price: '20,000원', description: '14시까지 연장' }
      ],
      discountPolicies: [
        { id: 1, name: '장기투숙 할인', type: 'percentage', value: '10', condition: '7박 이상' },
        { id: 2, name: '조기예약 할인', type: 'percentage', value: '15', condition: '30일 전 예약' }
      ]
    };
    setStayData(prev => ({ ...prev, ...sampleData }));
    setSaveMessage('✅ 샘플 데이터가 로드되었습니다!');
    setTimeout(() => setSaveMessage(''), 3000);
  };

  // 개별 DB 저장
  const handleSave = async () => {
    try {
      setSaveMessage('저장 중...');
      setSaveMessage('💡 CRUD 관리 버튼을 사용해 전체 템플릿을 저장하세요.');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      setSaveMessage('❌ 저장 중 오류가 발생했습니다.');
      setTimeout(() => setSaveMessage(''), 3000);
    }
  };

  // 개별 DB 불러오기
  const handleLoad = async () => {
    try {
      setSaveMessage('불러오는 중...');
      setSaveMessage('💡 CRUD 관리 버튼을 사용해 저장된 템플릿을 불러오세요.');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      setSaveMessage('❌ 불러오기 중 오류가 발생했습니다.');
      setTimeout(() => setSaveMessage(''), 3000);
    }
  };

  // 디버깅: 컴포넌트 렌더링 시 데이터 출력
  useEffect(() => {
    console.log('StayPeriod 컴포넌트 렌더링 - 데이터:', stayData);
  }, [stayData]);

  // 안전한 스타일 사용
  const s = styles || {};

  return (
    <div className={s.stayPeriodEditor || 'stay-period-editor'}>
      <div className="flex items-center justify-between mb-4">
        <h3 className={s.title || 'title'}>🏨 투숙일 정보</h3>
        <div className="flex gap-2">
          <div className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded border border-blue-300">
            💡 CRUD 관리 버튼을 사용해 전체 템플릿을 저장하세요
          </div>
        </div>
      </div>

      {saveMessage && (
        <div className={`p-2 rounded mb-4 text-sm ${
          saveMessage.includes('✅') ? 'bg-green-100 text-green-800' :
          saveMessage.includes('❌') ? 'bg-red-100 text-red-800' :
          saveMessage.includes('💡') ? 'bg-yellow-100 text-yellow-800' :
          'bg-blue-100 text-blue-800'
        }`}>
          {saveMessage}
        </div>
      )}
      
      {/* 투숙일 입력 섹션 */}
      <div className={s.stayPeriodSection || 'stay-period-section'}>
        <h4 className="text-md font-medium mb-3">투숙 기간 설정</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-2">투숙 시작일</label>
            <input
              type="text"
              value={stayData.stayStartDate || ''}
              onChange={(e) => handleInputChange('stayStartDate', e.target.value)}
              className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="예: 2024-03-01 또는 2024년 3월 1일"
              style={{
                color: '#000000',
                backgroundColor: '#ffffff'
              }}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">투숙 종료일</label>
            <input
              type="text"
              value={stayData.stayEndDate || ''}
              onChange={(e) => handleInputChange('stayEndDate', e.target.value)}
              className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="예: 2024-03-31 또는 2024년 3월 31일"
              style={{
                color: '#000000',
                backgroundColor: '#ffffff'
              }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-2">체크인 시간</label>
            <input
              type="text"
              value={stayData.checkInTime || ''}
              onChange={(e) => handleInputChange('checkInTime', e.target.value)}
              className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="예: 15:00 또는 오후 3시"
              style={{
                color: '#000000',
                backgroundColor: '#ffffff'
              }}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">체크아웃 시간</label>
            <input
              type="text"
              value={stayData.checkOutTime || ''}
              onChange={(e) => handleInputChange('checkOutTime', e.target.value)}
              className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="예: 11:00 또는 오전 11시"
              style={{
                color: '#000000',
                backgroundColor: '#ffffff'
              }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-2">최소 투숙일</label>
            <input
              type="text"
              value={stayData.minimumStay || ''}
              onChange={(e) => handleInputChange('minimumStay', e.target.value)}
              className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="예: 1박 또는 2박 3일"
              style={{
                color: '#000000',
                backgroundColor: '#ffffff'
              }}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">최대 투숙일</label>
            <input
              type="text"
              value={stayData.maximumStay || ''}
              onChange={(e) => handleInputChange('maximumStay', e.target.value)}
              className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="예: 7박 또는 제한 없음"
              style={{
                color: '#000000',
                backgroundColor: '#ffffff'
              }}
            />
          </div>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">블랙아웃 날짜</label>
          <textarea
            value={stayData.blackoutDates || ''}
            onChange={(e) => handleInputChange('blackoutDates', e.target.value)}
            className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows={2}
            placeholder="투숙 불가 날짜를 입력하세요 (예: 2024-12-24~25, 2024-12-31~2025-01-01)"
            style={{
              color: '#000000',
              backgroundColor: '#ffffff'
            }}
          />
        </div>

        {/* 기본 추가요금 섹션 */}
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h4 className="text-lg font-semibold mb-4 text-yellow-800">💰 기본 추가요금</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-2">주말 추가요금</label>
              <input
                type="text"
                value={stayData.weekendSurcharge || ''}
                onChange={(e) => handleInputChange('weekendSurcharge', e.target.value)}
                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="예: 20% 또는 50,000원"
                style={{
                  color: '#000000',
                  backgroundColor: '#ffffff'
                }}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">성수기/공휴일 추가요금</label>
              <input
                type="text"
                value={stayData.holidaySurcharge || ''}
                onChange={(e) => handleInputChange('holidaySurcharge', e.target.value)}
                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="예: 30% 또는 100,000원"
                style={{
                  color: '#000000',
                  backgroundColor: '#ffffff'
                }}
              />
            </div>
          </div>

          {/* 백업에서 복원된 추가 필드들 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-2">얼리 체크인 요금</label>
              <input
                type="text"
                value={stayData.earlyCheckIn || ''}
                onChange={(e) => handleInputChange('earlyCheckIn', e.target.value)}
                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="예: 20,000원 또는 시간당 10,000원"
                style={{
                  color: '#000000',
                  backgroundColor: '#ffffff'
                }}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">레이트 체크아웃 요금</label>
              <input
                type="text"
                value={stayData.lateCheckOut || ''}
                onChange={(e) => handleInputChange('lateCheckOut', e.target.value)}
                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="예: 30,000원 또는 시간당 15,000원"
                style={{
                  color: '#000000',
                  backgroundColor: '#ffffff'
                }}
              />
            </div>
          </div>

          {/* 요일별 추가요금 섹션 */}
          <div className="mt-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
            <h5 className="text-md font-semibold mb-3 text-purple-800">📅 요일별 추가요금</h5>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-medium mb-1">월요일</label>
                <input
                  type="text"
                  value={stayData.mondayRate || ''}
                  onChange={(e) => handleInputChange('mondayRate', e.target.value)}
                  className="w-full px-2 py-1 border rounded text-sm"
                  placeholder="예: 5%"
                  style={{ color: '#000000', backgroundColor: '#ffffff' }}
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">화요일</label>
                <input
                  type="text"
                  value={stayData.tuesdayRate || ''}
                  onChange={(e) => handleInputChange('tuesdayRate', e.target.value)}
                  className="w-full px-2 py-1 border rounded text-sm"
                  placeholder="예: 5%"
                  style={{ color: '#000000', backgroundColor: '#ffffff' }}
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">수요일</label>
                <input
                  type="text"
                  value={stayData.wednesdayRate || ''}
                  onChange={(e) => handleInputChange('wednesdayRate', e.target.value)}
                  className="w-full px-2 py-1 border rounded text-sm"
                  placeholder="예: 5%"
                  style={{ color: '#000000', backgroundColor: '#ffffff' }}
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">목요일</label>
                <input
                  type="text"
                  value={stayData.thursdayRate || ''}
                  onChange={(e) => handleInputChange('thursdayRate', e.target.value)}
                  className="w-full px-2 py-1 border rounded text-sm"
                  placeholder="예: 5%"
                  style={{ color: '#000000', backgroundColor: '#ffffff' }}
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">금요일</label>
                <input
                  type="text"
                  value={stayData.fridayRate || ''}
                  onChange={(e) => handleInputChange('fridayRate', e.target.value)}
                  className="w-full px-2 py-1 border rounded text-sm"
                  placeholder="예: 15%"
                  style={{ color: '#000000', backgroundColor: '#ffffff' }}
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">토요일</label>
                <input
                  type="text"
                  value={stayData.saturdayRate || ''}
                  onChange={(e) => handleInputChange('saturdayRate', e.target.value)}
                  className="w-full px-2 py-1 border rounded text-sm"
                  placeholder="예: 30%"
                  style={{ color: '#000000', backgroundColor: '#ffffff' }}
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">일요일</label>
                <input
                  type="text"
                  value={stayData.sundayRate || ''}
                  onChange={(e) => handleInputChange('sundayRate', e.target.value)}
                  className="w-full px-2 py-1 border rounded text-sm"
                  placeholder="예: 20%"
                  style={{ color: '#000000', backgroundColor: '#ffffff' }}
                />
              </div>
            </div>
          </div>

          {/* 월별 추가요금 섹션 */}
          <div className="mt-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <h5 className="text-md font-semibold mb-3 text-orange-800">📆 월별 추가요금</h5>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { key: 'januaryRate', label: '1월' },
                { key: 'februaryRate', label: '2월' },
                { key: 'marchRate', label: '3월' },
                { key: 'aprilRate', label: '4월' },
                { key: 'mayRate', label: '5월' },
                { key: 'juneRate', label: '6월' },
                { key: 'julyRate', label: '7월' },
                { key: 'augustRate', label: '8월' },
                { key: 'septemberRate', label: '9월' },
                { key: 'octoberRate', label: '10월' },
                { key: 'novemberRate', label: '11월' },
                { key: 'decemberRate', label: '12월' }
              ].map(({ key, label }) => (
                <div key={key}>
                  <label className="block text-xs font-medium mb-1">{label}</label>
                  <input
                    type="text"
                    value={stayData[key] || ''}
                    onChange={(e) => handleInputChange(key, e.target.value)}
                    className="w-full px-2 py-1 border rounded text-sm"
                    placeholder="예: 10%"
                    style={{ color: '#000000', backgroundColor: '#ffffff' }}
                  />
                </div>
              ))}
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">계절별 요금 정보</label>
            <textarea
              value={stayData.seasonalRates || ''}
              onChange={(e) => handleInputChange('seasonalRates', e.target.value)}
              className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={3}
              placeholder="계절별 요금 변동 정보를 입력하세요"
              style={{
                color: '#000000',
                backgroundColor: '#ffffff'
              }}
            />
          </div>
        </div>

        {/* 추가요금 항목 관리 섹션 */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-blue-800">🏷️ 추가요금 항목 관리</h4>
            <button
              onClick={handleAddCharge}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
            >
              + 항목 추가
            </button>
          </div>
          
          {stayData.additionalCharges.map((charge) => (
            <div key={charge.id} className="flex gap-2 mb-3 p-3 bg-white rounded border">
              <input
                type="text"
                value={charge.name}
                onChange={(e) => handleChargeChange(charge.id, 'name', e.target.value)}
                placeholder="항목명 (예: 주차비)"
                className="flex-1 px-3 py-2 border rounded"
                style={{ color: '#000000', backgroundColor: '#ffffff' }}
              />
              <input
                type="text"
                value={charge.price}
                onChange={(e) => handleChargeChange(charge.id, 'price', e.target.value)}
                placeholder="가격 (예: 10,000원/일)"
                className="flex-1 px-3 py-2 border rounded"
                style={{ color: '#000000', backgroundColor: '#ffffff' }}
              />
              <input
                type="text"
                value={charge.description}
                onChange={(e) => handleChargeChange(charge.id, 'description', e.target.value)}
                placeholder="설명 (선택사항)"
                className="flex-1 px-3 py-2 border rounded"
                style={{ color: '#000000', backgroundColor: '#ffffff' }}
              />
              <button
                onClick={() => handleRemoveCharge(charge.id)}
                className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
              >
                삭제
              </button>
            </div>
          ))}
          
          {stayData.additionalCharges.length === 0 && (
            <div className="text-center py-4 text-gray-500">
              추가요금 항목이 없습니다. '+ 항목 추가' 버튼을 클릭하세요.
            </div>
          )}
        </div>

        {/* 할인 정책 섹션 */}
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-green-800">🎯 할인 정책</h4>
            <button
              onClick={handleAddDiscount}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
            >
              + 할인 정책 추가
            </button>
          </div>
          
          {stayData.discountPolicies.map((discount) => (
            <div key={discount.id} className="flex gap-2 mb-3 p-3 bg-white rounded border">
              <input
                type="text"
                value={discount.name}
                onChange={(e) => handleDiscountChange(discount.id, 'name', e.target.value)}
                placeholder="할인명 (예: 장기투숙 할인)"
                className="flex-1 px-3 py-2 border rounded"
                style={{ color: '#000000', backgroundColor: '#ffffff' }}
              />
              <select
                value={discount.type}
                onChange={(e) => handleDiscountChange(discount.id, 'type', e.target.value)}
                className="px-3 py-2 border rounded"
                style={{ color: '#000000', backgroundColor: '#ffffff' }}
              >
                <option value="percentage">퍼센트 할인</option>
                <option value="fixed">고정 금액 할인</option>
              </select>
              <input
                type="text"
                value={discount.value}
                onChange={(e) => handleDiscountChange(discount.id, 'value', e.target.value)}
                                 placeholder={discount.type === 'percentage' ? '10 (10%)' : '50000 (5만원)'}
                className="w-24 px-3 py-2 border rounded"
                style={{ color: '#000000', backgroundColor: '#ffffff' }}
              />
              <input
                type="text"
                value={discount.condition}
                onChange={(e) => handleDiscountChange(discount.id, 'condition', e.target.value)}
                placeholder="조건 (예: 7박 이상)"
                className="flex-1 px-3 py-2 border rounded"
                style={{ color: '#000000', backgroundColor: '#ffffff' }}
              />
              <button
                onClick={() => handleRemoveDiscount(discount.id)}
                className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
              >
                삭제
              </button>
            </div>
          ))}
          
          {stayData.discountPolicies.length === 0 && (
            <div className="text-center py-4 text-gray-500">
              할인 정책이 없습니다. '+ 할인 정책 추가' 버튼을 클릭하세요.
            </div>
          )}
        </div>

        {/* 요금 계산 설정 */}
        <div className="mt-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
          <h4 className="text-lg font-semibold mb-4 text-purple-800">🧮 요금 계산 설정</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-2">세금율 (%)</label>
              <input
                type="number"
                value={stayData.priceCalculation.taxRate}
                onChange={(e) => handlePriceCalculationChange('taxRate', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border rounded"
                placeholder="10"
                style={{ color: '#000000', backgroundColor: '#ffffff' }}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">서비스료 (%)</label>
              <input
                type="number"
                value={stayData.priceCalculation.serviceChargeRate}
                onChange={(e) => handlePriceCalculationChange('serviceChargeRate', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border rounded"
                placeholder="0"
                style={{ color: '#000000', backgroundColor: '#ffffff' }}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">반올림 규칙</label>
              <select
                value={stayData.priceCalculation.roundingRule}
                onChange={(e) => handlePriceCalculationChange('roundingRule', e.target.value)}
                className="w-full px-3 py-2 border rounded"
                style={{ color: '#000000', backgroundColor: '#ffffff' }}
              >
                <option value="round">반올림</option>
                <option value="floor">내림</option>
                <option value="ceil">올림</option>
              </select>
            </div>
          </div>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">취소 정책</label>
          <textarea
            value={stayData.cancellationPolicy || ''}
            onChange={(e) => handleInputChange('cancellationPolicy', e.target.value)}
            className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows={3}
            placeholder="취소 및 환불 정책을 입력하세요"
            style={{
              color: '#000000',
              backgroundColor: '#ffffff'
            }}
          />
        </div>

        {/* 확장된 추가요금 섹션 */}
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h4 className="text-lg font-semibold mb-4 text-yellow-800">💰 확장된 추가요금</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium mb-2">사전 예약 할인</label>
              <input
                type="text"
                value={stayData.advanceBookingDiscount || ''}
                onChange={(e) => handleInputChange('advanceBookingDiscount', e.target.value)}
                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="예: 30일 전 10% 할인"
                style={{
                  color: '#000000',
                  backgroundColor: '#ffffff'
                }}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">단체 예약 할인</label>
              <input
                type="text"
                value={stayData.groupBookingDiscount || ''}
                onChange={(e) => handleInputChange('groupBookingDiscount', e.target.value)}
                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="예: 10실 이상 15% 할인"
                style={{
                  color: '#000000',
                  backgroundColor: '#ffffff'
                }}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">멤버십 할인</label>
              <input
                type="text"
                value={stayData.loyaltyMemberDiscount || ''}
                onChange={(e) => handleInputChange('loyaltyMemberDiscount', e.target.value)}
                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="예: VIP 회원 20% 할인"
                style={{
                  color: '#000000',
                  backgroundColor: '#ffffff'
                }}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium mb-2">계절별 프로모션</label>
              <textarea
                value={stayData.seasonalPromotions || ''}
                onChange={(e) => handleInputChange('seasonalPromotions', e.target.value)}
                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="봄: 벚꽃 시즌 특가&#10;여름: 휴가철 패키지&#10;가을: 단풍 시즌 할인&#10;겨울: 스키 패키지"
                rows="4"
                style={{
                  color: '#000000',
                  backgroundColor: '#ffffff'
                }}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">한정 특가</label>
              <textarea
                value={stayData.limitedTimeOffers || ''}
                onChange={(e) => handleInputChange('limitedTimeOffers', e.target.value)}
                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="얼리버드 30% 할인&#10;막판 세일 40% 할인&#10;플래시 세일 50% 할인"
                rows="4"
                style={{
                  color: '#000000',
                  backgroundColor: '#ffffff'
                }}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium mb-2">패키지 딜</label>
              <textarea
                value={stayData.packageDeals || ''}
                onChange={(e) => handleInputChange('packageDeals', e.target.value)}
                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="숙박+조식 패키지&#10;숙박+스파 패키지&#10;숙박+관광지 티켓"
                rows="4"
                style={{
                  color: '#000000',
                  backgroundColor: '#ffffff'
                }}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">기업 할인율</label>
              <textarea
                value={stayData.corporateRates || ''}
                onChange={(e) => handleInputChange('corporateRates', e.target.value)}
                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="대기업: 15% 할인&#10;중소기업: 10% 할인&#10;정부기관: 20% 할인"
                rows="4"
                style={{
                  color: '#000000',
                  backgroundColor: '#ffffff'
                }}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium mb-2">주중 프로모션</label>
              <input
                type="text"
                value={stayData.weekdayPromotions || ''}
                onChange={(e) => handleInputChange('weekdayPromotions', e.target.value)}
                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="예: 월-목 숙박 20% 할인"
                style={{
                  color: '#000000',
                  backgroundColor: '#ffffff'
                }}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">주말 특가</label>
              <input
                type="text"
                value={stayData.weekendSpecials || ''}
                onChange={(e) => handleInputChange('weekendSpecials', e.target.value)}
                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="예: 금-일 숙박 패키지"
                style={{
                  color: '#000000',
                  backgroundColor: '#ffffff'
                }}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">연휴 요금</label>
              <input
                type="text"
                value={stayData.holidayRates || ''}
                onChange={(e) => handleInputChange('holidayRates', e.target.value)}
                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="예: 공휴일 30% 추가요금"
                style={{
                  color: '#000000',
                  backgroundColor: '#ffffff'
                }}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium mb-2">취소 위약금</label>
              <textarea
                value={stayData.cancellationPenalties || ''}
                onChange={(e) => handleInputChange('cancellationPenalties', e.target.value)}
                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="7일 전: 무료 취소&#10;3일 전: 1박 요금&#10;당일: 전액 위약금"
                rows="3"
                style={{
                  color: '#000000',
                  backgroundColor: '#ffffff'
                }}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">변경 수수료</label>
              <textarea
                value={stayData.modificationFees || ''}
                onChange={(e) => handleInputChange('modificationFees', e.target.value)}
                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="날짜 변경: 10,000원&#10;객실 변경: 5,000원&#10;인원 변경: 무료"
                rows="3"
                style={{
                  color: '#000000',
                  backgroundColor: '#ffffff'
                }}
              />
            </div>
          </div>
        </div>

        {/* 저장/불러오기 버튼 */}
        <div style={{ 
          margin: '1rem 0',
          padding: '1rem',
          border: '2px dashed #d1d5db',
          borderRadius: '0.5rem',
          backgroundColor: '#f8fafc'
        }}>
          <div style={{ 
            display: 'flex', 
            gap: '1rem',
            justifyContent: 'center',
            flexWrap: 'wrap',
            marginBottom: '0.5rem'
          }}>
            <button
              onClick={handleSave}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                fontWeight: '600',
                fontSize: '0.875rem',
                cursor: 'pointer',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                transition: 'all 0.2s',
                minWidth: '120px'
              }}
              onMouseOver={(e) => {
                e.target.style.backgroundColor = '#059669';
                e.target.style.transform = 'scale(1.05)';
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = '#10b981';
                e.target.style.transform = 'scale(1)';
              }}
            >
              💾 저장
            </button>
            <button
              onClick={handleLoad}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                fontWeight: '600',
                fontSize: '0.875rem',
                cursor: 'pointer',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                transition: 'all 0.2s',
                minWidth: '120px'
              }}
              onMouseOver={(e) => {
                e.target.style.backgroundColor = '#2563eb';
                e.target.style.transform = 'scale(1.05)';
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = '#3b82f6';
                e.target.style.transform = 'scale(1)';
              }}
            >
              📂 불러오기
            </button>
            <button
              onClick={loadSampleData}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#6b7280',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                fontWeight: '600',
                fontSize: '0.875rem',
                cursor: 'pointer',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                transition: 'all 0.2s',
                minWidth: '140px'
              }}
              onMouseOver={(e) => {
                e.target.style.backgroundColor = '#4b5563';
                e.target.style.transform = 'scale(1.05)';
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = '#6b7280';
                e.target.style.transform = 'scale(1)';
              }}
            >
              📋 샘플 데이터
            </button>
          </div>
          <p style={{ 
            textAlign: 'center', 
            fontSize: '0.8rem', 
            color: '#64748b', 
            margin: 0 
          }}>
            💡 변경사항은 실시간으로 저장됩니다
          </p>
        </div>
      </div>
      
      {/* 투숙일 정보 요약 */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-medium mb-2">📋 투숙일 정보 요약</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
          <div>
            <span className="font-medium">투숙 시작일:</span> {stayData.stayStartDate || '미설정'}
          </div>
          <div>
            <span className="font-medium">투숙 종료일:</span> {stayData.stayEndDate || '미설정'}
          </div>
          <div>
            <span className="font-medium">체크인:</span> {stayData.checkInTime || '미설정'}
          </div>
          <div>
            <span className="font-medium">체크아웃:</span> {stayData.checkOutTime || '미설정'}
          </div>
          <div>
            <span className="font-medium">최소 투숙:</span> {stayData.minimumStay || '미설정'}
          </div>
          <div>
            <span className="font-medium">최대 투숙:</span> {stayData.maximumStay || '미설정'}
          </div>
        </div>
        
        {/* 추가요금 요약 */}
        {stayData.additionalCharges.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="font-medium mb-2">추가요금 항목:</div>
            <div className="text-xs space-y-1">
              {stayData.additionalCharges.map((charge) => (
                <div key={charge.id}>
                  • {charge.name}: {charge.price} {charge.description && `(${charge.description})`}
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* 할인 정책 요약 */}
        {stayData.discountPolicies.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="font-medium mb-2">할인 정책:</div>
            <div className="text-xs space-y-1">
              {stayData.discountPolicies.map((discount) => (
                <div key={discount.id}>
                  • {discount.name}: {discount.value}{discount.type === 'percentage' ? '%' : '원'} 할인 ({discount.condition})
                </div>
              ))}
            </div>
          </div>
        )}
        
        {(stayData.blackoutDates || stayData.cancellationPolicy) && (
          <div className="mt-2 pt-2 border-t border-gray-200">
            {stayData.blackoutDates && (
              <div className="mb-1">
                <span className="font-medium">블랙아웃:</span> {stayData.blackoutDates}
              </div>
            )}
            {stayData.cancellationPolicy && (
              <div>
                <span className="font-medium">취소정책:</span> {stayData.cancellationPolicy}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 