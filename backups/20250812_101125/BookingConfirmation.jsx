'use client';

import React, { useState, useEffect } from 'react';
import { Button, Input, Textarea, Card, CardBody, CardHeader, Chip } from "@heroui/react";

// 초기 데이터 구조 (통합 텍스트)
const getDefaultData = () => ({
  bookingText: `숙박권 구매안내

프로세스 단계:
1. 결제 → 휴양날짜 접수 페이지 링크 문자(카톡)전송
2. 휴양날짜 접수 → 대기 → 예약확정 / 마감 안내전송

※ 문자(카톡)는 근무시간내 수신자 번호로 전송

⚠️ 체크인 2일전~ 당일 예약은 유선 카톡 상담후 출발!

안내사항:
• 본 숙박권은 대기예약 상품으로 구매즉시 확정 되지않습니다.
• 구매완료 및 주문번호는 결제번호를 의미합니다 (예약확정X)
• 결제후에도 휴양날짜 마감시 전액환불/날짜변경 안내드립니다.
• 예약 미확정 관련 문제는 책임질수 없음을 안내드립니다.
• 1박 숙박권이며 연박 / 객실 추가시 수량에 맞춰 구매
• ex) 1박 2실 : 2매 / 2박 1실 : 2매
• 요일별 추가요금이 있으므로 하단 요금표를 확인 부탁드립니다.

참고사항:
• 해피콜/문자수신 불가 번호는 예약 및 주문취소 됩니다.
• 예약확정 후 문자 미수신 사유로 취소시 위약금 적용됩니다.
• 취소/변경 위약규정은 아래 하단 참고 부탁드립니다.
• 부분환불 불가
• 옵션수량은 대기가능 수량을 의미
• 현장 상황에 따라 부대시설 휴장 및 운영시간이 변동 될 수 있음
• 상세페이지와 상품명이 다른 경우 상품명 우선적용
• 추가요금 발생시 추가금 안내후 예약확정
• 빠른 확정 문의는 카톡상담 부탁드립니다.`
});

export default function BookingConfirmation({ value = {}, onChange }) {
  const [bookingData, setBookingData] = useState(() => ({
    ...getDefaultData(),
    ...value
  }));

  useEffect(() => {
    const merged = {
      ...getDefaultData(),
      ...value
    };
    setBookingData(merged);
  }, [value]);

  const updateData = (field, newValue) => {
    const updated = { ...bookingData, [field]: newValue };
    setBookingData(updated);
    onChange?.(updated);
  };

  return (
    <div className="space-y-6 min-h-[70vh]">
      <Card>
        <CardHeader className="bg-blue-100">
          <h3 className="text-lg font-semibold text-gray-800">📞 예약안내</h3>
        </CardHeader>
        <CardBody className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">예약안내 전체 내용</label>
            <Textarea
              value={bookingData.bookingText}
              onChange={(e) => updateData('bookingText', e.target.value)}
              placeholder="예약안내 전체 내용을 입력하세요. 엔터키로 줄간격을 나눕니다. • 또는 숫자로 목록을 만들 수 있습니다..."
              minRows={40}
              className="font-mono text-sm text-contrast-fix"
              classNames={{
                input: "text-gray-800 bg-white border-gray-300 font-mono text-sm",
                label: "text-gray-700 font-medium"
              }}
              style={{ height: 'auto', overflow: 'visible' }}
            />
            <p className="text-xs text-gray-500 mt-1">
              엔터키를 눌러서 각 항목을 구분하세요. • 또는 숫자로 목록을 만들 수 있습니다.
            </p>
          </div>
        </CardBody>
      </Card>
    </div>
  );
} 