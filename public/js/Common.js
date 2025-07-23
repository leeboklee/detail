/**
 * 호텔 상세 페이지 생성기 - 공통 UI 모듈
 * 공통 기능 및 유틸리티 함수
 */

/**
 * 공통 UI 모듈
 * 
 * 의존성:
 * - previewManager: 미리보기 기능 제공
 * - HotelApp: 데이터 저장 및 관리
 */
window.UICommon = (function() {
    // 상태 관리
    let initialized = false;
    let dataLoaded = false;
    
    /**
     * 모듈 초기화
     */
    const init = async function() {
        if (initialized) {
            console.log('[UICommon] 이미 초기화됨');
            return;
        }
        
        console.log('[UICommon] 공통 UI 모듈 초기화');
        
        try {
            // 의존성 체크
            if (!checkDependencies()) {
                throw new Error('필수 의존성이 없습니다.');
            }
            
            // 데이터 먼저 로드
            await loadData();
            dataLoaded = true;
            
            // UI 초기화
            initializeUI();
            
            // 서버 상태 확인 타이머 설정
            setupServerStatusCheck();
            
            // 공통 이벤트 리스너 등록
            bindCommonEvents();
            
            initialized = true;
            console.log('[UICommon] 공통 UI 모듈 초기화 완료');
        } catch (error) {
            console.error('[UICommon] 초기화 중 오류:', error);
            showToast('초기화 중 오류가 발생했습니다: ' + error.message);
        }
    };
    
    /**
     * UI 초기화
     */
    const initializeUI = function() {
        try {
            console.log('[UICommon] UI 초기화 시작');
            
            // 폼 요소들 초기화 방식 변경
            const forms = document.querySelectorAll('form');
            forms.forEach(form => {
                // 폼 표시 (숨기지 않음)
                form.style.display = 'block';
                form.style.visibility = 'visible';
            });
            
            // 각 탭 내용 초기화
            initializeTabs();
            
            console.log('[UICommon] UI 초기화 완료');
        } catch (error) {
            console.error('[UICommon] UI 초기화 중 오류:', error);
        }
    };
    
    /**
     * 탭 초기화
     */
    const initializeTabs = function() {
        try {
            console.log('[UICommon] 탭 초기화 시작');
            
            // 탭 활성화 설정
            const firstTab = document.querySelector('.nav-tabs .nav-link');
            if (firstTab) {
                // 첫 번째 탭을 활성화
                const tabId = firstTab.getAttribute('data-bs-target');
                const tabContent = document.querySelector(tabId);
                
                if (tabContent) {
                    // 모든 탭 컨텐츠 비활성화
                    document.querySelectorAll('.tab-pane').forEach(pane => {
                        pane.classList.remove('show', 'active');
                    });
                    
                    // 모든 탭 버튼 비활성화
                    document.querySelectorAll('.nav-tabs .nav-link').forEach(tab => {
                        tab.classList.remove('active');
                    });
                    
                    // 첫 번째 탭 활성화
                    firstTab.classList.add('active');
                    tabContent.classList.add('show', 'active');
                }
            }
            
            // 데이터를 화면 요소에 반영
            updateUIFromData();
            
            console.log('[UICommon] 탭 초기화 완료');
        } catch (error) {
            console.error('[UICommon] 탭 초기화 중 오류:', error);
        }
    };
    
    /**
     * 데이터를 UI 요소에 반영
     */
    const updateUIFromData = function() {
        try {
            console.log('[UICommon] 데이터를 UI에 반영 시작');
            
            // HotelApp에서 데이터 가져오기
            if (!window.HotelApp || !window.HotelApp.state) {
                console.warn('[UICommon] HotelApp 데이터가 없습니다.');
                return;
            }
            
            const state = window.HotelApp.state;
            
            // 호텔 정보 반영
            if (state.hotelInfo) {
                const hotelInfo = state.hotelInfo;
                const hotelNameInput = document.getElementById('hotelName');
                const hotelLocationInput = document.getElementById('hotelLocation');
                const hotelDescriptionInput = document.getElementById('hotelDescription');
                const hotelImageInput = document.getElementById('hotelImage');
                
                if (hotelNameInput) hotelNameInput.value = hotelInfo.name || '';
                if (hotelLocationInput) hotelLocationInput.value = hotelInfo.location || '';
                if (hotelDescriptionInput) hotelDescriptionInput.value = hotelInfo.description || '';
                if (hotelImageInput) hotelImageInput.value = hotelInfo.image || '';
                
                // 이미지 미리보기 업데이트
                if (hotelInfo.image) {
                    const imgPreviewContainer = hotelImageInput?.parentElement?.querySelector('.img-preview');
                    if (!imgPreviewContainer) {
                        const newPreview = document.createElement('div');
                        newPreview.className = 'img-preview mt-2';
                        newPreview.innerHTML = `<img src="${hotelInfo.image}" class="img-fluid" alt="이미지 미리보기">`;
                        hotelImageInput?.parentElement?.appendChild(newPreview);
                    } else {
                        const img = imgPreviewContainer.querySelector('img');
                        if (img) img.src = hotelInfo.image;
                    }
                }
            }
            
            // 객실 정보 반영
            if (Array.isArray(state.roomInfo) && state.roomInfo.length > 0) {
                if (window.UIRoom && typeof window.UIRoom.renderRooms === 'function') {
                    window.UIRoom.renderRooms(state.roomInfo);
                } else {
                    console.warn('[UICommon] UIRoom.renderRooms 함수가 없습니다.');
                }
            }
            
            // 패키지 정보 반영
            if (Array.isArray(state.packageInfo) && state.packageInfo.length > 0) {
                if (window.UIPackage && typeof window.UIPackage.renderPackages === 'function') {
                    window.UIPackage.renderPackages(state.packageInfo);
                } else {
                    console.warn('[UICommon] UIPackage.renderPackages 함수가 없습니다.');
                }
            }
            
            // 공지사항 반영
            if (state.notice) {
                const noticeTitle = document.getElementById('noticeTitle');
                const noticeContent = document.getElementById('noticeContent');
                const noticeImage = document.getElementById('noticeImage');
                
                if (noticeTitle) noticeTitle.value = state.notice.title || '';
                if (noticeContent) noticeContent.value = state.notice.content || '';
                if (noticeImage) noticeImage.value = state.notice.image || '';
                
                // 이미지 미리보기 업데이트
                if (state.notice.image) {
                    const imgPreviewContainer = noticeImage?.parentElement?.querySelector('.img-preview');
                    if (!imgPreviewContainer) {
                        const newPreview = document.createElement('div');
                        newPreview.className = 'img-preview mt-2';
                        newPreview.innerHTML = `<img src="${state.notice.image}" class="img-fluid" alt="이미지 미리보기">`;
                        noticeImage?.parentElement?.appendChild(newPreview);
                    } else {
                        const img = imgPreviewContainer.querySelector('img');
                        if (img) img.src = state.notice.image;
                    }
                }
            }
            
            console.log('[UICommon] 데이터를 UI에 반영 완료');
        } catch (error) {
            console.error('[UICommon] 데이터를 UI에 반영 중 오류:', error);
        }
    };
    
    /**
     * 의존성 확인
     */
    const checkDependencies = function() {
        if (!window.HotelApp) {
            console.error('[UICommon] HotelApp 의존성이 없습니다.');
            return false;
        }
        
        if (!window.previewManager) {
            console.error('[UICommon] previewManager 의존성이 없습니다.');
            return false;
        }
        
        return true;
    };
    
    /**
     * 서버 상태 확인 타이머 설정
     */
    const setupServerStatusCheck = function() {
        try {
            // 기존 타이머가 있으면 제거
            if (window.serverStatusTimerId) {
                clearInterval(window.serverStatusTimerId);
            }
            
            // 서버 상태 확인 함수
            const checkServerStatus = async function() {
                try {
                    const response = await fetch('/api/server/status', {
                        method: 'GET',
                        headers: {
                            'Cache-Control': 'no-cache',
                            'Pragma': 'no-cache'
                        }
                    });
                    
                    if (response.ok) {
                        const data = await response.json();
                        updateServerStatusUI(data);
                    } else {
                        console.error('[UICommon] 서버 상태 확인 오류:', response.status);
                        showServerStatusError();
                    }
                } catch (error) {
                    console.error('[UICommon] 서버 상태 확인 요청 실패:', error);
                    showServerStatusError();
                }
            };
            
            // 즉시 한 번 실행
            checkServerStatus();
            
            // 서버 상태 확인 타이머 제거 - 리소스 절약
            // window.serverStatusTimerId = setInterval(checkServerStatus, 60000);
            console.log('[UICommon] 서버 상태 확인 타이머 설정 완료');
        } catch (error) {
            console.error('[UICommon] 서버 상태 확인 타이머 설정 실패:', error);
        }
    };
    
    /**
     * 서버 상태 UI 업데이트
     */
    const updateServerStatusUI = function(data) {
        // 서버 상태에 따른 UI 업데이트 로직
        const serverStatusIndicator = document.getElementById('serverStatusIndicator');
        if (serverStatusIndicator) {
            if (data.success && data.status === 'running') {
                serverStatusIndicator.className = 'server-status server-status-online';
                serverStatusIndicator.setAttribute('title', '서버 온라인');
            } else {
                serverStatusIndicator.className = 'server-status server-status-offline';
                serverStatusIndicator.setAttribute('title', '서버 오프라인');
            }
        }
    };
    
    /**
     * 서버 상태 오류 표시
     */
    const showServerStatusError = function() {
        const serverStatusIndicator = document.getElementById('serverStatusIndicator');
        if (serverStatusIndicator) {
            serverStatusIndicator.className = 'server-status server-status-error';
            serverStatusIndicator.setAttribute('title', '서버 연결 오류');
        }
    };
    
    /**
     * 공통 이벤트 리스너 등록
     */
    const bindCommonEvents = function() {
        try {
            console.log('[UICommon] 공통 이벤트 바인딩 시작');
            
            // 탭 전환 이벤트
            const navLinks = document.querySelectorAll('.nav-link[data-bs-toggle="tab"]');
            navLinks.forEach(link => {
                link.addEventListener('click', function(e) {
                    const tabId = this.getAttribute('data-bs-target');
                    console.log(`[UICommon] 탭 변경: ${tabId}`);
                    
                    // 특정 탭으로 전환했을 때 추가 작업
                    setTimeout(() => {
                        if (tabId === '#hotel-tab-pane' && window.UIHotel?.refreshUI) {
                            window.UIHotel.refreshUI();
                        } else if (tabId === '#room-tab-pane' && window.UIRoom?.refreshUI) {
                            window.UIRoom.refreshUI();
                        } else if (tabId === '#package-tab-pane' && window.UIPackage?.refreshUI) {
                            window.UIPackage.refreshUI();
                        } else if (tabId === '#notice-tab-pane') {
                            // 공지사항 탭 선택 시 필요한 작업
                            const noticeTitle = document.getElementById('noticeTitle');
                            const noticeContent = document.getElementById('noticeContent');
                            
                            if (window.HotelApp?.state?.notice) {
                                const notice = window.HotelApp.state.notice;
                                if (noticeTitle) noticeTitle.value = notice.title || '';
                                if (noticeContent) noticeContent.value = notice.content || '';
                            }
                        } else if (tabId === '#price-tab-pane' && window.UIPrice?.refreshUI) {
                            window.UIPrice.refreshUI();
                        } else if (tabId === '#cancel-tab-pane' && window.UICancel?.refreshUI) {
                            window.UICancel.refreshUI();
                        }
                    }, 100);
                });
            });

            // 호텔 데이터 적용 버튼
            const applyHotelBtn = document.getElementById('applyHotelBtn');
            if (applyHotelBtn) {
                applyHotelBtn.addEventListener('click', function() {
                    // 호텔 데이터 저장 호출
                    if (window.UIHotel && window.UIHotel.saveData) {
                        window.UIHotel.saveData();
                    } else {
                        // 호텔 모듈이 없는 경우 직접 처리
                        const hotelName = document.getElementById('hotelName')?.value;
                        const hotelLocation = document.getElementById('hotelLocation')?.value;
                        const hotelDescription = document.getElementById('hotelDescription')?.value;
                        const hotelImage = document.getElementById('hotelImage')?.value;
                        
                        if (hotelName || hotelLocation || hotelDescription || hotelImage) {
                            window.HotelApp.state.hotelInfo = {
                                name: hotelName,
                                location: hotelLocation,
                                description: hotelDescription,
                                image: hotelImage
                            };
                            
                            // 서버에 저장 요청
                            fetch('/api/hotel', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify(window.HotelApp.state.hotelInfo)
                            })
                            .then(response => response.json())
                            .then(data => {
                                console.log('[UICommon] 호텔 데이터 저장 성공:', data);
                            })
                            .catch(error => {
                                console.error('[UICommon] 호텔 데이터 저장 실패:', error);
                            });
                        }
                    }
                    
                    window.previewManager.updatePreview(true);
                    showToast('호텔 정보가 반영되었습니다.');
                });
            }
            
            // 객실 적용 버튼
            const applyRoomBtn = document.getElementById('applyRoomBtn');
            if (applyRoomBtn) {
                applyRoomBtn.addEventListener('click', function() {
                    // 객실 데이터 저장 호출
                    if (window.UIRoom && window.UIRoom.saveData) {
                        window.UIRoom.saveData();
                    }
                    
                    window.previewManager.updatePreview(true);
                    showToast('객실 정보가 반영되었습니다.');
                });
            }
            
            // 패키지 적용 버튼
            const applyPackageBtn = document.getElementById('applyPackageBtn');
            if (applyPackageBtn) {
                applyPackageBtn.addEventListener('click', function() {
                    // 패키지 데이터 저장 호출
                    if (window.UIPackage && window.UIPackage.saveData) {
                        window.UIPackage.saveData();
                    }
                    
                    window.previewManager.updatePreview(true);
                    showToast('패키지 정보가 반영되었습니다.');
                });
            }
            
            // 공지사항 적용 버튼
            const applyNoticeBtn = document.getElementById('applyNoticeBtn');
            if (applyNoticeBtn) {
                applyNoticeBtn.addEventListener('click', function() {
                    // 공지사항 데이터 저장 호출
                    if (window.UINotice && window.UINotice.saveData) {
                        window.UINotice.saveData();
                    } else {
                        // 공지사항 모듈이 없는 경우 직접 처리
                        const noticeTitle = document.getElementById('noticeTitle')?.value;
                        const noticeContent = document.getElementById('noticeContent')?.value;
                        
                        if (noticeTitle || noticeContent) {
                            window.HotelApp.state.notice = {
                                title: noticeTitle,
                                content: noticeContent,
                                isEnabled: true
                            };
                            
                            // 서버에 저장 요청
                            fetch('/api/notice', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify(window.HotelApp.state.notice)
                            })
                            .then(response => response.json())
                            .then(data => {
                                console.log('[UICommon] 공지사항 데이터 저장 성공:', data);
                            })
                            .catch(error => {
                                console.error('[UICommon] 공지사항 데이터 저장 실패:', error);
                            });
                        }
                    }
                    
                    window.previewManager.updatePreview(true);
                    showToast('공지사항이 반영되었습니다.');
                });
            }
            
            // 가격표 반영하기 버튼 이벤트
            const applyPriceBtn = document.getElementById('applyPriceBtn');
            if (applyPriceBtn) {
                applyPriceBtn.addEventListener('click', function() {
                    if (window.UIPrice && window.UIPrice.applyPriceTable) {
                        window.UIPrice.applyPriceTable();
                        window.previewManager.updatePreview(true);
                        showToast('가격표가 반영되었습니다.');
                    }
                });
            }
            
            // 취소 규정 반영하기 버튼 이벤트
            const applyCancelBtn = document.getElementById('applyCancelBtn');
            if (applyCancelBtn) {
                applyCancelBtn.addEventListener('click', function() {
                    if (window.UICancel && window.UICancel.applyCancelPolicy) {
                        window.UICancel.applyCancelPolicy();
                        window.previewManager.updatePreview(true);
                        showToast('취소 규정이 반영되었습니다.');
                    }
                });
            }
            
            // URL 적용 버튼 이벤트 등록
            document.querySelectorAll('.apply-url-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    // 부모 컨테이너 찾기
                    const container = this.closest('.url-input-container');
                    if (!container) {
                        console.warn('[UICommon] URL 입력 컨테이너를 찾을 수 없습니다.');
                        return;
                    }
                    
                    // URL 입력 필드 찾기
                    const urlInput = container.querySelector('input[type="text"]');
                    if (!urlInput) {
                        console.warn('[UICommon] URL 입력 필드를 찾을 수 없습니다.');
                        return;
                    }
                    
                    // URL 값 가져오기
                    const url = urlInput.value.trim();
                    if (!url) {
                        showToast('URL을 입력해주세요.', 'warning');
                        return;
                    }
                    
                    // 이미지 미리보기 영역 찾거나 생성
                    let previewContainer = container.querySelector('.img-preview');
                    if (!previewContainer) {
                        previewContainer = document.createElement('div');
                        previewContainer.className = 'img-preview mt-2';
                        container.appendChild(previewContainer);
                    }
                    
                    // 이미지 미리보기 업데이트
                    previewContainer.innerHTML = `
                        <img src="${url}" class="img-fluid border rounded" alt="이미지 미리보기" 
                             onerror="this.onerror=null; this.src='/static/images/error.png'; UICommon.showToast('이미지 로드 실패', 'error');">
                    `;
                    
                    showToast('URL이 적용되었습니다.');
                });
            });
            
            // 이미지 URL 입력 필드에 적용 버튼 추가
            document.querySelectorAll('input[type="text"][placeholder*="URL"], input[type="text"][placeholder*="url"]').forEach(input => {
                // 입력 필드가 이미 버튼이 있는 컨테이너 안에 있는지 확인
                if (input.closest('.url-input-container')) {
                    return;
                }
                
                // 입력 필드의 부모 요소가 input-group인지 확인
                const parentElement = input.parentElement;
                if (!parentElement || !parentElement.classList.contains('input-group')) {
                    return;
                }
                
                // 적용 버튼 생성
                const applyBtn = document.createElement('button');
                applyBtn.type = 'button';
                applyBtn.className = 'btn btn-primary apply-url-btn';
                applyBtn.innerHTML = '<i class="fas fa-check"></i> 적용';
                applyBtn.addEventListener('click', function() {
                    // URL 값 가져오기
                    const url = input.value.trim();
                    if (!url) {
                        showToast('URL을 입력해주세요.', 'warning');
                        return;
                    }
                    
                    // 이미지 미리보기 영역 찾거나 생성
                    const container = parentElement.parentElement;
                    let previewContainer = container.querySelector('.img-preview');
                    if (!previewContainer) {
                        previewContainer = document.createElement('div');
                        previewContainer.className = 'img-preview mt-2';
                        container.appendChild(previewContainer);
                    }
                    
                    // 이미지 미리보기 업데이트
                    previewContainer.innerHTML = `
                        <img src="${url}" class="img-fluid border rounded" alt="이미지 미리보기" 
                             onerror="this.onerror=null; this.src='/static/images/error.png'; UICommon.showToast('이미지 로드 실패', 'error');">
                    `;
                    
                    showToast('URL이 적용되었습니다.');
                });
                
                // 적용 버튼 추가
                parentElement.appendChild(applyBtn);
            });
            
            console.log('[UICommon] 공통 이벤트 바인딩 완료');
        } catch (error) {
            console.error('[UICommon] 이벤트 바인딩 중 오류:', error);
        }
    };
    
    /**
     * 추가 버튼 이벤트 바인딩
     */
    const bindAddButtons = function() {
        // 객실 추가
        const addRoomBtn = document.querySelector('[data-action="addRoom"]');
        if (addRoomBtn) {
            addRoomBtn.addEventListener('click', function() {
                if (window.UIRoom?.addRoom) {
                    window.UIRoom.addRoom();
                }
            });
        }

        // 패키지 추가
        const addPackageBtn = document.querySelector('[data-action="addPackage"]');
        if (addPackageBtn) {
            addPackageBtn.addEventListener('click', function() {
                if (window.UIPackage?.addPackage) {
                    window.UIPackage.addPackage();
                }
            });
        }

        // 가격 행 추가
        const addPriceBtn = document.querySelector('[data-action="addPriceRow"]');
        if (addPriceBtn) {
            addPriceBtn.addEventListener('click', function() {
                if (window.UIPrice?.addPriceRow) {
                    window.UIPrice.addPriceRow();
                }
            });
        }

        // 취소 규정 추가
        const addCancelBtn = document.querySelector('[data-action="addCancelRule"]');
        if (addCancelBtn) {
            addCancelBtn.addEventListener('click', function() {
                if (window.UICancel?.addCancelRule) {
                    window.UICancel.addCancelRule();
                }
            });
        }

        // 공지사항 추가
        const addNoticeBtn = document.querySelector('[data-action="addNotice"]');
        if (addNoticeBtn) {
            addNoticeBtn.addEventListener('click', function() {
                if (window.UINotice?.addNotice) {
                    window.UINotice.addNotice();
                }
            });
        }
    };

    /**
     * 저장 버튼 이벤트 바인딩
     */
    const bindSaveButtons = function() {
        // 전체 저장
        const saveAllBtn = document.querySelector('[data-action="saveAll"]');
        if (saveAllBtn) {
            saveAllBtn.addEventListener('click', function() {
                saveAllData();
            });
        }

        // 미리보기 새로고침
        const refreshPreviewBtn = document.querySelector('[data-action="refreshPreview"]');
        if (refreshPreviewBtn) {
            refreshPreviewBtn.addEventListener('click', function() {
                if (window.previewManager?.updatePreview) {
                    window.previewManager.updatePreview(true);
                }
            });
        }
    };

    /**
     * 모든 데이터 저장
     */
    const saveAllData = async function() {
        try {
            // 각 모듈의 데이터 저장
            const modules = [
                window.UIHotel,
                window.UIRoom,
                window.UIPackage,
                window.UIPrice,
                window.UICancel,
                window.UINotice
            ];

            for (const module of modules) {
                if (module?.saveData) {
                    await module.saveData();
                }
            }

            // HotelApp에 최종 저장
            if (window.HotelApp?.saveToLocalStorage) {
                window.HotelApp.saveToLocalStorage();
            }

            // 미리보기 업데이트
            if (window.previewManager?.updatePreview) {
                await window.previewManager.updatePreview(true);
            }

            showToast('모든 데이터가 저장되었습니다.');
        } catch (error) {
            console.error('[UICommon] 데이터 저장 중 오류:', error);
            showToast('데이터 저장 중 오류가 발생했습니다.');
        }
    };
    
    /**
     * 변경사항 자동 저장
     */
    const autoSaveChanges = function(input) {
        // 필요한 경우 변경사항을 자동으로 저장하는 로직 구현
        // HotelApp 또는 다른 스토리지에 저장
    };
    
    /**
     * 데이터 저장
     */
    const saveData = function() {
        try {
            if (window.HotelApp && typeof window.HotelApp.saveToLocalStorage === 'function') {
                window.HotelApp.saveToLocalStorage();
                showToast('데이터가 저장되었습니다.');
                return true;
            } else {
                console.error('[UICommon] HotelApp.saveToLocalStorage 함수를 찾을 수 없습니다.');
                return false;
            }
        } catch (error) {
            console.error('[UICommon] 데이터 저장 중 오류:', error);
            return false;
        }
    };
    
    /**
     * 데이터 불러오기
     */
    const loadData = async function() {
        try {
            if (window.HotelApp && typeof window.HotelApp.loadFromLocalStorage === 'function') {
                await window.HotelApp.loadFromLocalStorage();
                
                // 미리보기 업데이트 전에 이미지 URL 유효성 검사
                validateAndUpdateImageUrls();
                
                // 미리보기 업데이트
                if (typeof window.UICore !== 'undefined' && typeof window.UICore.updatePreview === 'function') {
                    await window.UICore.updatePreview(true);
                } else if (window.previewManager && typeof window.previewManager.updatePreview === 'function') {
                    await window.previewManager.updatePreview(true);
                } else {
                    await updatePreview();
                }
                
                showToast('데이터를 불러왔습니다.');
                return true;
            } else {
                console.error('[UICommon] HotelApp.loadFromLocalStorage 함수를 찾을 수 없습니다.');
                return false;
            }
        } catch (error) {
            console.error('[UICommon] 데이터 불러오기 중 오류:', error);
            return false;
        }
    };
    
    /**
     * 이미지 URL 유효성 검사 및 업데이트
     */
    const validateAndUpdateImageUrls = function() {
        try {
            // 모든 이미지 URL 입력 필드 검사
            const imageUrlInputs = document.querySelectorAll('input[type="url"], .image-url-input');
            imageUrlInputs.forEach(input => {
                if (input && input.value) {
                    // URL 유효성 검사
                    try {
                        new URL(input.value);
                    } catch (e) {
                        console.warn('[UICommon] 유효하지 않은 이미지 URL:', input.value);
                        input.value = ''; // 유효하지 않은 URL 제거
                    }
                }
            });

            // 이미지 태그 검사
            const images = document.querySelectorAll('img[src^="http"]');
            images.forEach(img => {
                // 이미지 로드 오류 시 대체 이미지 표시
                img.onerror = function() {
                    this.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiB2aWV3Qm94PSIwIDAgMTAwIDEwMCI+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiNlZWUiLz48dGV4dCB4PSI1MCIgeT0iNTAiIGZvbnQtc2l6ZT0iMTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGFsaWdubWVudC1iYXNlbGluZT0ibWlkZGxlIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZmlsbD0iIzk5OSI+7IOB7ZKIIOyXheydhCDrk53shLjsmpQ8L3RleHQ+PC9zdmc+';
                    console.warn('[UICommon] 이미지 로드 실패:', this.src);
                };
            });
        } catch (error) {
            console.error('[UICommon] 이미지 URL 검증 중 오류:', error);
        }
    };
    
    /**
     * 미리보기 업데이트
     */
    const updatePreview = async function(force = false) {
        try {
            // 다른 미리보기 매니저가 있는지 확인
            if (typeof window.UICore !== 'undefined' && typeof window.UICore.updatePreview === 'function') {
                await window.UICore.updatePreview(force);
                return;
            }
            
            if (window.previewManager && typeof window.previewManager.updatePreview === 'function') {
                await window.previewManager.updatePreview(force);
                return;
            }
            
            // 기본 미리보기 업데이트 로직
            console.log('[UICommon] 미리보기 업데이트 시작');
            
            // 호텔 정보 수집
            const hotelInfo = collectHotelInfo();
            const roomInfo = collectRoomInfo();
            const packageInfo = collectPackageInfo();
            
            // 미리보기 컨테이너 찾기
            const previewContainer = document.getElementById('previewContainer') || 
                                   document.querySelector('.preview-container') ||
                                   document.querySelector('#preview');
            
            if (previewContainer) {
                let html = '<div class="preview-content">';
                
                if (hotelInfo) {
                    html += generateHotelInfoHtml(hotelInfo);
                }
                
                if (roomInfo) {
                    html += generateRoomInfoHtml(roomInfo);
                }
                
                if (packageInfo) {
                    html += generatePackageInfoHtml(packageInfo);
                }
                
                html += '</div>';
                previewContainer.innerHTML = html;
            }
            
            console.log('[UICommon] 미리보기 업데이트 완료');
        } catch (error) {
            console.error('[UICommon] 미리보기 업데이트 중 오류:', error);
        }
    };

    /**
     * 알림 토스트 표시
     */
    const showToast = function(message) {
        try {
            // 이미 존재하는 토스트 컨테이너 확인
            let toastContainer = document.getElementById('toastContainer');
            
            // 없으면 생성
            if (!toastContainer) {
                toastContainer = document.createElement('div');
                toastContainer.id = 'toastContainer';
                toastContainer.className = 'toast-container position-fixed bottom-0 end-0 p-3';
                document.body.appendChild(toastContainer);
            }
            
            // 고유 ID 생성
            const toastId = 'toast_' + Date.now();
            
            // 토스트 HTML 생성
            const toastHtml = `
                <div id="${toastId}" class="toast" role="alert" aria-live="assertive" aria-atomic="true">
                    <div class="toast-header">
                        <strong class="me-auto">알림</strong>
                        <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
                    </div>
                    <div class="toast-body">
                        ${message}
                    </div>
                </div>
            `;
            
            // 토스트 컨테이너에 추가
            toastContainer.insertAdjacentHTML('beforeend', toastHtml);
            
            // Bootstrap 토스트 초기화 및 표시
            const toastElement = document.getElementById(toastId);
            const toast = new bootstrap.Toast(toastElement, { delay: 3000 });
            toast.show();
            
            // 5초 후 자동 제거
            setTimeout(() => {
                if (toastElement && toastElement.parentNode) {
                    toastElement.parentNode.removeChild(toastElement);
                }
            }, 5000);
        } catch (error) {
            console.error('[UICommon] 토스트 표시 중 오류:', error);
            // 대체 알림 표시
            alert(message);
        }
    };
    
    // 중복 미리보기 함수 제거 - Preview 컴포넌트로 통합
    
    /**
     * 호텔 정보 수집
     */
    const collectHotelInfo = function() {
        try {
            // 호텔 정보 폼에서 데이터 수집
            const hotelName = document.getElementById('hotelName')?.value || '';
            const hotelAddress = document.getElementById('hotelAddress')?.value || '';
            const hotelDescription = document.getElementById('hotelDescription')?.value || '';
            
            if (!hotelName && !hotelAddress && !hotelDescription) {
                // HotelApp에서 가져오기 시도
                if (window.HotelApp && window.HotelApp.state && window.HotelApp.state.hotelInfo) {
                    return window.HotelApp.state.hotelInfo;
                }
                return null;
            }
            
            return {
                name: hotelName,
                address: hotelAddress,
                description: hotelDescription
            };
        } catch (error) {
            console.error('[UICommon] 호텔 정보 수집 중 오류:', error);
            return null;
        }
    };
    
    /**
     * 객실 정보 수집
     */
    const collectRoomInfo = function() {
        try {
            // 객실 정보 수집 로직
            const roomContainer = document.getElementById('roomContainer');
            if (!roomContainer) {
                return null;
            }
            
            const roomCards = roomContainer.querySelectorAll('.room-card');
            if (roomCards.length === 0) {
                return null;
            }
            
            const rooms = [];
            roomCards.forEach(card => {
                const roomName = card.querySelector('.room-title')?.textContent || '';
                const roomDescription = card.querySelector('.room-desc')?.textContent || '';
                
                if (roomName) {
                    rooms.push({
                        name: roomName,
                        description: roomDescription
                    });
                }
            });
            
            return rooms.length > 0 ? rooms : null;
        } catch (error) {
            console.error('[UICommon] 객실 정보 수집 중 오류:', error);
            return null;
        }
    };
    
    /**
     * 패키지 정보 수집
     */
    const collectPackageInfo = function() {
        try {
            // 패키지 정보 수집 로직
            const packageContainer = document.getElementById('packageContainer');
            if (!packageContainer) {
                return null;
            }
            
            const packageCards = packageContainer.querySelectorAll('.package-card');
            if (packageCards.length === 0) {
                return null;
            }
            
            const packages = [];
            packageCards.forEach(card => {
                const packageName = card.querySelector('.package-title')?.textContent || '';
                const packageDescription = card.querySelector('.package-desc')?.textContent || '';
                
                if (packageName) {
                    packages.push({
                        name: packageName,
                        description: packageDescription
                    });
                }
            });
            
            return packages.length > 0 ? packages : null;
        } catch (error) {
            console.error('[UICommon] 패키지 정보 수집 중 오류:', error);
            return null;
        }
    };
    
    /**
     * 호텔 정보 HTML 생성
     */
    const generateHotelInfoHtml = function(hotelInfo) {
        return `
            <div class="preview-hotel-info mb-4">
                <h3 class="mb-3">${hotelInfo.name}</h3>
                <p class="text-muted">${hotelInfo.address}</p>
                <div class="hotel-description">
                    ${hotelInfo.description}
                </div>
            </div>
        `;
    };
    
    /**
     * 객실 정보 HTML 생성
     */
    const generateRoomInfoHtml = function(rooms) {
        if (!Array.isArray(rooms) || rooms.length === 0) {
            return '';
        }
        
        let html = `
            <div class="preview-rooms mb-4">
                <h3 class="mb-3">객실 정보</h3>
                <div class="row">
        `;
        
        rooms.forEach(room => {
            html += `
                <div class="col-md-6 mb-3">
                    <div class="card h-100">
                        <div class="card-body">
                            <h5 class="card-title">${room.name}</h5>
                            <p class="card-text">${room.description}</p>
                        </div>
                    </div>
                </div>
            `;
        });
        
        html += `
                </div>
            </div>
        `;
        
        return html;
    };
    
    /**
     * 패키지 정보 HTML 생성
     */
    const generatePackageInfoHtml = function(packages) {
        if (!Array.isArray(packages) || packages.length === 0) {
            return '';
        }
        
        let html = `
            <div class="preview-packages mb-4">
                <h3 class="mb-3">패키지 정보</h3>
                <div class="row">
        `;
        
        packages.forEach(packageItem => {
            html += `
                <div class="col-md-6 mb-3">
                    <div class="card h-100">
                        <div class="card-body">
                            <h5 class="card-title">${packageItem.name}</h5>
                            <p class="card-text">${packageItem.description}</p>
                        </div>
                    </div>
                </div>
            `;
        });
        
        html += `
                </div>
            </div>
        `;
        
        return html;
    };
    
    /**
     * 모든 변경사항 적용
     */
    const applyAllChanges = async function() {
        console.log('[UICommon] 모든 변경사항 적용');
        
        try {
            // 적용 버튼 UI 업데이트
            const button = document.getElementById('applyAllChangesBtn');
            if (button) {
                button.disabled = true;
                const originalText = button.innerHTML;
                button.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> 적용 중...';
                
                // 변경사항 자동 저장
                if (window.HotelApp && typeof window.HotelApp.saveToLocalStorage === 'function') {
                    window.HotelApp.saveToLocalStorage();
                }
                
                // 미리보기 업데이트
                await updatePreview();
                
                // 버튼 상태 복원
                setTimeout(() => {
                    button.disabled = false;
                    button.innerHTML = originalText;
                }, 500);
                
                // 완료 메시지
                showToast('모든 변경사항이 적용되었습니다.');
                return true;
            }
            
            // 버튼이 없는 경우 직접 업데이트
            await updatePreview();
            console.log('[UICommon] 변경사항 적용 완료');
            return true;
        } catch (error) {
            console.error('[UICommon] 변경사항 적용 중 오류:', error);
            
            // 에러 메시지 표시
            const button = document.getElementById('applyAllChangesBtn');
            if (button) {
                button.disabled = false;
                button.innerHTML = '변경사항 적용';
                showToast('변경사항 적용 중 오류가 발생했습니다.');
            }
            
            return false;
        }
    };
    
    /**
     * 서버 로그 표시
     */
    const showServerLogs = function() {
        try {
            // 로그 모달 표시
            const logsModal = new bootstrap.Modal(document.getElementById('logsViewModal'));
            logsModal.show();
            
            // 서버 로그 불러오기
            refreshServerLogs();
        } catch (error) {
            console.error('[UICommon] 서버 로그 표시 중 오류:', error);
            showToast('서버 로그를 불러오는 중 오류가 발생했습니다.', 'error');
        }
    };
    
    /**
     * 서버 로그 새로고침
     */
    const refreshServerLogs = async function() {
        try {
            const logsContainer = document.getElementById('serverLogs');
            if (!logsContainer) return;
            
            // 로딩 표시
            logsContainer.textContent = '로그를 불러오는 중...';
            
            // 서버 로그 API 호출
            const response = await fetch('/api/server/logs', {
                method: 'GET',
                headers: {
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache'
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                
                if (data.success && Array.isArray(data.logs)) {
                    // 로그 표시
                    logsContainer.textContent = data.logs.join('');
                    // 스크롤을 맨 아래로 이동
                    logsContainer.scrollTop = logsContainer.scrollHeight;
                } else {
                    logsContainer.textContent = data.error || '로그를 불러올 수 없습니다.';
                }
            } else {
                logsContainer.textContent = `서버 오류: ${response.status} ${response.statusText}`;
            }
        } catch (error) {
            console.error('[UICommon] 서버 로그 새로고침 중 오류:', error);
            const logsContainer = document.getElementById('serverLogs');
            if (logsContainer) {
                logsContainer.textContent = `오류 발생: ${error.message}`;
            }
        }
    };
    
    /**
     * URL 입력 및 적용 기능 구현
     */
    const handleUrlInput = function(input, type, options = {}) {
        try {
            const url = input.value.trim();
            if (!url) {
                showToast('URL을 입력해주세요.', 'warning');
                return false;
            }

            // URL 유효성 검사
            try {
                new URL(url);
            } catch (e) {
                showToast('유효하지 않은 URL입니다.', 'error');
                return false;
            }

            // 미리보기 컨테이너 생성/업데이트
            const container = input.closest('.url-input-container');
            let previewContainer = container.querySelector('.preview-container');
            if (!previewContainer) {
                previewContainer = document.createElement('div');
                previewContainer.className = 'preview-container mt-2';
                container.appendChild(previewContainer);
            }

            // 타입별 미리보기 처리
            switch(type) {
                case 'image':
                    previewContainer.innerHTML = `
                        <img src="${url}" class="img-fluid border rounded" alt="미리보기" 
                             onerror="this.onerror=null; this.src='/static/images/error.png'; UICommon.showToast('이미지 로드 실패', 'error');">
                    `;
                    break;
                case 'video':
                    previewContainer.innerHTML = `
                        <video src="${url}" class="img-fluid border rounded" controls
                               onerror="UICommon.showToast('비디오 로드 실패', 'error');">
                            비디오를 지원하지 않는 브라우저입니다.
                        </video>
                    `;
                    break;
                case 'document':
                    previewContainer.innerHTML = `
                        <iframe src="${url}" class="border rounded" style="width:100%; height:300px;"
                                onerror="UICommon.showToast('문서 로드 실패', 'error');">
                            문서를 표시할 수 없습니다.
                        </iframe>
                    `;
                    break;
                default:
                    previewContainer.innerHTML = `
                        <div class="alert alert-info">
                            URL이 적용되었습니다: ${url}
                        </div>
                    `;
            }

            // 성공 메시지
            showToast('URL이 적용되었습니다.');
            
            // 콜백 실행
            if (options.onSuccess && typeof options.onSuccess === 'function') {
                options.onSuccess(url);
            }

            return true;
        } catch (error) {
            console.error('[UICommon] URL 처리 중 오류:', error);
            showToast('URL 처리 중 오류가 발생했습니다.', 'error');
            return false;
        }
    };

    // 공개 API
    return {
        init: init,
        updatePreview: updatePreview,
        applyAllChanges: applyAllChanges,
        saveData: saveData,
        loadData: loadData,
        showToast: showToast,
        showServerLogs: showServerLogs,
        refreshServerLogs: refreshServerLogs,
        isInitialized: function() {
            return initialized;
        }
    };
})();

// 초기화 함수 실행
document.addEventListener('DOMContentLoaded', function() {
    console.log('UICommon 모듈 초기화');
    
    // 전역 이벤트 리스너 등록
    const applyBtn = document.getElementById('applyAllChangesBtn');
    if (applyBtn) {
        applyBtn.addEventListener('click', function() {
            window.UICommon.applyAllChanges();
        });
    }
    
    // 미리보기 초기화
    setTimeout(() => {
        try {
            window.UICommon.updatePreview();
        } catch (error) {
            console.error('초기 미리보기 업데이트 오류:', error);
        }
    }, 500);
});

// URL 입력 이벤트 바인딩
document.querySelectorAll('.url-input').forEach(input => {
    const type = input.dataset.type || 'default';
    const applyBtn = input.nextElementSibling;
    
    if (applyBtn && applyBtn.classList.contains('apply-url-btn')) {
        applyBtn.addEventListener('click', () => handleUrlInput(input, type));
    }
});
