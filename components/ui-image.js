/**
 * 이미지 업로드 관리자 모듈
 * 파일 업로드 및 이미지 처리 담당
 */

const ImageUploader = {
    // 초기화 함수
    init() {
        console.log('이미지 업로드 관리자 초기화');
        this.setupFileInput();
        this.bindEvents();
    },

    // 파일 입력 필드 설정
    setupFileInput() {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*';
        fileInput.style.display = 'none';
        document.body.appendChild(fileInput);
        this.fileInput = fileInput;
    },

    // 이벤트 바인딩
    bindEvents() {
        const uploadBtn = document.getElementById('uploadImageBtn');
        if (uploadBtn) {
            uploadBtn.addEventListener('click', () => this.fileInput.click());
        }

        this.fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
    },

    // 파일 선택 처리
    async handleFileSelect(event) {
        const file = event.target.files[0];
        if (!file) return;

        // 파일 유효성 검사
        if (!this.validateFile(file)) {
            alert('유효하지 않은 이미지 파일입니다.');
            return;
        }

        // 이미지 업로드 및 미리보기 업데이트
        try {
            const imageUrl = await this.uploadImage(file);
            this.updatePreview(imageUrl);
        } catch (error) {
            console.error('이미지 업로드 오류:', error);
            alert('이미지 업로드에 실패했습니다.');
        }
    },

    // 파일 유효성 검사
    validateFile(file) {
        const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
        const maxSize = 5 * 1024 * 1024; // 5MB

        return validTypes.includes(file.type) && file.size <= maxSize;
    },

    // 이미지 업로드
    async uploadImage(file) {
        const formData = new FormData();
        formData.append('image', file);

        const response = await fetch('/upload', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error('이미지 업로드 실패');
        }

        const data = await response.json();
        return data.imageUrl;
    },

    // 미리보기 업데이트
    updatePreview(imageUrl) {
        const previewManager = window.previewManager;
        if (previewManager) {
            previewManager.updatePreview({ imageUrl });
        }
    }
};

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', () => ImageUploader.init());

export default ImageUploader;
