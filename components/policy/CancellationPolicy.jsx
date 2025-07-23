'use client';

import React from 'react';
import styles from './CancellationPolicy.module.css';
import useCancellationPolicyManager from '@/hooks/useCancellationPolicyManager';

export default function CancellationPolicy({ data = [], onChange }) {
  const {
    policies,
    handleAddPolicy,
    handleRemovePolicy,
    handleUpdatePolicy,
    handleKeyPress
  } = useCancellationPolicyManager(data, onChange);

  const s = styles || {};

  return (
    <div className={s.policyEditor || ''}>
      <h3 className={s.title || ''}>취소/환불 규정</h3>
      {policies.length === 0 ? (
        <div className={s.emptyState || ''}>등록된 취소/환불 규정이 없습니다</div>
      ) : (
        <div className={s.policiesContainer || ''}>
          {policies.map((policy, index) => (
            policy && typeof policy === 'object' ? (
              <div key={index} className={s.policyItem || ''}>
                <textarea
                  className={s.policyInput || ''}
                  value={policy.content || ''}
                  onChange={e => handleUpdatePolicy(index, e.target.value)}
                  placeholder="취소/환불 규정 내용"
                />
                <button className={s.removeButton || ''} onClick={() => handleRemovePolicy(index)}>삭제</button>
              </div>
            ) : null
          ))}
        </div>
      )}
      <div className={s.addPolicyContainer || ''}>
        <input
          className={s.addPolicyInput || ''}
          type="text"
          value={''}
          onChange={() => {}}
          onKeyDown={handleKeyPress}
          placeholder="새 규정 입력 (엔터로 추가)"
        />
        <button className={s.addButton || ''} onClick={handleAddPolicy}>추가</button>
      </div>
    </div>
  );
} 