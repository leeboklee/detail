'use client';

/**
 * 전역 자동 저장 관리자
 * 모든 섹션의 자동 저장을 통합 관리
 */
class AutoSaveManager {
  constructor() {
    this.settings = {
      autoSave: true,
      autoTemplate: true,
      autoPreview: true,
      previewDelay: 500,
      debugMode: false
    };
    
    this.saveQueue = new Map();
    this.templateBackupInterval = null;
    
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      this.loadSettings();
      this.initializeEventListeners();
      this.startTemplateBackup();
    }
  }

  // 설정 로드
  loadSettings() {
    if (typeof localStorage === 'undefined') return;
    try {
      const saved = localStorage.getItem('autoSaveSettings');
      if (saved) {
        this.settings = { ...this.settings, ...JSON.parse(saved) };
      }
    } catch (error) {
      console.error('자동 저장 설정 로드 실패:', error);
    }
  }

  // 설정 저장
  saveSettings(newSettings) {
    if (typeof localStorage === 'undefined') return false;
    try {
      this.settings = { ...this.settings, ...newSettings };
      localStorage.setItem('autoSaveSettings', JSON.stringify(this.settings));
      
      // 템플릿 백업 재시작
      this.startTemplateBackup();
      
      console.log('✅ 자동 저장 설정 업데이트됨:', this.settings);
      return true;
    } catch (error) {
      console.error('자동 저장 설정 저장 실패:', error);
      return false;
    }
  }

  // 이벤트 리스너 초기화
  initializeEventListeners() {
    if (typeof window === 'undefined') return;
    // 자동 저장 완료 이벤트 리스너
    window.addEventListener('autoSaveCompleted', (event) => {
      if (this.settings.debugMode) {
        console.log('🔄 자동 저장 완료:', event.detail);
      }
      
      // UI 알림 표시
      this.showSaveNotification(event.detail.storageKey);
    });

    // 페이지 언로드 시 마지막 저장
    window.addEventListener('beforeunload', () => {
      this.saveAllPendingData();
    });
  }

  // 저장 알림 표시
  showSaveNotification(storageKey) {
    if (typeof document === 'undefined') return;
    const notification = document.createElement('div');
    notification.className = 'auto-save-notification';
    notification.innerHTML = `
      <div style="
        position: fixed;
        top: 20px;
        right: 20px;
        background: #10b981;
        color: white;
        padding: 8px 16px;
        border-radius: 6px;
        font-size: 14px;
        z-index: 10000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        animation: slideIn 0.3s ease-out;
      ">
        ✅ ${this.getStorageKeyLabel(storageKey)} 자동 저장됨
      </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 3000);
  }

  // 스토리지 키 라벨 변환
  getStorageKeyLabel(storageKey) {
    const labels = {
      'hotelInfo_autoSave': '호텔 정보',
      'rooms_autoSave': '객실 정보',
      'packages_autoSave': '패키지 정보',
      'facilities_autoSave': '부대시설',
      'pricing_autoSave': '요금 정보',
      'cancel_autoSave': '취소 정책',
      'notices_autoSave': '공지사항'
    };
    
    return labels[storageKey] || '데이터';
  }

  // 템플릿 자동 백업 시작
  startTemplateBackup() {
    // 기존 인터벌 클리어
    if (this.templateBackupInterval) {
      clearInterval(this.templateBackupInterval);
    }

    if (!this.settings.autoTemplate) return;

    if (typeof window === 'undefined') return;
    // 5분마다 자동 백업
    this.templateBackupInterval = setInterval(() => {
      this.createAutoBackup();
    }, 5 * 60 * 1000);
  }

  // 자동 백업 생성
  createAutoBackup() {
    if (typeof localStorage === 'undefined') return;
    try {
      const hotelData = JSON.parse(localStorage.getItem('hotelData') || '{}');
      
      if (Object.keys(hotelData).length === 0) return;

      const backupData = {
        ...hotelData,
        isAutoBackup: true,
        backupTime: new Date().toISOString()
      };

      const backupKey = `autoBackup_${Date.now()}`;
      localStorage.setItem(backupKey, JSON.stringify(backupData));

      // 오래된 백업 정리 (최근 10개만 유지)
      this.cleanupOldBackups();

      if (this.settings.debugMode) {
        console.log('🔄 자동 백업 생성:', backupKey);
      }
    } catch (error) {
      console.error('자동 백업 생성 실패:', error);
    }
  }

  // 오래된 백업 정리
  cleanupOldBackups() {
    if (typeof localStorage === 'undefined') return;
    try {
      const backupKeys = Object.keys(localStorage)
        .filter(key => key.startsWith('autoBackup_'))
        .sort()
        .reverse();

      // 10개 이상이면 오래된 것 삭제
      if (backupKeys.length > 10) {
        backupKeys.slice(10).forEach(key => {
          localStorage.removeItem(key);
        });
      }
    } catch (error) {
      console.error('백업 정리 실패:', error);
    }
  }

  // 모든 대기 중인 데이터 저장
  saveAllPendingData() {
    if (typeof window === 'undefined') return;
    // 현재 작업 중인 모든 데이터를 즉시 저장
    window.dispatchEvent(new CustomEvent('forceSaveAll'));
  }

  // 설정 가져오기
  getSettings() {
    return { ...this.settings };
  }

  // 디버그 모드 토글
  toggleDebugMode() {
    this.settings.debugMode = !this.settings.debugMode;
    this.saveSettings(this.settings);
  }
}

// 전역 인스턴스 생성
let autoSaveManager = null;
if (typeof window !== 'undefined') {
  autoSaveManager = new AutoSaveManager();
  if (typeof document !== 'undefined') {
    const style = document.createElement('style');
    style.textContent = `
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
    `;
    document.head.appendChild(style);
  }
}
export default autoSaveManager; 