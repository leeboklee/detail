// 초기화 관리자
// import { UI } from './ui.js';
import { utils } from './ui-utils.js';

export const initManager = {
    isInitialized: false,

    init() {
        try {
            if (this.isInitialized) {
                console.warn('이미 초기화되어 있습니다');
                return;
            }

            // SSR/SSG 환경인 경우 window 객체가 없을 수 있음
            if (typeof window === 'undefined') {
                console.log('브라우저 환경이 아니므로 초기화를 건너뜁니다');
                return;
            }

            // DOM 로드 완료 시 실행
            if (document.readyState === 'complete' || document.readyState === 'interactive') {
                // 이미 DOM이 로드되었으면 즉시 초기화
                this.initializeUI();
            } else {
                // DOM이 아직 로드되지 않았으면 이벤트 리스너 등록
                window.addEventListener('DOMContentLoaded', () => {
                    this.initializeUI();
                });
            }

            // 에러 핸들링
            window.addEventListener('error', (e) => {
                console.error('전역 에러:', e.error);
                utils.showAlert('오류가 발생했습니다', 'danger');
            });

            // 언로드 이벤트
            window.addEventListener('beforeunload', () => {
                this.saveCurrentState();
            });
        } catch (error) {
            console.error('초기화 관리자 오류:', error);
        }
    },

    // UI 초기화 로직을 별도 메서드로 분리
    initializeUI() {
        try {
            // UI.init();
            this.isInitialized = true;
            console.log('UI 초기화 완료');
        } catch (error) {
            console.error('UI 초기화 중 오류:', error);
        }
    },

    // 현재 상태 저장 로직을 별도 메서드로 분리
    saveCurrentState() {
        try {
            // UI 객체가 존재하는지 확인
            /* if (!UI) {
                console.warn('UI 객체가 없어 상태를 저장할 수 없습니다');
                return;
            }

            const currentState = {
                hotel: UI.hotelManager && typeof UI.hotelManager.getData === 'function' 
                    ? UI.hotelManager.getData() : null,
                rooms: UI.roomManager && typeof UI.roomManager.getData === 'function'
                    ? UI.roomManager.getData() : null,
                packages: UI.packageManager && typeof UI.packageManager.getData === 'function'
                    ? UI.packageManager.getData() : null,
                prices: UI.priceManager && typeof UI.priceManager.getData === 'function'
                    ? UI.priceManager.getData() : null
            };
            
            utils.saveToLocalStorage('lastState', currentState); */
        } catch (error) {
            console.error('상태 저장 오류:', error);
        }
    }
};
