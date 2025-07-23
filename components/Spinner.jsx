'use client'

import React from 'react'

const Spinner = ({ size = 'medium', color = 'blue' }) => {
  const sizeClass = size === 'small' ? 'w-4 h-4' : size === 'large' ? 'w-8 h-8' : 'w-6 h-6'
  const colorClass = color === 'white' ? 'text-white' : color === 'gray' ? 'text-gray-500' : 'text-blue-500'

  return (
    <div className="flex items-center justify-center">
      <div className={`animate-spin rounded-full border-t-2 border-b-2 ${colorClass} ${sizeClass}`}></div>
    </div>
  )
}

export default Spinner 