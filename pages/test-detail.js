import { useEffect, useState, useRef } from 'react';
import Head from 'next/head';

const TABS = [
  { key: 'testlog', label: '테스트/로그' },
];

// 🌐 Detail 페이지 프로젝트 (localhost: {process.env.PORT || 34343})
const DETAIL_PAGE_PATHS = [
  { path: '/test-detail', desc: '테스트 대시보드', type: 'page', project: 'detail', port:  {process.env.PORT || 34343} },
  { path: '/admin', desc: '관리자 페이지', type: 'page', project: 'detail', port:  {process.env.PORT || 34343} },
  { path: '/', desc: '메인 페이지', type: 'page', project: 'detail', port:  {process.env.PORT || 34343} },
];

const DETAIL_API_PATHS = [
  { path: '/api/test-dashboard', desc: '상태/제어 API', type: 'api', project: 'detail', port:  {process.env.PORT || 34343} },
  { path: '/api/log-receiver', desc: '로그 수신 API', type: 'api', project: 'detail', port:  {process.env.PORT || 34343} },
  { path: '/api/hotels', desc: '호텔 데이터 API', type: 'api', project: 'detail', port:  {process.env.PORT || 34343} },
  { path: '/api/rooms', desc: '객실 데이터 API', type: 'api', project: 'detail', port:  {process.env.PORT || 34343} },
  { path: '/api/packages', desc: '패키지 데이터 API', type: 'api', project: 'detail', port:  {process.env.PORT || 34343} },
  { path: '/api/notices', desc: '공지사항 API', type: 'api', project: 'detail', port:  {process.env.PORT || 34343} },
  { path: '/api/price', desc: '가격 정보 API', type: 'api', project: 'detail', port:  {process.env.PORT || 34343} },
  { path: '/api/cancel', desc: '취소 정책 API', type: 'api', project: 'detail', port:  {process.env.PORT || 34343} },
  { path: '/api/websocket', desc: '웹소켓 연결', type: 'api', project: 'detail', port:  {process.env.PORT || 34343} },
];

// 🔧 다른 프로젝트 (localhost:3000) - 참고용
const OTHER_PROJECT_PATHS = [
  { path: 'http://localhost:3000', desc: '다른 프로젝트 (로그인 필요)', type: 'external', project: 'other', port: 3000 },
];

// 🗄️ 데이터베이스 관리 도구
const DB_TOOLS_PATHS = [
  { path: 'http://localhost:5559', desc: 'Prisma Studio (DB 관리)', type: 'external', project: 'db', port: 5559 },
];

