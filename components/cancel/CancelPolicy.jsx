'use client';

import React from 'react';
import styles from './CancelPolicy.module.css';
import { useAppContext } from '@/context/AppContext';

export default function CancelPolicy({ cancelInfo: initialCancelInfo, setCancelInfo: onUpdate }) {
  const { hotelData, updateCancel } = useAppContext();
  const cancelInfo = initialCancelInfo || hotelData.cancel || {};

  const handleUpdate = (field, value) => {
    const updatedInfo = { ...cancelInfo, [field]: value };
    if (onUpdate) onUpdate(updatedInfo);
    if (updateCancel) updateCancel(updatedInfo);
  };

  const handleRuleChange = (season, index, prop, value) => {
    const rules = [...(cancelInfo[season] || [])];
    rules[index] = { ...rules[index], [prop]: value };
    handleUpdate(season, rules);
  };

  const addRule = (season) => {
    const rules = [...(cancelInfo[season] || []), { days: '', rate: '' }];
    handleUpdate(season, rules);
  };

  const removeRule = (season, index) => {
    const rules = (cancelInfo[season] || []).filter((_, i) => i !== index);
    handleUpdate(season, rules);
  };

  const renderRulesFor = (season, title) => (
    <div className={styles.seasonSection}>
      <h3 className="text-xl font-semibold mb-3">{title}</h3>
      {(cancelInfo[season] || []).map((rule, index) => (
        <div key={index} className="grid grid-cols-12 gap-2 mb-2 items-center">
          <div className="col-span-5">
            <input
              type="text"
              className={styles.input}
              placeholder="취소 시점 (예: 10일 전)"
              value={rule.days}
              onChange={(e) => handleRuleChange(season, index, 'days', e.target.value)}
            />
          </div>
          <div className="col-span-5">
            <input
              type="text"
              className={styles.input}
              placeholder="환불 규정 (예: 20% 위약금)"
              value={rule.rate}
              onChange={(e) => handleRuleChange(season, index, 'rate', e.target.value)}
            />
          </div>
          <div className="col-span-2">
            <button onClick={() => removeRule(season, index)} className={styles.removeButton}>삭제</button>
          </div>
        </div>
      ))}
      <button onClick={() => addRule(season)} className={styles.addButton}>+ 규정 추가</button>
    </div>
  );

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">취소 및 환불 규정 관리</h2>
      
      <div className="mb-6">
        <label className="block text-lg font-medium mb-2">규정 설명</label>
        <textarea
          className={styles.textarea}
          placeholder="예약 취소 및 환불 규정에 대한 전반적인 설명을 입력하세요."
          value={cancelInfo.description || ''}
          onChange={(e) => handleUpdate('description', e.target.value)}
          rows="3"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {renderRulesFor('offSeason', '비수기 규정')}
        {renderRulesFor('midSeason', '준성수기 규정')}
        {renderRulesFor('highSeason', '성수기 규정')}
      </div>

      <div className="mt-6">
        <label className="block text-lg font-medium mb-2">추가 참고사항</label>
        <textarea
          className={styles.textarea}
          placeholder="기타 참고사항이나 특별 정책을 입력하세요."
          value={cancelInfo.notes || ''}
          onChange={(e) => handleUpdate('notes', e.target.value)}
          rows="3"
        />
      </div>
    </div>
  );
} 