// 데이터 관리자
import { utils } from './ui-utils.js';
import { eventEmitter } from './ui-event.js';

export const dataManager = {
    init() {
        try {
            this.loadInitialData();
        } catch (error) {
            console.error('데이터 초기화 오류:', error);
        }
    },

    loadInitialData() {
        try {
            const lastState = utils.getFromLocalStorage('lastState');
            if (lastState) {
                Object.entries(lastState).forEach(([key, value]) => {
                    utils.saveToLocalStorage(key === 'hotel' ? 'hotelData' : key, value);
                });
            }
        } catch (error) {
            console.error('초기 데이터 로드 오류:', error);
        }
    },

    getData() {
        try {
            return {
                hotel: utils.getFromLocalStorage('hotelData') || {},
                rooms: utils.getFromLocalStorage('rooms') || [],
                packages: utils.getFromLocalStorage('packages') || [],
                prices: utils.getFromLocalStorage('prices') || []
            };
        } catch (error) {
            console.error('데이터 조회 오류:', error);
            return {};
        }
    },

    async saveData(data) {
        try {
            if (!this.validateData(data)) {
                utils.showAlert('호텔 이름을 입력해주세요', 'warning');
                return false;
            }

            await Promise.all(Object.entries(data).map(([key, value]) => {
                return utils.saveToLocalStorage(key === 'hotel' ? 'hotelData' : key, value);
            }));

            eventEmitter.emit('dataChanged', data);
            return true;
        } catch (error) {
            console.error('데이터 저장 오류:', error);
            utils.showAlert('데이터 저장 중 오류가 발생했습니다', 'danger');
            return false;
        }
    },

    validateData(data) {
        try {
            if (!data?.hotel?.name) {
                return false;
            }

            // 이미지 URL 검증
            const imageFields = ['imageUrl', 'roomImageUrl', 'imageURL'];
            if (data.hotel.images) {
                data.hotel.images = data.hotel.images.filter(url => url && url.trim());
            }
            if (data.rooms) {
                data.rooms = data.rooms.map(room => {
                    const imageUrl = imageFields.map(field => room[field]).find(url => url);
                    return { ...room, imageUrl };
                });
            }

            return true;
        } catch (error) {
            console.error('데이터 검증 오류:', error);
            return false;
        }
    }
};

// 데이터 처리 유틸리티
const dataUtils = {
    // JSON 데이터 파싱 (안전하게)
    parseJSON(data) {
        try {
            if (!data) return null;
            return typeof data === 'string' ? JSON.parse(data) : data;
        } catch (error) {
            console.error('JSON 파싱 오류:', error);
            return null;
        }
    },

    // form 데이터 객체로 변환
    formToObject(form) {
        try {
            if (!form || !(form instanceof HTMLFormElement)) return {};
            
            const formData = new FormData(form);
            const obj = {};
            
            for (const [key, value] of formData.entries()) {
                obj[key] = value;
            }
            
            return obj;
        } catch (error) {
            console.error('Form 변환 오류:', error);
            return {};
        }
    },

    // 객체를 URL 쿼리 문자열로 변환
    objectToQueryString(obj) {
        try {
            if (!obj || typeof obj !== 'object') return '';
            
            return Object.keys(obj)
                .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(obj[key] || '')}`)
                .join('&');
        } catch (error) {
            console.error('쿼리 문자열 생성 오류:', error);
            return '';
        }
    },

    // URL 쿼리 문자열에서 특정 파라미터 값 추출
    getQueryParam(name, url) {
        try {
            if (!name) return null;
            
            const currentUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
            if (!currentUrl) return null;
            
            name = name.replace(/[[\]]/g, '\\$&');
            const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`);
            const results = regex.exec(currentUrl);
            
            if (!results) return null;
            if (!results[2]) return '';
            
            return decodeURIComponent(results[2].replace(/\+/g, ' '));
        } catch (error) {
            console.error('쿼리 파라미터 추출 오류:', error);
            return null;
        }
    }
};

// 글로벌 객체 등록 (브라우저 환경인 경우)
if (typeof window !== 'undefined') {
    window.UIData = dataUtils;
}

// ES 모듈로 내보내기
export { dataUtils };
