'use client'

import React from 'react';

const Spinner = React.memo(() => {
  console.log('Spinner component called but disabled');
  return null; // 스피너 비활성화로 로딩 속도 향상
});

Spinner.displayName = 'Spinner';

export default Spinner; 