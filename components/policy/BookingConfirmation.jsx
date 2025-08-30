'use client';

import React, { useState, useEffect } from 'react';
import { Input, Textarea, Button, Chip } from "@heroui/react";

const BookingConfirmation = ({ value = {}, onChange }) => {
  const [bookingData, setBookingData] = useState({
    reservationMethod: value.reservationMethod || '',
    paymentMethods: value.paymentMethods || [],
    confirmationTime: value.confirmationTime || '',
    specialRequests: value.specialRequests || '',
    contactInfo: value.contactInfo || '',
    operatingHours: value.operatingHours || '',
    cancellationPolicy: value.cancellationPolicy || ''
  });

  const [newPaymentMethod, setNewPaymentMethod] = useState('');

  useEffect(() => {
    if (onChange) {
      onChange(bookingData);
    }
  }, [bookingData, onChange]);

  const handleInputChange = (field, value) => {
    setBookingData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addPaymentMethod = () => {
    if (newPaymentMethod.trim() && !bookingData.paymentMethods.includes(newPaymentMethod.trim())) {
      setBookingData(prev => ({
        ...prev,
        paymentMethods: [...prev.paymentMethods, newPaymentMethod.trim()]
      }));
      setNewPaymentMethod('');
    }
  };

  const removePaymentMethod = (method) => {
    setBookingData(prev => ({
      ...prev,
      paymentMethods: prev.paymentMethods.filter(m => m !== method)
    }));
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm border">
      <h2 className="text-xl font-semibold mb-6 text-gray-900">예약 안내</h2>
      
      <div className="space-y-6">
        {/* 예약 방법 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            📞 예약 방법
          </label>
          <Input
            placeholder="예: 전화, 온라인, 모바일 앱 등"
            value={bookingData.reservationMethod}
            onChange={(e) => handleInputChange('reservationMethod', e.target.value)}
            className="w-full"
          />
        </div>

        {/* 결제 방법 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            💳 결제 방법
          </label>
          <div className="flex gap-2 mb-2">
            <Input
              placeholder="결제 방법 추가"
              value={newPaymentMethod}
              onChange={(e) => setNewPaymentMethod(e.target.value)}
              className="flex-1"
            />
            <Button
              size="sm"
              color="primary"
              variant="flat"
              onPress={addPaymentMethod}
            >
              추가
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {bookingData.paymentMethods.map((method, index) => (
              <Chip
                key={index}
                variant="flat"
                color="primary"
                onClose={() => removePaymentMethod(method)}
              >
                {method}
              </Chip>
            ))}
          </div>
        </div>

        {/* 확인 시간 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            ⏰ 예약 확인 시간
          </label>
          <Input
            placeholder="예: 24시간 이내, 당일 오후 6시까지 등"
            value={bookingData.confirmationTime}
            onChange={(e) => handleInputChange('confirmationTime', e.target.value)}
            className="w-full"
          />
        </div>

        {/* 특별 요청사항 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            📝 특별 요청사항
          </label>
          <Textarea
            placeholder="예약 시 특별 요청사항이나 주의사항을 입력하세요"
            value={bookingData.specialRequests}
            onChange={(e) => handleInputChange('specialRequests', e.target.value)}
            className="w-full"
            minRows={3}
          />
        </div>

        {/* 연락처 정보 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            📱 연락처 정보
          </label>
          <Input
            placeholder="예: 1588-0000, 예약팀 이메일 등"
            value={bookingData.contactInfo}
            onChange={(e) => handleInputChange('contactInfo', e.target.value)}
            className="w-full"
          />
        </div>

        {/* 운영 시간 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            🕐 운영 시간
          </label>
          <Input
            placeholder="예: 평일 09:00-18:00, 주말 10:00-17:00"
            value={bookingData.operatingHours}
            onChange={(e) => handleInputChange('operatingHours', e.target.value)}
            className="w-full"
          />
        </div>

        {/* 취소 정책 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            🛡️ 취소 정책
          </label>
          <Textarea
            placeholder="예약 취소 및 변경에 대한 정책을 입력하세요"
            value={bookingData.cancellationPolicy}
            onChange={(e) => handleInputChange('cancellationPolicy', e.target.value)}
            className="w-full"
            minRows={2}
          />
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmation; 