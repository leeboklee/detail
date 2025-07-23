'use client';

import React from 'react';

/**
 * 추가 요금 정보 관리 컴포넌트
 * @param {object} props
 * @param {object} props.value - 추가 요금 데이터 (charges 객체)
 * @param {Function} props.onChange - 데이터 변경 시 호출될 함수
 */
export default function ChargesInfo({ value: charges = {}, onChange: onChargesChange }) {
  
  const handleChargeChange = (field, fieldValue) => {
    if (typeof onChargesChange === 'function') {
      onChargesChange(prevCharges => ({
        ...prevCharges,
        [field]: fieldValue,
      }));
    }
  };

  const handleAddItem = () => {
    if (typeof onChargesChange === 'function') {
      onChargesChange(prevCharges => {
        const items = Array.isArray(prevCharges.items) ? [...prevCharges.items] : [];
        items.push({ name: '', price: '', description: '' });
        return { ...prevCharges, items };
      });
    }
  };
  
  const handleRemoveItem = (index) => {
    if (typeof onChargesChange === 'function') {
      onChargesChange(prevCharges => {
        if (!Array.isArray(prevCharges.items)) return prevCharges;
        const items = prevCharges.items.filter((_, i) => i !== index);
        return { ...prevCharges, items };
      });
    }
  };
  
  const handleItemChange = (index, field, fieldValue) => {
    if (typeof onChargesChange === 'function') {
      onChargesChange(prevCharges => {
        if (!Array.isArray(prevCharges.items)) return prevCharges;
        const items = prevCharges.items.map((item, i) => {
          if (i === index) {
            return { ...item, [field]: fieldValue };
          }
          return item;
        });
        return { ...prevCharges, items };
      });
    }
  };
  
  const items = Array.isArray(charges?.items) ? charges.items : [];

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800">추가 요금 정보</h2>
      </div>

      <p className="text-gray-600 mb-6">현장에서 별도로 결제해야 하는 요금 항목을 입력하세요.</p>
      
      <div className="space-y-6">
        {/* 주말 및 성수기 요금 */}
        <div className="p-4 border rounded-md">
          <h3 className="text-lg font-semibold mb-2">기본 할증 정보</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="주말 할증 (예: 20%)"
              value={charges.weekendSurcharge || ''}
              onChange={(e) => handleChargeChange('weekendSurcharge', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
            <input
              type="text"
              placeholder="성수기/공휴일 할증 (예: 30%)"
              value={charges.holidaySurcharge || ''}
              onChange={(e) => handleChargeChange('holidaySurcharge', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>

        {/* 계절별 요금 정보 */}
        <div className="p-4 border rounded-md">
          <h3 className="text-lg font-semibold mb-2">계절별 특별 요금</h3>
          <textarea
            placeholder="계절별 요금 정보를 입력하세요. (예: 여름 성수기 (7/15-8/15): 50% 할증)"
            value={charges.seasonalRates || ''}
            onChange={(e) => handleChargeChange('seasonalRates', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            rows="4"
          />
        </div>

        {/* 기타 추가 요금 항목 */}
        <div className="p-4 border rounded-md">
           <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold">기타 추가 요금</h3>
              <button
                onClick={handleAddItem}
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
              >
                + 항목 추가
              </button>
            </div>
            <div className="space-y-4 mt-4">
              {items.map((item, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center bg-gray-50 p-4 rounded-lg">
                  <input
                    type="text"
                    placeholder="항목명 (예: 인원 추가)"
                    value={item.name || ''}
                    onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                    className="md:col-span-1 w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                  <input
                    type="text"
                    placeholder="가격 (예: 20000)"
                    value={item.price || ''}
                    onChange={(e) => handleItemChange(index, 'price', e.target.value)}
                    className="md:col-span-1 w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                  <input
                    type="text"
                    placeholder="설명 (예: 1인 기준)"
                    value={item.description || ''}
                    onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                    className="md:col-span-1 w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                  <button 
                    onClick={() => handleRemoveItem(index)}
                    className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg md:col-span-1"
                  >
                    삭제
                  </button>
                </div>
              ))}
            </div>

            {items.length === 0 && (
              <div className="text-center py-10 mt-4 border-2 border-dashed border-gray-300 rounded-lg">
                <p className="text-gray-500">추가된 요금 정보가 없습니다.</p>
              </div>
            )}
        </div>
      </div>
    </div>
  );
};