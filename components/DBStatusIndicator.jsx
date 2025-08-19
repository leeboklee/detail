'use client'

import React, { useState, useEffect } from 'react'
import { Chip, Spinner } from "@heroui/react"

const DBStatusIndicator = () => {
  const [dbStatus, setDbStatus] = useState({
    type: 'PostgreSQL',
    connected: false,
    loading: true,
    error: null
  })

  useEffect(() => {
    checkDBStatus()
  }, [])

  const checkDBStatus = async () => {
    try {
      const response = await fetch('/api/health')
      const data = await response.json()
      
      if (data.status === 'ok') {
        setDbStatus({
          type: 'PostgreSQL',
          connected: true,
          loading: false,
          error: null
        })
      } else {
        setDbStatus({
          type: 'PostgreSQL',
          connected: false,
          loading: false,
          error: '서버 연결 실패'
        })
      }
    } catch (error) {
              setDbStatus({
          type: 'PostgreSQL',
          connected: false,
          loading: false,
          error: '연결 오류'
        })
    }
  }

  const getStatusColor = () => {
    if (dbStatus.loading) return 'default'
    if (dbStatus.connected) return 'success'
    return 'danger'
  }

  const getStatusText = () => {
    if (dbStatus.loading) return '연결 중...'
    if (dbStatus.connected) return 'PostgreSQL 연결됨'
    return '연결 실패'
  }

  const getStatusIcon = () => {
    if (dbStatus.loading) return <Spinner size="sm" />
    if (dbStatus.connected) return '🗄️'
    return '❌'
  }

  return (
    <div className="flex items-center gap-2">
      <Chip
        size="sm"
        color={getStatusColor()}
        variant="flat"
        startContent={getStatusIcon()}
        className="text-xs"
      >
        {getStatusText()}
      </Chip>
      {dbStatus.error && (
        <Chip
          size="sm"
          color="danger"
          variant="flat"
          className="text-xs"
        >
          {dbStatus.error}
        </Chip>
      )}
    </div>
  )
}

export default DBStatusIndicator 