export default function TestDetail() {
  const [status, setStatus] = useState(null);
  const [monitoring, setMonitoring] = useState(null);
  const [logs, setLogs] = useState([]);
  const [logFilter, setLogFilter] = useState('all'); // all, info, error, success
  const [logSearch, setLogSearch] = useState('');
  const [currentLogLevel, setCurrentLogLevel] = useState('info');
  const [logMessage, setLogMessage] = useState('');
  const [logStatus, setLogStatus] = useState({ show: false, message: '', type: '' });
  const [currentTime, setCurrentTime] = useState('');
  const [isClient, setIsClient] = useState(false);
  const [activeTab, setActiveTab] = useState('testlog');
  const [pwResult, setPwResult] = useState('');
  const [pwLoading, setPwLoading] = useState(false);
  const [monitoringHistory, setMonitoringHistory] = useState([]);
  const [testResults, setTestResults] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [autoBackup, setAutoBackup] = useState(true);
  const [debounceTimer, setDebounceTimer] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [draggedItem, setDraggedItem] = useState(null);
  const [testMode, setTestMode] = useState('headless'); // headless, headed
  const [pwElapsed, setPwElapsed] = useState(0); // Playwright 경과 시간
  const pwTimerRef = useRef(null);

  // 다크 모드 스타일 - 최상단으로 이동
  const theme = {
    background: darkMode ? '#1a1a1a' : '#f5f5f5',
    cardBackground: darkMode ? '#2d2d2d' : '#fff',
    text: darkMode ? '#e0e0e0' : '#222',
    textSecondary: darkMode ? '#b0b0b0' : '#666',
    border: darkMode ? '#404040' : '#e0e0e0',
    shadow: darkMode ? '0 2px 8px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.1)'
  };

  useEffect(() => {
    setIsClient(true);
    addLog('🚀 Detail 테스트 대시보드 시작됨', 'info');
    refreshStatus();
    // 실시간 모니터링 제거 - 리소스 절약
    // const interval = setInterval(refreshStatus, 5000);
    
    // 자동 백업 설정
    const backupInterval = setInterval(() => {
      if (autoBackup) {
        saveBackup();
      }
    }, 30000); // 30초마다 백업
    
    return () => {
      // clearInterval(interval);
      clearInterval(backupInterval);
    };
  }, [autoBackup]);

  useEffect(() => {
    if (isClient) {
      // 웹소켓 연결 제거 - 리소스 절약
      // const initSocket = async () => {
      //   try {
      //     await fetch('/api/websocket');
      //     const io = (await import('socket.io-client')).default;
      //     const socketInstance = io();
      //     
      //     socketInstance.on('connect', () => {
      //       setIsConnected(true);
      //       addLog('🔌 Detail 실시간 연결 성공', 'success');
      //     });
      //     
      //     socketInstance.on('disconnect', () => {
      //       setIsConnected(false);
      //       addLog('🔌 Detail 실시간 연결 해제', 'warning');
      //     });
      //     
      //     socketInstance.on('new-log', (data) => {
      //       addLog(data.message, data.type);
      //     });
      //     
      //     socketInstance.on('test-update', (data) => {
      //       addNotification(data.message, data.type);
      //     });
      //     
      //     socketInstance.on('monitor-update', (data) => {
      //       setMonitoring(data);
      //     });
      //     
      //     setSocket(socketInstance);
      //   } catch (error) {
      //     console.error('웹소켓 연결 실패:', error);
      //       addLog('🔌 Detail 실시간 연결 실패', 'error');
      //   }
      // };
      // 
      // initSocket();
    }
  }, [isClient]);

  useEffect(() => {
    if (!isClient) return;
    const updateTime = () => {
      setCurrentTime(new Date().toLocaleString('ko-KR', {
        year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true
      }));
    };
    updateTime();
    // 실시간 시간 업데이트 제거 - 리소스 절약
    // const timeInterval = setInterval(updateTime, 1000);
    // return () => clearInterval(timeInterval);
  }, [isClient]);

  useEffect(() => {
    if (!isClient) return;
    // 10초마다 서버 상태 체크 (3초에서 변경)
    const interval = setInterval(async () => {
      try {
        const res = await fetch('/api/test-dashboard');
        if (res.ok) {
          setIsConnected(true);
        } else {
          setIsConnected(false);
        }
      } catch {
        setIsConnected(false);
      }
    }, 10000); // 3초에서 10초로 변경
    return () => clearInterval(interval);
  }, [isClient]);

  const refreshStatus = async () => {
    try {
      const response = await fetch('/api/test-dashboard');
      const data = await response.json();
      setStatus(data);
      setMonitoring(data.monitoring);
      
      // 모니터링 히스토리 업데이트 제거 - 리소스 절약
      // if (data.monitoring) {
      //   setMonitoringHistory(prev => {
      //     const newHistory = [...prev, {
      //       ...data.monitoring,
      //       timestamp: new Date().getTime()
      //     }];
      //     return newHistory.slice(-20); // 최근 20개 데이터만 유지
      //   });
      // }
    } catch (error) {
      addLog(`❌ Detail 상태 새로고침 실패: ${error.message}`, 'error');
    }
  };

  const addLog = (message, level = 'info') => {
    const timestamp = new Date().toLocaleString('ko-KR', { 
      timeZone: 'Asia/Seoul',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
    
    const newLog = {
      id: Date.now(), // 드래그 앤 드롭을 위한 ID 추가
      timestamp,
      message,
      level
    };
    
    setLogs(prev => [newLog, ...prev.slice(0, 99)]); // 최대 100개 로그 유지
  };

  const sendLog = async () => {
    if (!logMessage.trim()) {
      showLogStatus('로그 메시지를 입력해주세요.', 'error');
      return;
    }
    try {
      const response = await fetch('/api/log-receiver', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          level: currentLogLevel,
          message: logMessage,
          source: 'detail-test-dashboard',
          timestamp: new Date().toISOString()
        })
      });
      if (response.ok) {
        showLogStatus('로그 전송 성공!', 'success');
        setLogMessage('');
        addLog(`📤 로그 전송: ${logMessage}`);
      } else {
        showLogStatus('로그 전송 실패', 'error');
      }
    } catch (error) {
      showLogStatus(`로그 전송 오류: ${error.message}`, 'error');
    }
  };

  const showLogStatus = (message, type) => {
    setLogStatus({ show: true, message, type });
    setTimeout(() => setLogStatus({ show: false, message: '', type: '' }), 3000);
  };

  const executeAction = async (action) => {
    addLog(`🔧 Detail ${action} 실행 시작... (${testMode} 모드)`, 'info');
    addNotification(`Detail ${action} 실행 중... (${testMode} 모드)`, 'info');
    
    try {
      const response = await fetch('/api/test-dashboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action,
          testMode: testMode // 헤드리스/헤디드 모드 전달
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log(`Detail ${action} 결과:`, result);
      
      // 테스트 결과 자동 저장
      saveTestResult(action, result);
      
      if (result.success) {
        addLog(`✅ Detail ${action}: ${result.message}`, 'success');
        addNotification(`✅ Detail ${action} 성공`, 'success');
        setTimeout(refreshStatus, 2000);
      } else {
        addLog(`❌ Detail ${action} 실패: ${result.message || result.error}`, 'error');
        addNotification(`❌ Detail ${action} 실패`, 'error');
      }
    } catch (error) {
      console.error(`Detail ${action} 오류:`, error);
      addLog(`❌ Detail ${action} 실행 오류: ${error.message}`, 'error');
      addNotification(`❌ Detail ${action} 오류 발생`, 'error');
      
      // 오류도 결과로 저장
      saveTestResult(action, {
        success: false,
        message: error.message,
        error: error.message
      });
    }
  };

  const filteredLogs = logs.filter(log => {
    const matchesFilter = logFilter === 'all' || log.level === logFilter;
    const matchesSearch = logSearch === '' || 
      log.message.toLowerCase().includes(logSearch.toLowerCase()) ||
      log.timestamp.toLowerCase().includes(logSearch.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // 메모이제이션된 통계 계산
  const logStats = {
    total: logs.length,
    info: logs.filter(log => log.level === 'info').length,
    success: logs.filter(log => log.level === 'success').length,
    error: logs.filter(log => log.level === 'error').length,
    filtered: filteredLogs.length
  };

  const clearLogs = () => {
    setLogs([]);
    addLog('🗑️ Detail 로그가 모두 삭제되었습니다.', 'info');
  };

  const exportLogs = () => {
    const logText = filteredLogs.map(log => 
      `[${log.timestamp}] ${log.level.toUpperCase()}: ${log.message}`
    ).join('\n');
    
    const blob = new Blob([logText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `detail-logs-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    
    addLog('📁 Detail 로그가 내보내기되었습니다.', 'success');
  };

  const exportData = (type, data, filename) => {
    let content, mimeType, extension;
    
    switch (type) {
      case 'json':
        content = JSON.stringify(data, null, 2);
        mimeType = 'application/json';
        extension = 'json';
        break;
      case 'csv':
        if (Array.isArray(data) && data.length > 0) {
          const headers = Object.keys(data[0]);
          const csvContent = [
            headers.join(','),
            ...data.map(row => headers.map(header => `"${row[header]}"`).join(','))
          ].join('\n');
          content = csvContent;
        } else {
          content = 'No data';
        }
        mimeType = 'text/csv';
        extension = 'csv';
        break;
      case 'txt':
        content = Array.isArray(data) ? data.join('\n') : JSON.stringify(data, null, 2);
        mimeType = 'text/plain';
        extension = 'txt';
        break;
      default:
        return;
    }
    
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}-${new Date().toISOString().split('T')[0]}.${extension}`;
    a.click();
    URL.revokeObjectURL(url);
    
    addLog(`📁 Detail ${filename} ${type.toUpperCase()} 내보내기 완료`, 'success');
    addNotification(`📁 ${filename} 내보내기 완료`, 'success');
  };

  // Playwright 결과 실행
  const runPlaywright = async () => {
    setPwLoading(true);
    setPwResult('');
    setPwElapsed(0);
    if (pwTimerRef.current) clearInterval(pwTimerRef.current);
    pwTimerRef.current = setInterval(() => setPwElapsed(e => e + 1), 1000);
    try {
      const res = await fetch('/api/test-dashboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'run-e2e-tests' })
      });
      const data = await res.json();
      setPwResult(data.output || data.message || '결과 없음');
    } catch (e) {
      setPwResult('Playwright 실행 오류: ' + e.message);
    }
    setPwLoading(false);
    if (pwTimerRef.current) clearInterval(pwTimerRef.current);
  };

  const saveTestResult = (action, result) => {
    const testResult = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      action,
      success: result.success,
      message: result.message,
      output: result.output || '',
      error: result.error || ''
    };
    
    setTestResults(prev => [testResult, ...prev.slice(0, 49)]); // 최근 50개 결과 유지
    addLog(`📊 Detail 테스트 결과 저장: ${action}`, 'info');
  };

  const handleButtonClick = (action) => {
    console.log(`Detail 버튼 클릭: ${action}`);
    addLog(`🔘 Detail ${action} 버튼 클릭됨`, 'info');
    executeAction(action);
  };

  const tabStyle = (key) => ({
    padding: '12px 24px',
    border: 'none',
    background: activeTab === key ? (darkMode ? '#404040' : '#222') : (darkMode ? '#3d3d3d' : '#f0f0f0'),
    color: activeTab === key ? '#fff' : theme.text,
    fontWeight: 700,
    fontSize: '1em',
    cursor: 'pointer',
    borderRadius: '8px 8px 0 0',
    marginRight: 4,
    outline: 'none',
    borderBottom: activeTab === key ? `2px solid ${darkMode ? '#404040' : '#222'}` : `2px solid ${theme.border}`,
    transition: 'all 0.2s',
  });

  const buttonStyle = {
    primary: {
      background: '#222',
      color: '#fff',
      border: 'none',
      padding: '12px 20px',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '600',
      transition: 'all 0.3s',
      boxShadow: '0 1px 4px rgba(0,0,0,0.08)'
    },
    success: {
      background: '#4caf50',
      color: '#fff',
      border: 'none',
      padding: '12px 20px',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '600',
      transition: 'all 0.3s',
      boxShadow: '0 1px 4px rgba(76,175,80,0.08)'
    },
    warning: {
      background: '#ff9800',
      color: '#fff',
      border: 'none',
      padding: '12px 20px',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '600',
      transition: 'all 0.3s',
      boxShadow: '0 1px 4px rgba(255,152,0,0.08)'
    },
    info: {
      background: '#2196f3',
      color: '#fff',
      border: 'none',
      padding: '12px 20px',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '600',
      transition: 'all 0.3s',
      boxShadow: '0 1px 4px rgba(33,150,243,0.08)'
    },
    danger: {
      background: '#f44336',
      color: '#fff',
      border: 'none',
      padding: '12px 20px',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '600',
      transition: 'all 0.3s',
      boxShadow: '0 1px 4px rgba(244,67,54,0.08)'
    }
  };

  // 간단한 차트 렌더링 함수
  const renderChart = (data, title, color, maxValue = 100) => {
    if (!data || data.length === 0) return <div style={{ color: '#888', fontStyle: 'italic' }}>데이터 없음</div>;
    
    const maxHeight = 60;
    const width = 300;
    const barWidth = width / data.length;
    
    return (
      <div style={{ marginBottom: 20 }}>
        <h4 style={{ margin: '0 0 10px 0', fontSize: '0.9em', color: '#333' }}>{title}</h4>
        <div style={{ 
          display: 'flex', 
          alignItems: 'end', 
          height: maxHeight, 
          width: width,
          borderBottom: '1px solid #ddd',
          borderLeft: '1px solid #ddd'
        }}>
          {data.map((value, index) => (
            <div
              key={index}
              style={{
                width: barWidth - 1,
                height: (value / maxValue) * maxHeight,
                backgroundColor: color,
                marginRight: 1,
                transition: 'height 0.3s ease'
              }}
              title={`${value}%`}
            />
          ))}
        </div>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          fontSize: '0.75em', 
          color: '#666',
          marginTop: 5
        }}>
          <span>0%</span>
          <span>{maxValue}%</span>
        </div>
      </div>
    );
  };

  const addNotification = (message, type = 'info', duration = 5000) => {
    const notification = {
      id: Date.now(),
      message,
      type,
      timestamp: new Date().toISOString()
    };
    
    setNotifications(prev => [notification, ...prev.slice(0, 4)]); // 최대 5개 알림
    
    // 자동 제거
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
    }, duration);
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const saveBackup = () => {
    const backupData = {
      timestamp: new Date().toISOString(),
      logs: logs,
      testResults: testResults,
      monitoringHistory: monitoringHistory,
      status: status
    };
    
    try {
      localStorage.setItem('detail-backup', JSON.stringify(backupData));
      addLog('💾 Detail 자동 백업 저장됨', 'success');
    } catch (error) {
      addLog('❌ Detail 백업 저장 실패', 'error');
    }
  };

  const loadBackup = () => {
    try {
      const backupData = localStorage.getItem('detail-backup');
      if (backupData) {
        const data = JSON.parse(backupData);
        setLogs(data.logs || []);
        setTestResults(data.testResults || []);
        setMonitoringHistory(data.monitoringHistory || []);
        addLog('📂 Detail 백업 복원 완료', 'success');
        addNotification('📂 백업 복원 완료', 'success');
      } else {
        addLog('❌ Detail 백업 데이터 없음', 'error');
      }
    } catch (error) {
      addLog('❌ Detail 백업 복원 실패', 'error');
    }
  };

  const clearBackup = () => {
    try {
      localStorage.removeItem('detail-backup');
      addLog('🗑️ Detail 백업 삭제됨', 'info');
      addNotification('🗑️ 백업 삭제됨', 'info');
    } catch (error) {
      addLog('❌ Detail 백업 삭제 실패', 'error');
    }
  };

  const debouncedSearch = (value) => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
    
    const timer = setTimeout(() => {
      setLogSearch(value);
    }, 300);
    
    setDebounceTimer(timer);
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    addLog(`🌙 Detail ${!darkMode ? '다크' : '라이트'} 모드로 변경`, 'info');
  };

  // 드래그 앤 드롭 핸들러
  const handleDragStart = (e, item) => {
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.target.outerHTML);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e, targetItem) => {
    e.preventDefault();
    setDragOver(false);
    
    if (draggedItem && draggedItem !== targetItem) {
      // 로그 순서 변경
      const draggedIndex = logs.findIndex(log => log.id === draggedItem.id);
      const targetIndex = logs.findIndex(log => log.id === targetItem.id);
      
      if (draggedIndex !== -1 && targetIndex !== -1) {
        const newLogs = [...logs];
        const [draggedLog] = newLogs.splice(draggedIndex, 1);
        newLogs.splice(targetIndex, 0, draggedLog);
        setLogs(newLogs);
        addLog('📋 Detail 로그 순서 변경됨', 'info');
      }
    }
    
    setDraggedItem(null);
  };

  const cardStyle = {
    background: theme.cardBackground,
    borderRadius: '12px',
    boxShadow: theme.shadow,
    padding: 24,
    marginBottom: 20,
    color: theme.text,
    fontWeight: 500,
    fontSize: '1.05em',
    transition: 'all 0.3s ease'
  };

  if (!isClient) {
    return (
      <div style={{
        display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '1.2em', color: '#222', background: '#f7f7f7', fontWeight: 700
      }}>
        로딩 중...
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Detail 테스트 대시보드 - 호텔 관리 시스템</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <style jsx>{`
          @keyframes slideIn {
            from {
              transform: translateX(100%);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
          
          @media (max-width: 768px) {
            .mobile-container {
              padding: 10px !important;
            }
            .mobile-tabs {
              flex-direction: column;
              padding: 0 10px !important;
            }
            .mobile-tab {
              border-radius: 8px !important;
              margin-bottom: 4px !important;
              margin-right: 0 !important;
            }
            .mobile-content {
              padding: 16px !important;
            }
            .mobile-grid {
              grid-template-columns: 1fr !important;
            }
            .mobile-buttons {
              flex-direction: column !important;
            }
            .mobile-button {
              width: 100% !important;
              margin-bottom: 8px !important;
            }
          }
        `}</style>
      </Head>
      <div className="mobile-container" style={{ 
        minHeight: '100vh', 
        background: theme.background, 
        fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
        padding: '20px',
        color: theme.text,
        transition: 'all 0.3s ease'
      }}>
        {/* 알림 영역 */}
        <div style={{
          position: 'fixed',
          top: 20,
          right: 20,
          zIndex: 1000,
          maxWidth: 400
        }}>
          {notifications.map(notification => (
            <div
              key={notification.id}
              style={{
                background: notification.type === 'success' ? '#d4edda' : 
                           notification.type === 'error' ? '#f8d7da' : '#d1ecf1',
                color: notification.type === 'success' ? '#155724' : 
                       notification.type === 'error' ? '#721c24' : '#0c5460',
                border: `1px solid ${notification.type === 'success' ? '#c3e6cb' : 
                                     notification.type === 'error' ? '#f5c6cb' : '#bee5eb'}`,
                borderRadius: 8,
                padding: '12px 16px',
                marginBottom: 8,
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                animation: 'slideIn 0.3s ease-out'
              }}
            >
              <span style={{ fontSize: '0.9em' }}>{notification.message}</span>
              <button
                onClick={() => removeNotification(notification.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'inherit',
                  cursor: 'pointer',
                  fontSize: '1.2em',
                  marginLeft: 10,
                  opacity: 0.7
                }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
        {/* 탭 메뉴 */}
        <div className="mobile-tabs" style={{ 
          display: 'flex', 
          borderBottom: `2px solid ${theme.border}`, 
          background: theme.cardBackground, 
          padding: '0 24px', 
          position: 'sticky', 
          top: 0, 
          zIndex: 10,
          transition: 'all 0.3s ease'
        }}>
          {TABS.map(tab => (
            <button key={tab.key} className="mobile-tab" style={tabStyle(tab.key)} onClick={() => setActiveTab(tab.key)}>{tab.label}</button>
          ))}
          <div style={{ flex: 1 }} />
          <button 
            onClick={toggleDarkMode}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.2em',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '4px',
              marginRight: 10,
              color: theme.text
            }}
            title={darkMode ? '라이트 모드로 변경' : '다크 모드로 변경'}
          >
            {darkMode ? '☀️' : '🌙'}
          </button>
          <div style={{ 
            fontSize: '0.9em', 
            color: isConnected ? '#28a745' : '#dc3545', 
            alignSelf: 'center',
            marginRight: 15,
            display: 'flex',
            alignItems: 'center',
            gap: 5
          }}>
            {isConnected ? '🔌' : '❌'} {isConnected ? '실시간' : '오프라인'}
          </div>
          <div style={{ fontSize: '0.95em', color: theme.textSecondary, alignSelf: 'center' }}>🕐 {currentTime}</div>
        </div>

        {/* 탭별 컨텐츠 */}
        <div className="mobile-content" style={{ maxWidth: 1200, margin: '0 auto', padding: 32 }}>
          {/* 대시보드 */}
          {activeTab === 'dashboard' && (
            <div>
              <div style={cardStyle}>
                <h2 style={{ fontWeight: 700, fontSize: '1.4em', margin: 0, color: theme.text }}>서버/DB/시스템 상태</h2>
                <div style={{ marginTop: 12 }}>
                  <div>서버: {status?.serverRunning ? '🟢 실행 중' : '🔴 중지됨'}</div>
                  <div>DB: {status?.dbConnected ? '🟢 연결됨' : '🔴 연결 안됨'}</div>
                  {monitoring && (
                    <div style={{ marginTop: 10 }}>
                      <div>업타임: {monitoring.uptime} | 프로세스: {monitoring.processCount}개</div>
                    </div>
                  )}
                </div>
              </div>
              <div style={cardStyle}>
                <h3 style={{ fontWeight: 700, fontSize: '1.1em', margin: 0, color: theme.text }}>빠른 제어</h3>
                
                {/* 테스트 모드 선택 */}
                <div style={{ marginBottom: 15, padding: '12px', background: darkMode ? '#3d3d3d' : '#f8f9fa', borderRadius: 8 }}>
                  <div style={{ fontSize: '0.9em', fontWeight: 600, marginBottom: 8, color: theme.text }}>🧪 테스트 모드 선택:</div>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                      <input
                        type="radio"
                        name="testMode"
                        value="headless"
                        checked={testMode === 'headless'}
                        onChange={(e) => setTestMode(e.target.value)}
                        style={{ width: 16, height: 16 }}
                      />
                      <span style={{ fontSize: '0.9em', color: theme.text }}>🔒 헤드리스 (빠름)</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                      <input
                        type="radio"
                        name="testMode"
                        value="headed"
                        checked={testMode === 'headed'}
                        onChange={(e) => setTestMode(e.target.value)}
                        style={{ width: 16, height: 16 }}
                      />
                      <span style={{ fontSize: '0.9em', color: theme.text }}>👁️ 헤디드 (브라우저 표시)</span>
                    </label>
                  </div>
                </div>
                
                <div className="mobile-buttons" style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 10 }}>
                  <button className="mobile-button" onClick={() => handleButtonClick('run-all-tests')} style={buttonStyle.primary}>🚀 전체 테스트</button>
                  <button className="mobile-button" onClick={() => handleButtonClick('start-server')} style={buttonStyle.success}>🌐 서버 시작</button>
                  <button className="mobile-button" onClick={() => handleButtonClick('run-e2e-tests')} style={buttonStyle.warning}>🧪 E2E 테스트</button>
                  <button className="mobile-button" onClick={() => handleButtonClick('check-db')} style={buttonStyle.info}>🗄️ DB 연결 확인</button>
                  <button className="mobile-button" onClick={() => handleButtonClick('stop-server')} style={buttonStyle.danger}>⏹️ 서버 중지</button>
                </div>
              </div>
              <div style={{ background: theme.cardBackground, padding: 20, borderRadius: 12, boxShadow: theme.shadow, marginBottom: 20, transition: 'all 0.3s ease' }}>
                <h3 style={{ fontWeight: 700, fontSize: '1.1em', margin: 0, color: theme.text, marginBottom: 15 }}>실시간 모니터링</h3>
                
                {/* 시스템 상태 카드들 */}
                <div className="mobile-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 15, marginBottom: 20 }}>
                  <div style={{ background: darkMode ? '#3d3d3d' : '#f8f9fa', padding: 15, borderRadius: 8, textAlign: 'center', transition: 'all 0.3s ease' }}>
                    <div style={{ fontSize: '1.5em', fontWeight: 700, color: '#007bff' }}>{monitoring?.cpu || 0}%</div>
                    <div style={{ fontSize: '0.9em', color: theme.textSecondary }}>CPU 사용률</div>
                  </div>
                  <div style={{ background: darkMode ? '#3d3d3d' : '#f8f9fa', padding: 15, borderRadius: 8, textAlign: 'center', transition: 'all 0.3s ease' }}>
                    <div style={{ fontSize: '1.5em', fontWeight: 700, color: '#28a745' }}>{monitoring?.memory || 0}%</div>
                    <div style={{ fontSize: '0.9em', color: theme.textSecondary }}>메모리 사용률</div>
                  </div>
                  <div style={{ background: darkMode ? '#3d3d3d' : '#f8f9fa', padding: 15, borderRadius: 8, textAlign: 'center', transition: 'all 0.3s ease' }}>
                    <div style={{ fontSize: '1.5em', fontWeight: 700, color: monitoring?.temperature > 70 ? '#dc3545' : '#ffc107' }}>
                      {monitoring?.temperature || 'N/A'}°C
                    </div>
                    <div style={{ fontSize: '0.9em', color: theme.textSecondary }}>온도</div>
                  </div>
                  <div style={{ background: darkMode ? '#3d3d3d' : '#f8f9fa', padding: 15, borderRadius: 8, textAlign: 'center', transition: 'all 0.3s ease' }}>
                    <div style={{ fontSize: '1.5em', fontWeight: 700, color: '#6c757d' }}>{monitoring?.processCount || 0}</div>
                    <div style={{ fontSize: '0.9em', color: theme.textSecondary }}>Node 프로세스</div>
                  </div>
                </div>
                
                {/* 실시간 차트 */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
                  {renderChart(
                    monitoringHistory.map(m => m.cpu || 0),
                    'CPU 사용률 추이',
                    '#007bff'
                  )}
                  {renderChart(
                    monitoringHistory.map(m => m.memory || 0),
                    '메모리 사용률 추이',
                    '#28a745'
                  )}
                  {renderChart(
                    monitoringHistory.map(m => m.temperature || 0),
                    '온도 추이',
                    '#ffc107',
                    100
                  )}
                </div>
              </div>
              
              {/* 백업 관리 */}
              <div style={{ background: theme.cardBackground, padding: 20, borderRadius: 12, boxShadow: theme.shadow, marginBottom: 20, transition: 'all 0.3s ease' }}>
                <h3 style={{ fontWeight: 700, fontSize: '1.1em', margin: 0, color: theme.text, marginBottom: 15 }}>Detail 백업 관리</h3>
                <div style={{ display: 'flex', gap: 10, marginBottom: 15, alignItems: 'center' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={autoBackup}
                      onChange={(e) => setAutoBackup(e.target.checked)}
                      style={{ width: 16, height: 16 }}
                    />
                    <span style={{ fontSize: '0.9em', color: theme.text }}>자동 백업 (30초마다)</span>
                  </label>
                </div>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <button onClick={saveBackup} style={buttonStyle.success}>💾 수동 백업</button>
                  <button onClick={loadBackup} style={buttonStyle.info}>📂 백업 복원</button>
                  <button onClick={clearBackup} style={buttonStyle.danger}>🗑️ 백업 삭제</button>
                </div>
              </div>
            </div>
          )}

          {/* API/주소 맵 */}
          {activeTab === 'api' && (
            <div>
              {/* 페이지 링크 */}
              {/* 🌐 Detail 페이지 프로젝트 (localhost: {process.env.PORT || 34343}) */}
              <div style={cardStyle}>
                <h2 style={{ fontWeight: 700, fontSize: '1.3em', margin: 0, color: theme.text, marginBottom: 15 }}>
                  🌐 Detail 페이지 프로젝트 (포트:  {process.env.PORT || 34343})
                </h2>
                <div style={{ margin: '8px 0 16px 0', padding: '8px 12px', background: darkMode ? '#2d2d2d' : '#e8f5e8', borderRadius: 6, border: '1px solid #28a745' }}>
                  <span style={{ color: '#28a745', fontWeight: 600 }}>✅ 현재 실행 중인 프로젝트</span>
                  <span style={{ color: '#28a745', fontWeight: 400, marginLeft: 10 }}>| Next.js 14.2.30 | Neon DB 연결됨</span>
                </div>
                <ul style={{ margin: '16px 0 0 0', padding: 0, listStyle: 'none', color: theme.text }}>
                  {DETAIL_PAGE_PATHS.map(item => (
                    <li key={item.path} style={{ marginBottom: 12, padding: '8px 12px', borderRadius: 6, background: darkMode ? '#3d3d3d' : '#f8f9fa', transition: 'all 0.2s ease' }}>
                      <a 
                        href={item.path} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={{ 
                          textDecoration: 'none', 
                          color: '#28a745', 
                          fontWeight: 600,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8
                        }}
                        onMouseEnter={(e) => e.target.style.color = '#1e7e34'}
                        onMouseLeave={(e) => e.target.style.color = '#28a745'}
                      >
                        🌐 <span style={{ fontWeight: 700 }}>{item.path}</span>
                      </a>
                      <span style={{ color: theme.textSecondary, marginLeft: 8, fontSize: '0.9em' }}>{item.desc}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* API 엔드포인트 */}
              <div style={cardStyle}>
                <h2 style={{ fontWeight: 700, fontSize: '1.3em', margin: 0, color: theme.text, marginBottom: 15 }}>
                  🔌 API 엔드포인트 (JSON 데이터)
                </h2>
                <ul style={{ margin: '16px 0 0 0', padding: 0, listStyle: 'none', color: theme.text }}>
                  {DETAIL_API_PATHS.map(item => (
                    <li key={item.path} style={{ marginBottom: 12, padding: '8px 12px', borderRadius: 6, background: darkMode ? '#3d3d3d' : '#f8f9fa', transition: 'all 0.2s ease' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ color: '#007bff', fontSize: '1.2em' }}>🔌</span>
                        <span style={{ fontWeight: 700, color: '#007bff' }}>{item.path}</span>
                        <button
                          onClick={() => {
                            fetch(item.path)
                              .then(res => res.json())
                              .then(data => {
                                const newWindow = window.open('', '_blank');
                                newWindow.document.write(`
                                  <html>
                                    <head>
                                      <title>${item.path} - API Response</title>
                                      <style>
                                        body { font-family: monospace; padding: 20px; background: #f5f5f5; }
                                        pre { background: white; padding: 15px; border-radius: 5px; overflow-x: auto; }
                                        .header { background: #007bff; color: white; padding: 10px; margin-bottom: 15px; border-radius: 5px; }
                                      </style>
                                    </head>
                                    <body>
                                      <div class="header">
                                        <h2>${item.path}</h2>
                                        <p>${item.desc}</p>
                                      </div>
                                      <pre>${JSON.stringify(data, null, 2)}</pre>
                                    </body>
                                  </html>
                                `);
                                newWindow.document.close();
                              })
                              .catch(err => {
                                alert(`API 호출 실패: ${err.message}`);
                              });
                          }}
                          style={{
                            background: '#007bff',
                            color: 'white',
                            border: 'none',
                            borderRadius: 4,
                            padding: '4px 8px',
                            fontSize: '0.8em',
                            cursor: 'pointer',
                            marginLeft: 'auto'
                          }}
                          onMouseEnter={(e) => e.target.style.background = '#0056b3'}
                          onMouseLeave={(e) => e.target.style.background = '#007bff'}
                        >
                          📊 보기
                        </button>
                      </div>
                      <span style={{ color: theme.textSecondary, marginLeft: 8, fontSize: '0.9em' }}>{item.desc}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* 🔧 다른 프로젝트 (localhost:3000) */}
              <div style={cardStyle}>
                <h2 style={{ fontWeight: 700, fontSize: '1.3em', margin: 0, color: theme.text, marginBottom: 15 }}>
                  🔧 다른 프로젝트 (포트: 3000)
                </h2>
                <div style={{ margin: '8px 0 16px 0', padding: '8px 12px', background: darkMode ? '#2d2d2d' : '#fff3cd', borderRadius: 6, border: '1px solid #ffc107' }}>
                  <span style={{ color: '#856404', fontWeight: 600 }}>⚠️ 별도 프로젝트 (로그인 필요)</span>
                  <span style={{ color: '#856404', fontWeight: 400, marginLeft: 10 }}>| 프로세스 ID: 28520</span>
                </div>
                
                <ul style={{ margin: '8px 0 0 0', padding: 0, listStyle: 'none', color: theme.text }}>
                  {OTHER_PROJECT_PATHS.map(item => (
                    <li key={item.path} style={{ marginBottom: 8, padding: '6px 10px', borderRadius: 6, background: darkMode ? '#3d3d3d' : '#f8f9fa', transition: 'all 0.2s ease' }}>
                      <a 
                        href={item.path} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={{ 
                          textDecoration: 'none', 
                          color: '#ffc107', 
                          fontWeight: 600,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.color = '#e0a800';
                          e.target.parentElement.style.background = darkMode ? '#4d4d4d' : '#e9ecef';
                          e.target.parentElement.style.transform = 'translateY(-2px)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.color = '#ffc107';
                          e.target.parentElement.style.transform = 'translateY(0)';
                        }}
                      >
                        🔧 {item.path} <span style={{ color: '#888', fontWeight: 400 }}>{item.desc}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* 🗄️ 데이터베이스 관리 도구 */}
              <div style={cardStyle}>
                <h2 style={{ fontWeight: 700, fontSize: '1.3em', margin: 0, color: theme.text, marginBottom: 15 }}>
                  🗄️ 데이터베이스 관리 도구 (포트: 5559)
                </h2>
                <div style={{ margin: '8px 0 16px 0', padding: '8px 12px', background: darkMode ? '#2d2d2d' : '#e3f2fd', borderRadius: 6, border: '1px solid #2196f3' }}>
                  <span style={{ color: '#1976d2', fontWeight: 600 }}>🗄️ Prisma Studio (DB 관리)</span>
                  <span style={{ color: '#1976d2', fontWeight: 400, marginLeft: 10 }}>| Neon PostgreSQL</span>
                </div>
                
                <ul style={{ margin: '8px 0 0 0', padding: 0, listStyle: 'none', color: theme.text }}>
                  {DB_TOOLS_PATHS.map(item => (
                    <li key={item.path} style={{ marginBottom: 8, padding: '6px 10px', borderRadius: 6, background: darkMode ? '#3d3d3d' : '#f8f9fa', transition: 'all 0.2s ease' }}>
                      <a 
                        href={item.path} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={{ 
                          textDecoration: 'none', 
                          color: '#2196f3', 
                          fontWeight: 600,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.color = '#1976d2';
                          e.target.parentElement.style.background = darkMode ? '#4d4d4d' : '#e9ecef';
                          e.target.parentElement.style.transform = 'translateY(-2px)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.color = '#2196f3';
                          e.target.parentElement.style.transform = 'translateY(0)';
                        }}
                      >
                        🗄️ {item.path} <span style={{ color: '#888', fontWeight: 400 }}>{item.desc}</span>
                        <span style={{ color: '#2196f3', fontSize: '0.8em', marginLeft: 'auto' }}>포트 {item.port}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              <div style={cardStyle}>
                <h3 style={{ fontWeight: 700, fontSize: '1.1em', margin: 0, color: theme.text }}>맵 구조</h3>
                <pre style={{ background: darkMode ? '#3d3d3d' : '#f0f0f0', color: theme.text, borderRadius: 8, padding: 16, fontSize: '0.98em', overflowX: 'auto' }}>{`
🌐 Detail 페이지 프로젝트 (포트:  {process.env.PORT || 34343})
  ├─ 📄 페이지
  │   ├─ /test-detail (테스트 대시보드)
  │   ├─ /admin (관리자 페이지)
  │   └─ / (메인 페이지)
  │
  └─ 🔌 API 엔드포인트
      ├─ /api/test-dashboard (상태/제어)
      ├─ /api/log-receiver (로그 수신)
      ├─ /api/hotels (호텔 데이터)
      ├─ /api/rooms (객실 데이터)
      ├─ /api/packages (패키지 데이터)
      ├─ /api/notices (공지사항)
      ├─ /api/price (가격 정보)
      ├─ /api/cancel (취소 정책)
      └─ /api/websocket (웹소켓 연결)

🔧 다른 프로젝트 (포트: 3000)
  └─ http://localhost:3000 (로그인 필요)

🗄️ 데이터베이스 관리 (포트: 5559)
  └─ http://localhost:5559 (Prisma Studio)

📋 API 설계 원칙
  • 최소 중첩 (Minimize nesting)
  • 루트 경로 우선 (Prefer root paths)
  • 최대 2-3단계 중첩 권장
  • 리소스 중심 설계
`}</pre>
              </div>
              
              {/* 추가 유용한 링크들 */}
              <div style={cardStyle}>
                <h3 style={{ fontWeight: 700, fontSize: '1.1em', margin: 0, color: theme.text, marginBottom: 15 }}>빠른 접근 링크</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 12 }}>
                                     <a 
                     href="http://localhost: {process.env.PORT || 34343}/test-detail" 
                     target="_blank" 
                     rel="noopener noreferrer"
                     style={{ 
                       display: 'block',
                       padding: '12px 16px',
                       background: darkMode ? '#3d3d3d' : '#f8f9fa',
                       borderRadius: 8,
                       textDecoration: 'none',
                       color: '#007bff',
                       fontWeight: 600,
                       border: '1px solid #e0e0e0',
                       transition: 'all 0.2s ease'
                     }}
                     onMouseEnter={(e) => {
                       e.target.style.background = darkMode ? '#4d4d4d' : '#e9ecef';
                       e.target.style.transform = 'translateY(-2px)';
                     }}
                     onMouseLeave={(e) => {
                       e.target.style.background = darkMode ? '#3d3d3d' : '#f8f9fa';
                       e.target.style.transform = 'translateY(0)';
                     }}
                   >
                     🏠 메인 대시보드
                   </a>
                   <a 
                     href="http://localhost: {process.env.PORT || 34343}/admin" 
                     target="_blank" 
                     rel="noopener noreferrer"
                     style={{ 
                       display: 'block',
                       padding: '12px 16px',
                       background: darkMode ? '#3d3d3d' : '#f8f9fa',
                       borderRadius: 8,
                       textDecoration: 'none',
                       color: '#28a745',
                       fontWeight: 600,
                       border: '1px solid #e0e0e0',
                       transition: 'all 0.2s ease'
                     }}
                     onMouseEnter={(e) => {
                       e.target.style.background = darkMode ? '#4d4d4d' : '#e9ecef';
                       e.target.style.transform = 'translateY(-2px)';
                     }}
                     onMouseLeave={(e) => {
                       e.target.style.background = darkMode ? '#3d3d3d' : '#f8f9fa';
                       e.target.style.transform = 'translateY(0)';
                     }}
                   >
                     ⚙️ 관리자 페이지
                   </a>
                   <a 
                     href="http://localhost: {process.env.PORT || 34343}/api/test-dashboard" 
                     target="_blank" 
                     rel="noopener noreferrer"
                     style={{ 
                       display: 'block',
                       padding: '12px 16px',
                       background: darkMode ? '#3d3d3d' : '#f8f9fa',
                       borderRadius: 8,
                       textDecoration: 'none',
                       color: '#ffc107',
                       fontWeight: 600,
                       border: '1px solid #e0e0e0',
                       transition: 'all 0.2s ease'
                     }}
                     onMouseEnter={(e) => {
                       e.target.style.background = darkMode ? '#4d4d4d' : '#e9ecef';
                       e.target.style.transform = 'translateY(-2px)';
                     }}
                     onMouseLeave={(e) => {
                       e.target.style.background = darkMode ? '#3d3d3d' : '#f8f9fa';
                       e.target.style.transform = 'translateY(0)';
                     }}
                   >
                     📊 API 상태 확인
                   </a>
                   <a 
                     href="http://localhost: {process.env.PORT || 34343}/api/hotels?templates=true" 
                     target="_blank" 
                     rel="noopener noreferrer"
                     style={{ 
                       display: 'block',
                       padding: '12px 16px',
                       background: darkMode ? '#3d3d3d' : '#f8f9fa',
                       borderRadius: 8,
                       textDecoration: 'none',
                       color: '#17a2b8',
                       fontWeight: 600,
                       border: '1px solid #e0e0e0',
                       transition: 'all 0.2s ease'
                     }}
                     onMouseEnter={(e) => {
                       e.target.style.background = darkMode ? '#4d4d4d' : '#e9ecef';
                       e.target.style.transform = 'translateY(-2px)';
                     }}
                     onMouseLeave={(e) => {
                       e.target.style.background = darkMode ? '#3d3d3d' : '#f8f9fa';
                       e.target.style.transform = 'translateY(0)';
                     }}
                   >
                     🏨 호텔 데이터 API
                   </a>
                </div>
              </div>
            </div>
          )}

          {/* 로그 */}
          {activeTab === 'testlog' && (
            <div>
              <div style={cardStyle}>
                <h2 style={{ fontWeight: 700, fontSize: '1.3em', margin: 0, color: '#222' }}>실시간 로그</h2>
                <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
                  <select value={currentLogLevel} onChange={e => setCurrentLogLevel(e.target.value)} style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #ddd', fontSize: 14 }}>
                    <option value="info">ℹ️ Info</option>
                    <option value="warn">⚠️ Warning</option>
                    <option value="error">❌ Error</option>
                    <option value="debug">🐛 Debug</option>
                  </select>
                  <input type="text" value={logMessage} onChange={e => setLogMessage(e.target.value)} placeholder="로그 메시지를 입력하세요..." style={{ flex: 1, minWidth: 200, padding: '8px 12px', borderRadius: 6, border: '1px solid #ddd', fontSize: 14 }} onKeyPress={e => e.key === 'Enter' && sendLog()} />
                  <button onClick={sendLog} style={buttonStyle.primary}>📤 로그 전송</button>
                  <button onClick={() => setLogMessage('Detail 테스트 로그 메시지 - ' + new Date().toLocaleString())} style={buttonStyle.success}>🧪 테스트 로그</button>
                  <button onClick={clearLogs} style={buttonStyle.danger}>🗑️ 로그 초기화</button>
                  <button onClick={exportLogs} style={buttonStyle.info}>📁 로그 내보내기</button>
                </div>
                {logStatus.show && (
                  <div style={{ marginBottom: 10, padding: 10, borderRadius: 6, background: logStatus.type === 'success' ? '#d4edda' : '#f8d7da', color: logStatus.type === 'success' ? '#155724' : '#721c24', border: `1px solid ${logStatus.type === 'success' ? '#c3e6cb' : '#f5c6cb'}` }}>{logStatus.message}</div>
                )}
                <div style={{ background: '#fff', padding: 20, borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                  <h2 style={{ fontWeight: 700, fontSize: '1.3em', margin: 0, color: '#222', marginBottom: 15 }}>Detail 로그 관리</h2>
                  
                  {/* 로그 필터링 UI */}
                  <div style={{ display: 'flex', gap: 10, marginBottom: 15, flexWrap: 'wrap', alignItems: 'center' }}>
                    <input
                      type="text"
                      placeholder="🔍 로그 검색..."
                      value={logSearch}
                      onChange={(e) => debouncedSearch(e.target.value)}
                      style={{
                        padding: '8px 12px',
                        border: '1px solid #ddd',
                        borderRadius: 6,
                        fontSize: '0.9em',
                        minWidth: 200,
                        flex: 1
                      }}
                    />
                    <div style={{ display: 'flex', gap: 5 }}>
                      {['all', 'info', 'success', 'error'].map(level => (
                        <button
                          key={level}
                          onClick={() => setLogFilter(level)}
                          style={{
                            padding: '6px 12px',
                            border: 'none',
                            borderRadius: 6,
                            fontSize: '0.85em',
                            cursor: 'pointer',
                            backgroundColor: logFilter === level ? '#007bff' : '#f8f9fa',
                            color: logFilter === level ? 'white' : '#666',
                            fontWeight: logFilter === level ? 600 : 400
                          }}
                        >
                          {level === 'all' ? '전체' : level === 'info' ? '정보' : level === 'success' ? '성공' : '오류'}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* 로그 액션 버튼들 */}
                  <div style={{ display: 'flex', gap: 10, marginBottom: 15, flexWrap: 'wrap' }}>
                    <button onClick={clearLogs} style={buttonStyle.danger}>🗑️ 로그 삭제</button>
                    <button onClick={() => exportData('txt', filteredLogs, 'detail-logs')} style={buttonStyle.info}>📁 TXT 내보내기</button>
                    <button onClick={() => exportData('json', filteredLogs, 'detail-logs')} style={buttonStyle.info}>📁 JSON 내보내기</button>
                    <button onClick={() => exportData('csv', filteredLogs, 'detail-logs')} style={buttonStyle.info}>📁 CSV 내보내기</button>
                  </div>
                  
                  {/* 로그 통계 */}
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', 
                    gap: 10, 
                    marginBottom: 15,
                    background: '#f8f9fa',
                    padding: 12,
                    borderRadius: 8
                  }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '1.2em', fontWeight: 700, color: '#007bff' }}>{logStats.total}</div>
                      <div style={{ fontSize: '0.8em', color: '#666' }}>전체</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '1.2em', fontWeight: 700, color: '#28a745' }}>{logStats.success}</div>
                      <div style={{ fontSize: '0.8em', color: '#666' }}>성공</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '1.2em', fontWeight: 700, color: '#dc3545' }}>{logStats.error}</div>
                      <div style={{ fontSize: '0.8em', color: '#666' }}>오류</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '1.2em', fontWeight: 700, color: '#6c757d' }}>{logStats.filtered}</div>
                      <div style={{ fontSize: '0.8em', color: '#666' }}>필터됨</div>
                    </div>
                  </div>
                </div>
                {/* 로그 목록 */}
                <div style={{ 
                  maxHeight: 400, 
                  overflowY: 'auto', 
                  border: `1px solid ${theme.border}`, 
                  borderRadius: 8,
                  background: darkMode ? '#1a1a1a' : '#fafafa',
                  transition: 'all 0.3s ease'
                }}>
                  {filteredLogs.length === 0 ? (
                    <div style={{ 
                      padding: '20px', 
                      textAlign: 'center', 
                      color: theme.textSecondary,
                      fontStyle: 'italic'
                    }}>
                      📝 Detail 로그가 없습니다. 테스트를 실행하거나 로그를 전송해보세요.
                    </div>
                  ) : (
                    filteredLogs.map((log, index) => (
                      <div
                        key={log.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, log)}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, log)}
                        style={{
                          padding: '12px 16px',
                          borderBottom: `1px solid ${theme.border}`,
                          background: draggedItem?.id === log.id ? (darkMode ? '#404040' : '#e8f4fd') : 'transparent',
                          cursor: 'grab',
                          transition: 'all 0.2s ease',
                          opacity: draggedItem?.id === log.id ? 0.5 : 1,
                          transform: draggedItem?.id === log.id ? 'scale(0.98)' : 'scale(1)'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ flex: 1 }}>
                            <span style={{ 
                              color: log.level === 'error' ? '#dc3545' : 
                                     log.level === 'success' ? '#28a745' : theme.text,
                              fontWeight: 500
                            }}>
                              {log.message}
                            </span>
                          </div>
                          <div style={{ 
                            fontSize: '0.8em', 
                            color: theme.textSecondary,
                            marginLeft: 10
                          }}>
                            {log.timestamp}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Playwright 결과 */}
          {activeTab === 'playwright' && (
            <div>
              <div style={cardStyle}>
                <h2 style={{ fontWeight: 700, fontSize: '1.3em', margin: 0, color: '#222' }}>Playwright 테스트 결과</h2>
                <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
                  <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 10 }}>
                    <button 
                      onClick={() => handleButtonClick('run-e2e-tests')} 
                      disabled={pwLoading}
                      style={{ ...buttonStyle.primary, opacity: pwLoading ? 0.6 : 1 }}
                    >
                      {pwLoading ? `⏳ 실행 중... (${pwElapsed}s)` : '🧪 Playwright 테스트'}
                    </button>
                    <button 
                      onClick={() => handleButtonClick('run-all-tests')} 
                      disabled={pwLoading}
                      style={{ ...buttonStyle.secondary, opacity: pwLoading ? 0.6 : 1 }}
                    >
                      전체 테스트
                    </button>
                  </div>
                </div>
                <div style={{ minHeight: 120, background: '#fafbfc', borderRadius: 8, padding: 18, fontSize: 16, color: '#444', marginBottom: 18 }}>
                  {pwResult ? pwResult : '테스트를 실행해보세요.'}
                </div>
                {/* 상태 메시지 & 진행 바 하단 고정 */}
                <div style={{ position: 'relative', minHeight: 36, marginTop: 8 }}>
                  {/* 진행 바 */}
                  <div style={{ height: 6, width: '100%', background: '#e9ecef', borderRadius: 4, overflow: 'hidden', marginBottom: 6 }}>
                    {pwLoading && (
                      <div style={{ width: `${(pwElapsed % 100) + 10}%`, height: '100%', background: '#1976d2', transition: 'width 0.5s', animation: 'progressBar 2s linear infinite' }} />
                    )}
                  </div>
                  {/* 상태 메시지 */}
                  <div style={{ fontSize: 15, color: pwLoading ? '#1976d2' : pwResult ? '#28a745' : '#888', fontWeight: 600 }}>
                    {pwLoading
                      ? `실행중... (경과 ${pwElapsed}s)`
                      : pwResult
                        ? '완료'
                        : '대기중'}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
} 