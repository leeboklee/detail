'use client';

import React from 'react';

import Labels from '@/src/shared/labels';
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
                  placeholder={Labels["취소환불_규정_내용_PH"]}
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
          placeholder={Labels["새_규정_입력_엔터로_추가_PH"]}
        />
        <button className={s.addButton || ''} onClick={handleAddPolicy}>추가</button>
      </div>
    </div>
  );
} 