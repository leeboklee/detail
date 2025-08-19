'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button, Card, CardBody, CardHeader, Chip, Divider, Spinner, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from "@heroui/react";

export const MonitoringDashboard = () => {
  const [isMonitoringConnected, setIsMonitoringConnected] = useState(false);
  const [monitoringErrors, setMonitoringErrors] = useState([]);
  const [systemStats, setSystemStats] = useState({
    memory: 0,
    cpu: 0,
    network: 'stable',
    uptime: 0
  });
  
  const monitoringWSRef = useRef(null);
  const { isOpen: isDashboardOpen, onOpen: onDashboardOpen, onClose: onDashboardClose } = useDisclosure();

  // 모니터링 연결 함수
  const connectMonitoring = useCallback(() => {
    try {
      // WebSocket 연결 시도
      const ws = new WebSocket('ws://localhost:3901');
      monitoringWSRef.current = ws;
      
      ws.onopen = () => {
        console.log('✅ 모니터링 연결 성공!');
        setIsMonitoringConnected(true);
        
        // 오류 수집 시작
        const originalError = console.error;
        const originalWarn = console.warn;
        
        console.error = function(...args) {
          const message = args.join(' ');
          
          // Hydration 오류 감지
          if (message.includes('Text content does not match server-rendered HTML') ||
              message.includes('Hydration failed') ||
              message.includes('Hydration mismatch')) {
            setMonitoringErrors(prev => [...prev, {
              type: 'hydration',
              message: 'Hydration 오류가 발생했습니다.',
              timestamp: new Date().toISOString(),
              severity: 'high'
            }]);
          }
          
          // 일반 오류 수집
          setMonitoringErrors(prev => [...prev, {
            type: 'error',
            message: message,
            timestamp: new Date().toISOString(),
            severity: 'high'
          }]);
          
          // 원본 함수 호출
          originalError.apply(console, args);
        };
        
        console.warn = function(...args) {
          const message = args.join(' ');
          
          setMonitoringErrors(prev => [...prev, {
            type: 'warning',
            message: message,
            timestamp: new Date().toISOString(),
            severity: 'medium'
          }]);
          
          // 원본 함수 호출
          originalWarn.apply(console, args);
        };
        
        // 연결 상태 전송
        ws.send(JSON.stringify({
          type: 'connection_status',
          status: 'connected',
          timestamp: new Date().toISOString()
        }));
      };
      
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'system_stats') {
            setSystemStats(data.stats);
          } else if (data.type === 'error_alert') {
            setMonitoringErrors(prev => [...prev, {
              type: 'system',
              message: data.message,
              timestamp: new Date().toISOString(),
              severity: data.severity || 'medium'
            }]);
          }
        } catch (error) {
          console.error('모니터링 메시지 파싱 실패:', error);
        }
      };
      
      ws.onerror = (error) => {
        console.error('모니터링 연결 오류:', error);
        setIsMonitoringConnected(false);
      };
      
      ws.onclose = () => {
        console.log('모니터링 연결 종료');
        setIsMonitoringConnected(false);
      };
      
    } catch (error) {
      console.error('모니터링 연결 실패:', error);
      setIsMonitoringConnected(false);
    }
  }, []);

  // 모니터링 연결 해제 함수
  const disconnectMonitoring = useCallback(() => {
    if (monitoringWSRef.current) {
      monitoringWSRef.current.close();
      monitoringWSRef.current = null;
    }
    setIsMonitoringConnected(false);
  }, []);

  // 오류 제거 함수
  const clearError = useCallback((index) => {
    setMonitoringErrors(prev => prev.filter((_, i) => i !== index));
  }, []);

  // 모든 오류 제거 함수
  const clearAllErrors = useCallback(() => {
    setMonitoringErrors([]);
  }, []);

  // 시스템 통계 업데이트
  useEffect(() => {
    const updateStats = () => {
      if ('memory' in performance) {
        const memory = performance.memory;
        setSystemStats(prev => ({
          ...prev,
          memory: Math.round((memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100),
          uptime: Math.floor(performance.now() / 1000)
        }));
      }
    };

    const interval = setInterval(updateStats, 5000);
    return () => clearInterval(interval);
  }, []);

  // 컴포넌트 언마운트 시 연결 해제
  useEffect(() => {
    return () => {
      disconnectMonitoring();
    };
  }, [disconnectMonitoring]);

  // 오류 심각도에 따른 색상
  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'danger';
      case 'medium': return 'warning';
      case 'low': return 'primary';
      default: return 'default';
    }
  };

  // 오류 타입에 따른 아이콘
  const getErrorIcon = (type) => {
    switch (type) {
      case 'hydration': return '💧';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'system': return '🖥️';
      default: return 'ℹ️';
    }
  };

  return (
    <>
      {/* 모니터링 토글 버튼 */}
      <Button
        size="sm"
        variant="flat"
        color={isMonitoringConnected ? 'success' : 'secondary'}
        onPress={onDashboardOpen}
        startContent={isMonitoringConnected ? '🟢' : '🔴'}
      >
        모니터링
      </Button>

      {/* 모니터링 대시보드 모달 */}
      <Modal isOpen={isDashboardOpen} onClose={onDashboardClose} size="4xl">
        <ModalContent>
          <ModalHeader className="flex justify-between items-center">
            <span>시스템 모니터링 대시보드</span>
            <div className="flex gap-2">
              {!isMonitoringConnected ? (
                <Button
                  size="sm"
                  color="success"
                  variant="flat"
                  onPress={connectMonitoring}
                >
                  연결
                </Button>
              ) : (
                <Button
                  size="sm"
                  color="danger"
                  variant="flat"
                  onPress={disconnectMonitoring}
                >
                  연결 해제
                </Button>
              )}
              <Button
                size="sm"
                color="secondary"
                variant="flat"
                onPress={clearAllErrors}
              >
                오류 초기화
              </Button>
            </div>
          </ModalHeader>
          
          <ModalBody>
            <div className="space-y-6">
              {/* 연결 상태 */}
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold">연결 상태</h3>
                </CardHeader>
                <CardBody>
                  <div className="flex items-center gap-4">
                    <Chip
                      color={isMonitoringConnected ? 'success' : 'danger'}
                      variant="flat"
                      size="lg"
                    >
                      {isMonitoringConnected ? '🟢 연결됨' : '🔴 연결 안됨'}
                    </Chip>
                    
                    {isMonitoringConnected && (
                      <div className="text-sm text-gray-600">
                        연결 시간: {systemStats.uptime}초
                      </div>
                    )}
                  </div>
                </CardBody>
              </Card>

              {/* 시스템 통계 */}
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold">시스템 통계</h3>
                </CardHeader>
                <CardBody>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {systemStats.memory}%
                      </div>
                      <div className="text-sm text-gray-600">메모리 사용량</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {systemStats.cpu}%
                      </div>
                      <div className="text-sm text-gray-600">CPU 사용량</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {systemStats.network}
                      </div>
                      <div className="text-sm text-gray-600">네트워크 상태</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        {Math.floor(systemStats.uptime / 60)}분
                      </div>
                      <div className="text-sm text-gray-600">가동 시간</div>
                    </div>
                  </div>
                </CardBody>
              </Card>

              {/* 오류 모니터링 */}
              <Card>
                <CardHeader className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">오류 모니터링</h3>
                  <Chip color="primary" variant="flat">
                    {monitoringErrors.length}개
                  </Chip>
                </CardHeader>
                <CardBody>
                  {monitoringErrors.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      🎉 오류가 없습니다!
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {monitoringErrors.map((error, index) => (
                        <div
                          key={index}
                          className="flex items-start justify-between p-3 border rounded-lg bg-gray-50"
                        >
                          <div className="flex items-start gap-3 flex-1">
                            <span className="text-lg">{getErrorIcon(error.type)}</span>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <Chip
                                  size="sm"
                                  color={getSeverityColor(error.severity)}
                                  variant="flat"
                                >
                                  {error.severity}
                                </Chip>
                                <span className="text-xs text-gray-500">
                                  {new Date(error.timestamp).toLocaleTimeString()}
                                </span>
                              </div>
                              <div className="text-sm text-gray-700">
                                {error.message}
                              </div>
                            </div>
                          </div>
                          
                          <Button
                            size="sm"
                            color="danger"
                            variant="light"
                            onPress={() => clearError(index)}
                          >
                            삭제
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardBody>
              </Card>

              {/* 실시간 로그 */}
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold">실시간 로그</h3>
                </CardHeader>
                <CardBody>
                  <div className="bg-black text-green-400 p-4 rounded-lg font-mono text-sm h-64 overflow-y-auto">
                    {isMonitoringConnected ? (
                      <div>
                        <div>[{new Date().toLocaleTimeString()}] 모니터링 시스템 시작</div>
                        <div>[{new Date().toLocaleTimeString()}] WebSocket 연결 성공</div>
                        <div>[{new Date().toLocaleTimeString()}] 오류 수집 활성화</div>
                        <div className="text-yellow-400">실시간 모니터링 중...</div>
                      </div>
                    ) : (
                      <div className="text-red-400">
                        모니터링이 연결되지 않았습니다.
                      </div>
                    )}
                  </div>
                </CardBody>
              </Card>
            </div>
          </ModalBody>
          
          <ModalFooter>
            <Button variant="light" onPress={onDashboardClose}>
              닫기
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default MonitoringDashboard;
