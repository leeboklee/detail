'use client'

import React, { memo } from 'react'

const Spinner = memo(({ size = 'medium', color = 'blue' }) => {
  console.log('Spinner component called but disabled');
  return null; // 스피너 완전 비활성화
})

Spinner.displayName = 'Spinner'

export default Spinner 