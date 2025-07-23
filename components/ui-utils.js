// Common utility functions
const utils = {
    saveToLocalStorage(key, data) {
        try {
            if (typeof window === 'undefined' || !key) return;
            localStorage.setItem(key, JSON.stringify(data));
        } catch (error) {
            console.error('로컬 스토리지 저장 오류:', error);
        }
    },

    getFromLocalStorage(key) {
        try {
            if (typeof window === 'undefined' || !key) return null;
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('로컬 스토리지 조회 오류:', error);
            return null;
        }
    },

    showAlert(message, type = 'info') {
        try {
            if (typeof window === 'undefined' || !message) return;
            const alertContainer = document.getElementById('alertContainer') || this.createAlertContainer();
            if (!alertContainer) return;
            
            const alert = document.createElement('div');
            alert.className = `alert alert-${type} alert-dismissible fade show`;
            alert.innerHTML = `
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            `;
            alertContainer.appendChild(alert);
            setTimeout(() => alert.remove(), 3000);
        } catch (error) {
            console.error('알림 표시 오류:', error);
        }
    },

    createAlertContainer() {
        try {
            if (typeof window === 'undefined' || !document || !document.body) return null;
            
            let container = document.getElementById('alertContainer');
            if (!container) {
                container = document.createElement('div');
                container.id = 'alertContainer';
                container.className = 'alert-container position-fixed top-0 end-0 p-3';
                container.style.zIndex = '1050';
                document.body.appendChild(container);
            }
            return container;
        } catch (error) {
            console.error('알림 컨테이너 생성 오류:', error);
            return null;
        }
    },

    escapeHtml(str) {
        try {
            if (!str || typeof str !== 'string') return '';
            return str
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#039;');
        } catch (error) {
            console.error('HTML 이스케이프 오류:', error);
            return '';
        }
    }
};

// 브라우저 환경인 경우 window 객체에 등록
if (typeof window !== 'undefined') {
    window.UIUtils = utils;
}

// ES 모듈로 내보내기
export { utils };
