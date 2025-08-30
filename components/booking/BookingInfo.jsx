'use client';

import React, { useState, useEffect } from 'react';
import { Button, Input, Textarea } from "@heroui/react";
import Labels from '@/src/shared/labels';

/**
 * 예약안내 컴포넌트 - 숙박권 구매안내 내용 입력
 */
const BookingInfo = ({ value, onChange, displayMode = false }) => {
  const [bookingData, setBookingData] = useState({
    title: "숙박권 구매안내",
    purchaseGuide: `1. 결제 → 희망날짜 접수 페이지 링크 문자(카톡)전송
2. 희망날짜 접수 → 대기 → 예약확정 / 마감 안내전송
* 문자(카톡)는 근무시간내 수신자 번호로 전송

⚠️ 체크인 2일전~ 당일 예약은 유선 카톡 상담후 출발!

본 숙박권은 대기예약 상품으로 구매즉시 확정 되지않습니다.
구매완료 및 주문번호는 결제번호를 의미합니다 (예약확정X)
결제후에도 희망날짜 마감시 전액환불/날짜변경 안내드립니다.
예약 미확정 관련 문제는 책임질수 없음을 안내드립니다.
1박 숙박권이며 연박 / 객실 추가시 수량에 맞춰 구매
ex) 1박 2실 : 2매 / 2박 1실 : 2매
요일별 추가요금이 있으므로 하단 요금표를 확인 부탁드립니다.`,
    referenceNotes: `해피콜/문자수신 불가 번호는 예약 및 주문취소 됩니다.
예약확정 후 문자 미수신 사유로 취소시 위약금 적용됩니다.
취소/변경 위약규정은 아래 하단 참고 부탁드립니다.
부분환불 불가
옵션수량은 대기가능 수량을 의미
현장 상황에 따라 부대시설 휴장 및 운영시간이 변동 될 수 있음
상세페이지와 상품명이 다른 경우 상품명 우선적용
추가요금 발생시 추가금 안내후 예약확정
빠른 확정 문의는 카톡상담 부탁드립니다.`,
    kakaoChannel: "카톡에서 한투어 채널 추가하세요 +"
  });

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [history, setHistory] = useState([]);

  // props에서 초기값 설정
  useEffect(() => {
    if (value) {
      setBookingData(prev => ({
        title: value.title ?? prev.title,
        purchaseGuide: value.purchaseGuide ?? prev.purchaseGuide,
        referenceNotes: value.referenceNotes ?? prev.referenceNotes,
        kakaoChannel: value.kakaoChannel ?? prev.kakaoChannel
      }));
    }
  }, [value]);

  // 데이터베이스에서 예약안내 정보 불러오기
  const loadBookingInfo = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/bookingInfo');
      if (response.ok) {
        const data = await response.json();
        setBookingData(data);
        if (onChange) {
          onChange(data);
        }
        setMessage('예약안내 정보를 불러왔습니다.');
        // 최근 저장 목록도 함께 로드
        const listRes = await fetch('/api/bookingInfo?list=1');
        if (listRes.ok) {
          const { items } = await listRes.json();
          setHistory(items || []);
        }
      } else {
        setMessage('예약안내 정보를 불러오는데 실패했습니다.');
      }
    } catch (error) {
      console.error('예약안내 불러오기 오류:', error);
      setMessage('예약안내 정보를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 데이터베이스에 예약안내 정보 저장
  const saveBookingInfo = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/bookingInfo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
      });
      
      if (response.ok) {
        const result = await response.json();
        if (onChange) {
          onChange(bookingData);
        }
        setMessage('예약안내 정보가 저장되었습니다.');
        // 저장 후 목록 갱신
        const listRes = await fetch('/api/bookingInfo?list=1');
        if (listRes.ok) {
          const { items } = await listRes.json();
          setHistory(items || []);
        }
      } else {
        setMessage('예약안내 정보 저장에 실패했습니다.');
      }
    } catch (error) {
      console.error('예약안내 저장 오류:', error);
      setMessage('예약안내 정보 저장 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 필드 변경 핸들러
  const handleFieldChange = (field, value) => {
    const updatedData = { ...bookingData, [field]: value };
    setBookingData(updatedData);
    if (onChange) {
      onChange(updatedData);
    }
  };

  // 미리보기 모드
  if (displayMode) {
    return (
      <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold text-gray-800 mb-2">📞 예약안내</h3>
          <h4 className="text-xl font-semibold text-blue-600">{bookingData.title}</h4>
        </div>
        
        {/* 숙박권 구매안내 */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h5 className="text-lg font-semibold text-blue-800 mb-3">📋 숙박권 구매안내</h5>
          <div className="text-sm text-blue-700 whitespace-pre-line leading-relaxed">
            {bookingData.purchaseGuide}
          </div>
        </div>
        
        {/* 참고사항 */}
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <h5 className="text-lg font-semibold text-yellow-800 mb-3">📋 참고사항</h5>
          <div className="text-sm text-yellow-700 whitespace-pre-line leading-relaxed">
            {bookingData.referenceNotes}
          </div>
        </div>
        
        {/* 카톡 채널 */}
        {bookingData.kakaoChannel && (
          <div className="text-center">
            <div className="inline-block bg-yellow-400 px-6 py-3 rounded-lg text-yellow-900 font-semibold">
              💬 {bookingData.kakaoChannel}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 헤더 및 생성 버튼 */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">📞 예약 안내 관리</h2>
          <p className="text-gray-600 mt-1">숙박권 구매 및 예약 안내 정보를 관리하세요</p>
        </div>
        
        <Button
          color="success"
          variant="bordered"
          onPress={() => {
            console.log('=== 생성 버튼 클릭 ===');
            console.log('현재 bookingData 상태:', bookingData);
            console.log('onChange 함수 타입:', typeof onChange);
            console.log('onChange 함수 존재 여부:', !!onChange);
            
            if (onChange) {
              console.log('onChange 호출 시작');
              console.log('전달할 데이터:', bookingData);
              onChange(bookingData);
              console.log('onChange 호출 완료');
            } else {
              console.log('❌ onChange가 undefined입니다!');
              console.log('이것이 문제의 원인일 수 있습니다.');
            }
            
            alert('예약 안내가 미리보기에 생성되었습니다.');
          }}
          startContent="✨"
        >
          생성
        </Button>
      </div>
      
      {message && (
        <div className={`p-3 rounded-lg text-sm ${
          message.includes('성공') || message.includes('불러왔습니다') || message.includes('저장되었습니다')
            ? 'bg-green-100 text-green-800 border border-green-200'
            : 'bg-red-100 text-red-800 border border-red-200'
        }`}>
          {message}
        </div>
      )}
      
      {/* 제목 입력 */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">제목</label>
        <Input
          value={bookingData.title}
          onChange={(e) => handleFieldChange('title', e.target.value)}
          placeholder="예약안내 제목을 입력하세요"
          className="w-full"
        />
      </div>

      {/* 최근 저장 목록 */}
      {history.length > 0 && (
        <div className="space-y-2">
          <div className="text-sm font-semibold text-gray-700">최근 저장된 예약안내</div>
          <div className="bg-gray-50 border rounded p-3 max-h-48 overflow-auto text-sm">
            {history.map(item => (
              <div
                key={item.id}
                className="flex items-center justify-between py-1 border-b last:border-b-0"
              >
                <div className="truncate pr-3">
                  <span className="text-gray-900">{item.title}</span>
                  <span className="text-gray-500 ml-2">{new Date(item.createdAt).toLocaleString('ko-KR')}</span>
                </div>
                <button
                  className="text-blue-600 hover:underline shrink-0"
                  onClick={() => {
                    const selected = {
                      title: item.title,
                      purchaseGuide: item.purchaseGuide,
                      referenceNotes: item.referenceNotes,
                      kakaoChannel: item.kakaoChannel || ''
                    };
                    setBookingData(selected);
                    if (onChange) onChange(selected);
                  }}
                >
                  불러오기
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* 숙박권 구매안내 섹션 */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          📋 숙박권 구매안내
        </label>
        <Textarea
          value={bookingData.purchaseGuide}
          onChange={(e) => handleFieldChange('purchaseGuide', e.target.value)}
          placeholder="숙박권 구매안내 내용을 입력하세요"
          className="w-full min-h-[200px]"
          rows={12}
        />
      </div>
      
      {/* 참고사항 섹션 */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          📋 참고사항
        </label>
        <Textarea
          value={bookingData.referenceNotes}
          onChange={(e) => handleFieldChange('referenceNotes', e.target.value)}
          placeholder="참고사항을 입력하세요"
          className="w-full min-h-[200px]"
          rows={12}
        />
      </div>
      
      {/* 카톡 채널 정보 */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          💬 카톡 채널 정보
        </label>
        <Input
          value={bookingData.kakaoChannel}
          onChange={(e) => handleFieldChange('kakaoChannel', e.target.value)}
          placeholder="카톡 채널 정보를 입력하세요"
          className="w-full"
        />
      </div>
    </div>
  );
};

export default BookingInfo; 