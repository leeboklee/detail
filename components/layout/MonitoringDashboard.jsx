'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button, Card, CardBody, CardHeader, Chip, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, Progress } from "@heroui/react";

export const MonitoringDashboard = () => {
  const [isMonitoringConnected, setIsMonitoringConnected] = useState(false);
  const [monitoringErrors, setMonitoringErrors] = useState([]);
  const [systemStats, setSystemStats] = useState({
    memory: 0,
    cpu: 0,
    network: 'stable',
    uptime: 0,
    disk: 0,
    responseTime: 0
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
          uptime: Math.floor(performance.now() / 1000),
          responseTime: Math.round(performance.now() % 1000)
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

  // 성능 상태에 따른 색상
  const getPerformanceColor = (value, threshold = 80) => {
    if (value < threshold * 0.6) return 'success';
    if (value < threshold) return 'warning';
    return 'danger';
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
        className="font-medium"
      >
        모니터링
      </Button>

      {/* 모니터링 대시보드 모달 */}
      <Modal isOpen={isDashboardOpen} onClose={onDashboardClose} size="5xl">
        <ModalContent className="bg-white">
          <ModalHeader className="flex justify-between items-center bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <span className="text-xl font-bold">🚀 성능 모니터링 대시보드</span>
            <div className="flex gap-2">
              {!isMonitoringConnected ? (
                <Button
                  size="sm"
                  color="success"
                  variant="flat"
                  onPress={connectMonitoring}
                  className="bg-green-500 text-white border-green-500"
                >
                  🔌 연결
                </Button>
              ) : (
                <Button
                  size="sm"
                  color="danger"
                  variant="flat"
                  onPress={disconnectMonitoring}
                  className="bg-red-500 text-white border-red-500"
                >
                  🔌 연결 해제
                </Button>
              )}
              <Button
                size="sm"
                color="secondary"
                variant="flat"
                onPress={clearAllErrors}
                className="bg-gray-500 text-white border-gray-500"
              >
                🗑️ 오류 초기화
              </Button>
            </div>
          </ModalHeader>
          
          <ModalBody className="p-6 bg-gray-50">
            <div className="space-y-6">
              {/* 연결 상태 */}
              <Card className="border-2 border-blue-200 shadow-lg">
                <CardHeader className="bg-blue-50 border-b border-blue-200">
                  <h3 className="text-lg font-semibold text-blue-800 flex items-center gap-2">
                    🔗 연결 상태
                  </h3>
                </CardHeader>
                <CardBody className="bg-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Chip
                        color={isMonitoringConnected ? 'success' : 'danger'}
                        variant="flat"
                        size="lg"
                        className="text-white font-bold"
                      >
                        {isMonitoringConnected ? '🟢 연결됨' : '🔴 연결 안됨'}
                      </Chip>
                      
                      {isMonitoringConnected && (
                        <div className="text-sm text-gray-600 bg-gray-100 px-3 py-2 rounded-lg">
                          연결 시간: {Math.floor(systemStats.uptime / 60)}분 {systemStats.uptime % 60}초
                        </div>
                      )}
                    </div>
                    
                    <div className="text-right">
                      <div className="text-xs text-gray-500">마지막 업데이트</div>
                      <div className="text-sm font-medium text-gray-700">
                        {new Date().toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>

              {/* 시스템 통계 */}
              <Card className="border-2 border-green-200 shadow-lg">
                <CardHeader className="bg-green-50 border-b border-green-200">
                  <h3 className="text-lg font-semibold text-green-800 flex items-center gap-2">
                    📊 시스템 통계
                  </h3>
                </CardHeader>
                <CardBody className="bg-white">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    {/* 메모리 사용량 */}
                    <div className="text-center bg-blue-50 p-4 rounded-xl border border-blue-200">
                      <div className="text-3xl font-bold text-blue-600 mb-2">
                        {systemStats.memory}%
                      </div>
                      <Progress 
                        value={systemStats.memory} 
                        color={getPerformanceColor(systemStats.memory)}
                        className="mb-2"
                      />
                      <div className="text-sm text-blue-700 font-medium">메모리 사용량</div>
                      <div className="text-xs text-blue-600">
                        {systemStats.memory < 60 ? '양호' : systemStats.memory < 80 ? '주의' : '위험'}
                      </div>
                    </div>
                    
                    {/* CPU 사용량 */}
                    <div className="text-center bg-green-50 p-4 rounded-xl border border-green-200">
                      <div className="text-3xl font-bold text-green-600 mb-2">
                        {systemStats.cpu}%
                      </div>
                      <Progress 
                        value={systemStats.cpu} 
                        color={getPerformanceColor(systemStats.cpu)}
                        className="mb-2"
                      />
                      <div className="text-sm text-green-700 font-medium">CPU 사용량</div>
                      <div className="text-xs text-green-600">
                        {systemStats.cpu < 60 ? '양호' : systemStats.cpu < 80 ? '주의' : '위험'}
                      </div>
                    </div>
                    
                    {/* 네트워크 상태 */}
                    <div className="text-center bg-purple-50 p-4 rounded-xl border border-purple-200">
                      <div className="text-3xl font-bold text-purple-600 mb-2">
                        {systemStats.network}
                      </div>
                      <div className="w-16 h-16 mx-auto mb-2 bg-purple-200 rounded-full flex items-center justify-center">
                        <span className="text-2xl">🌐</span>
                      </div>
                      <div className="text-sm text-purple-700 font-medium">네트워크 상태</div>
                      <div className="text-xs text-purple-600">
                        {systemStats.network === 'stable' ? '안정' : '불안정'}
                      </div>
                    </div>
                    
                    {/* 가동 시간 */}
                    <div className="text-center bg-orange-50 p-4 rounded-xl border border-orange-200">
                      <div className="text-3xl font-bold text-orange-600 mb-2">
                        {Math.floor(systemStats.uptime / 60)}분
                      </div>
                      <div className="w-16 h-16 mx-auto mb-2 bg-orange-200 rounded-full flex items-center justify-center">
                        <span className="text-2xl">⏱️</span>
                      </div>
                      <div className="text-sm text-orange-700 font-medium">가동 시간</div>
                      <div className="text-xs text-orange-600">
                        {Math.floor(systemStats.uptime / 3600)}시간 {Math.floor((systemStats.uptime % 3600) / 60)}분
                      </div>
                    </div>
                    
                    {/* 응답 시간 */}
                    <div className="text-center bg-red-50 p-4 rounded-xl border border-red-200">
                      <div className="text-3xl font-bold text-red-600 mb-2">
                        {systemStats.responseTime}ms
                      </div>
                      <div className="w-16 h-16 mx-auto mb-2 bg-red-200 rounded-full flex items-center justify-center">
                        <span className="text-2xl">⚡</span>
                      </div>
                      <div className="text-sm text-red-700 font-medium">응답 시간</div>
                      <div className="text-xs text-red-600">
                        {systemStats.responseTime < 100 ? '빠름' : systemStats.responseTime < 500 ? '보통' : '느림'}
                      </div>
                    </div>
                    
                    {/* 성능 점수 */}
                    <div className="text-center bg-indigo-50 p-4 rounded-xl border border-indigo-200">
                      <div className="text-3xl font-bold text-indigo-600 mb-2">
                        {Math.round(100 - (systemStats.memory + systemStats.cpu) / 2)}점
                      </div>
                      <div className="w-16 h-16 mx-auto mb-2 bg-indigo-200 rounded-full flex items-center justify-center">
                        <span className="text-2xl">🏆</span>
                      </div>
                      <div className="text-sm text-indigo-700 font-medium">성능 점수</div>
                      <div className="text-xs text-indigo-600">
                        {Math.round(100 - (systemStats.memory + systemStats.cpu) / 2) > 80 ? '우수' : 
                         Math.round(100 - (systemStats.memory + systemStats.cpu) / 2) > 60 ? '양호' : '개선 필요'}
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>

              {/* 오류 모니터링 */}
              <Card className="border-2 border-red-200 shadow-lg">
                <CardHeader className="bg-red-50 border-b border-red-200 flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-red-800 flex items-center gap-2">
                    🚨 오류 모니터링
                  </h3>
                  <Chip color="danger" variant="flat" className="text-white font-bold">
                    {monitoringErrors.length}개
                  </Chip>
                </CardHeader>
                <CardBody className="bg-white">
                  {monitoringErrors.length === 0 ? (
                    <div className="text-center py-12 text-gray-500 bg-green-50 rounded-xl border-2 border-green-200">
                      <div className="text-6xl mb-4">🎉</div>
                      <div className="text-xl font-bold text-green-700 mb-2">오류가 없습니다!</div>
                      <div className="text-sm text-green-600">시스템이 정상적으로 작동하고 있습니다.</div>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {monitoringErrors.map((error, index) => (
                        <div
                          key={index}
                          className="flex items-start justify-between p-4 border-2 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex items-start gap-3 flex-1">
                            <span className="text-2xl">{getErrorIcon(error.type)}</span>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Chip
                                  size="sm"
                                  color={getSeverityColor(error.severity)}
                                  variant="flat"
                                  className="text-white font-bold"
                                >
                                  {error.severity}
                                </Chip>
                                <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded-full">
                                  {new Date(error.timestamp).toLocaleTimeString()}
                                </span>
                              </div>
                              <div className="text-sm text-gray-700 bg-white p-2 rounded-lg border">
                                {error.message}
                              </div>
                            </div>
                          </div>
                          
                          <Button
                            size="sm"
                            color="danger"
                            variant="flat"
                            onPress={() => clearError(index)}
                            className="bg-red-500 text-white border-red-500"
                          >
                            🗑️ 삭제
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardBody>
              </Card>

              {/* 실시간 로그 */}
              <Card className="border-2 border-gray-300 shadow-lg">
                <CardHeader className="bg-gray-50 border-b border-gray-300">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    📝 실시간 로그
                  </h3>
                </CardHeader>
                <CardBody className="bg-white p-0">
                  <div className="bg-black text-green-400 p-6 rounded-lg font-mono text-sm h-80 overflow-y-auto border-2 border-gray-400">
                    {isMonitoringConnected ? (
                      <div className="space-y-2">
                        <div className="text-yellow-400">[시스템 모니터링 시작]</div>
                        <div>[{new Date().toLocaleTimeString()}] ✅ WebSocket 연결 성공</div>
                        <div>[{new Date().toLocaleTimeString()}] 🔍 오류 수집 활성화</div>
                        <div>[{new Date().toLocaleTimeString()}] 📊 성능 모니터링 시작</div>
                        <div className="text-blue-400">[실시간 모니터링 중...]</div>
                        <div className="text-gray-500">[메모리: {systemStats.memory}% | CPU: {systemStats.cpu}% | 응답시간: {systemStats.responseTime}ms]</div>
                      </div>
                    ) : (
                      <div className="text-red-400 flex items-center gap-2">
                        <span>❌</span>
                        <span>모니터링이 연결되지 않았습니다. 연결 버튼을 클릭하여 모니터링을 시작하세요.</span>
                      </div>
                    )}
                  </div>
                </CardBody>
              </Card>
            </div>
          </ModalBody>
          
          <ModalFooter className="bg-gray-100 border-t border-gray-300">
            <Button variant="light" onPress={onDashboardClose} className="bg-white text-gray-700 border-gray-300">
              닫기
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default MonitoringDashboard;
