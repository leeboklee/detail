'use client';

import React, { useEffect } from 'react';
import { HeroUIProvider } from '@heroui/react';

export function Providers({ children }) {
  // window.alert override -> UIUtils.showAlert
  useEffect(() => {
    if (typeof window !== 'undefined' && window.UIUtils) {
      window.alert = (msg) => {
        try {
          window.UIUtils.showAlert(msg, 'info');
        } catch (e) {
          console.log('[alert override]', msg);
        }
      };
      // confirm 대체: 단순 알림 후 항상 true 반환
      window.confirm = (msg) => {
        try {
          window.UIUtils.showAlert(msg, 'warning');
        } catch (e) {
          console.log('[confirm override]', msg);
        }
        return true; // 기본적으로 사용자 확인으로 처리
      };
    }
  }, []);

  return (
    <>
      {children}
    </>
  );
} 