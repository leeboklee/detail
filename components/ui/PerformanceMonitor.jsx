'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardBody, CardHeader, Button, Progress, Chip } from "@heroui/react";
import { usePerformance, useMemoryMonitor, useNetworkStatus } from '@/hooks/usePerformance';

export const PerformanceMonitor = ({ componentName = 'Component' }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  
  const performanceMetrics = usePerformance(componentName);
  const memoryInfo = useMemoryMonitor();
  const networkStatus = useNetworkStatus();

  const [fps, setFps] = useState(0);
  const [frameCount, setFrameCount] = useState(0);
  const [lastTime, setLastTime] = useState(performance.now());

  // FPS 계산
  useEffect(() => {
    const calculateFPS = () => {
      const now = performance.now();
      setFrameCount(prev => prev + 1);
      
      if (now - lastTime >= 1000) { // 1초마다 FPS 계산
        setFps(frameCount);
        setFrameCount(0);
        setLastTime(now);
      }
      
      requestAnimationFrame(calculateFPS);
    };

    const animationId = requestAnimationFrame(calculateFPS);
    return () => cancelAnimationFrame(animationId);
  }, [frameCount, lastTime]);

  // 성능 상태 평가
  const getPerformanceStatus = () => {
    if (performanceMetrics.lastRenderTime < 16.67) return 'excellent';
    if (performanceMetrics.lastRenderTime < 33.33) return 'good';
    if (performanceMetrics.lastRenderTime < 50) return 'fair';
    return 'poor';
  };

  const getFPSStatus = () => {
    if (fps >= 55) return 'excellent';
    if (fps >= 45) return 'good';
    if (fps >= 30) return 'fair';
    return 'poor';
  };

  const getMemoryStatus = () => {
    if (!memoryInfo) return 'unknown';
    const usage = parseFloat(memoryInfo.usagePercent);
    if (usage < 50) return 'excellent';
    if (usage < 75) return 'good';
    if (usage < 90) return 'fair';
    return 'poor';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'excellent': return 'success';
      case 'good': return 'primary';
      case 'fair': return 'warning';
      case 'poor': return 'danger';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'excellent': return '🟢';
      case 'good': return '🟡';
      case 'fair': return '🟠';
      case 'poor': return '🔴';
      default: return '⚪';
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold">📊 성능 모니터</h4>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="flat"
              onPress={() => setShowDetails(!showDetails)}
            >
              {showDetails ? '간단' : '상세'}
            </Button>
            <Button
              size="sm"
              variant="flat"
              onPress={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? '접기' : '펼치기'}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardBody className="pt-0">
        {/* 기본 성능 지표 */}
        <div className="space-y-3">
          {/* 렌더링 성능 */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600">렌더링</span>
            <div className="flex items-center gap-2">
              <Chip
                size="sm"
                color={getStatusColor(getPerformanceStatus())}
                variant="flat"
              >
                {getStatusIcon(getPerformanceStatus())} {performanceMetrics.lastRenderTime.toFixed(1)}ms
              </Chip>
            </div>
          </div>

          {/* FPS */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600">FPS</span>
            <div className="flex items-center gap-2">
              <Chip
                size="sm"
                color={getStatusColor(getFPSStatus())}
                variant="flat"
              >
                {getStatusIcon(getFPSStatus())} {fps}
              </Chip>
            </div>
          </div>

          {/* 메모리 사용량 */}
          {memoryInfo && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">메모리</span>
                <Chip
                  size="sm"
                  color={getStatusColor(getMemoryStatus())}
                  variant="flat"
                >
                  {getStatusIcon(getMemoryStatus())} {memoryInfo.usagePercent}%
                </Chip>
              </div>
              <Progress
                value={parseFloat(memoryInfo.usagePercent)}
                color={getStatusColor(getMemoryStatus())}
                size="sm"
                className="w-full"
              />
              <div className="text-xs text-gray-500 text-center">
                {memoryInfo.usedJSHeapSize}MB / {memoryInfo.jsHeapSizeLimit}MB
              </div>
            </div>
          )}

          {/* 네트워크 상태 */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600">네트워크</span>
            <Chip
              size="sm"
              color={networkStatus.isOnline ? 'success' : 'danger'}
              variant="flat"
            >
              {networkStatus.isOnline ? '🟢 온라인' : '🔴 오프라인'}
            </Chip>
          </div>
        </div>

        {/* 상세 정보 */}
        {showDetails && (
          <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
            <div className="text-xs text-gray-600">
              <div>총 렌더링: {performanceMetrics.renderCount}회</div>
              <div>평균 렌더링: {performanceMetrics.averageRenderTime.toFixed(1)}ms</div>
            </div>
            
            {networkStatus.connection && (
              <div className="text-xs text-gray-600">
                <div>연결 타입: {networkStatus.connection.effectiveType || '알 수 없음'}</div>
                <div>다운로드: {networkStatus.connection.downlink || '알 수 없음'} Mbps</div>
                <div>RTT: {networkStatus.connection.rtt || '알 수 없음'} ms</div>
              </div>
            )}
          </div>
        )}

        {/* 확장된 정보 */}
        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
            {/* 성능 히스토리 차트 (간단한 텍스트 기반) */}
            <div className="text-xs text-gray-600">
              <div className="font-medium mb-2">성능 히스토리:</div>
              <div className="space-y-1">
                {Array.from({ length: 5 }, (_, i) => {
                  const time = performanceMetrics.lastRenderTime - (i * 2);
                  const status = time < 16.67 ? '🟢' : time < 33.33 ? '🟡' : '🔴';
                  return (
                    <div key={i} className="flex items-center gap-2">
                      <span>{status}</span>
                      <span>{Math.max(0, time).toFixed(1)}ms</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 성능 권장사항 */}
            <div className="text-xs text-gray-600">
              <div className="font-medium mb-2">권장사항:</div>
              <ul className="space-y-1 text-gray-500">
                {performanceMetrics.lastRenderTime > 16.67 && (
                  <li>• 렌더링 최적화가 필요합니다</li>
                )}
                {fps < 45 && (
                  <li>• FPS 개선이 필요합니다</li>
                )}
                {memoryInfo && parseFloat(memoryInfo.usagePercent) > 75 && (
                  <li>• 메모리 사용량이 높습니다</li>
                )}
                {performanceMetrics.lastRenderTime <= 16.67 && fps >= 55 && (!memoryInfo || parseFloat(memoryInfo.usagePercent) <= 75) && (
                  <li>• 성능이 양호합니다</li>
                )}
              </ul>
            </div>
          </div>
        )}

        {/* 실시간 업데이트 토글 */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="text-xs text-gray-500 text-center">
            실시간 모니터링 중...
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

// 간단한 성능 표시기
export const PerformanceIndicator = ({ componentName }) => {
  const performanceMetrics = usePerformance(componentName);
  
  const getStatusColor = () => {
    if (performanceMetrics.lastRenderTime < 16.67) return 'success';
    if (performanceMetrics.lastRenderTime < 33.33) return 'primary';
    if (performanceMetrics.lastRenderTime < 50) return 'warning';
    return 'danger';
  };

  return (
    <Chip
      size="sm"
      color={getStatusColor()}
      variant="flat"
      className="cursor-pointer"
    >
      {performanceMetrics.lastRenderTime.toFixed(1)}ms
    </Chip>
  );
};

export default PerformanceMonitor;
