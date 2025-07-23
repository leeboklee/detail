// 컨테이너 관리자
import { utils } from './ui-utils.js';

export const containerManager = {
    init() {
        try {
            this.setupContainers();
        } catch (error) {
            console.error('컨테이너 초기화 오류:', error);
        }
    },

    setupContainers() {
        try {
            const mainContainer = this.createMainContainer();
            if (!mainContainer) return;

            utils.createAlertContainer();

            ['hotel-info-container', 'room-info-container', 'package-info-container', 'price-info-container', 'preview-container']
                .forEach(className => {
                    let container = document.querySelector(`.${className}`);
                    if (!container) {
                        container = document.createElement('div');
                        container.className = className;
                        mainContainer.appendChild(container);
                    }
                });
        } catch (error) {
            console.error('컨테이너 설정 오류:', error);
        }
    },

    createMainContainer() {
        try {
            let container = document.querySelector('.main-container');
            if (!container) {
                container = document.createElement('div');
                container.className = 'main-container container py-4';
                document.body.appendChild(container);
            }
            return container;
        } catch (error) {
            console.error('메인 컨테이너 생성 오류:', error);
            return null;
        }
    }
};
