// 이벤트 관리자
// Event handling functions
window.UIEvent = {
    events: {},
    
    on(event, callback) {
        try {
            if (!this.events[event]) {
                this.events[event] = [];
            }
            this.events[event].push(callback);
        } catch (error) {
            console.error('이벤트 등록 오류:', error);
        }
    },

    emit(event, data) {
        try {
            const callbacks = this.events[event];
            if (!callbacks) return;

            callbacks.forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`이벤트 ${event} 실행 오류:`, error);
                }
            });
        } catch (error) {
            console.error('이벤트 발생 오류:', error);
        }
    }
};
