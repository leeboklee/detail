// 브라우저 콘솔에서 실행할 수 있는 수동 테스트 함수들
// 사용법: 브라우저 개발자 도구 콘솔에서 이 코드를 복사하여 실행

console.log('🚀 수동 테스트 함수들이 로드되었습니다.');

// 1. 템플릿 기능 테스트
window.testTemplate = {
    // 템플릿 목록 모달 열기
    openTemplateModal: () => {
        console.log('📋 템플릿 목록 모달 열기 테스트...');
        const templateBtn = document.querySelector('button[contains(text(), "💾 템플릿 목록")], [aria-label*="템플릿"]');
        if (templateBtn) {
            templateBtn.click();
            console.log('✅ 템플릿 버튼 클릭됨');
        } else {
            console.log('❌ 템플릿 버튼을 찾을 수 없음');
        }
    },
    
    // 새로 저장 버튼 테스트
    testSaveButton: () => {
        console.log('💾 새로 저장 버튼 테스트...');
        const saveBtn = Array.from(document.querySelectorAll('button')).find(btn => 
            btn.textContent.includes('새로 저장')
        );
        if (saveBtn) {
            console.log('✅ 새로 저장 버튼 발견:', saveBtn.textContent.trim());
            console.log('   버튼 상태:', {
                visible: saveBtn.offsetParent !== null,
                enabled: !saveBtn.disabled,
                className: saveBtn.className
            });
        } else {
            console.log('❌ 새로 저장 버튼을 찾을 수 없음');
        }
    },
    
    // 불러오기 버튼 테스트
    testLoadButtons: () => {
        console.log('📥 불러오기 버튼들 테스트...');
        const loadBtns = Array.from(document.querySelectorAll('button')).filter(btn => 
            btn.textContent.includes('불러오기')
        );
        console.log(`✅ ${loadBtns.length}개의 불러오기 버튼 발견`);
        loadBtns.forEach((btn, index) => {
            console.log(`   버튼 ${index + 1}:`, {
                text: btn.textContent.trim(),
                visible: btn.offsetParent !== null,
                enabled: !btn.disabled
            });
        });
    }
};

// 2. 섹션별 추가 버튼 테스트
window.testAddButtons = {
    // 모든 추가 버튼 찾기
    findAllAddButtons: () => {
        console.log('🔍 모든 추가 버튼 찾기...');
        const buttons = [
            { id: 'addPackageBtn', name: '패키지 추가' },
            { id: 'addNoticeBtn', name: '공지사항 추가' },
            { id: 'addFacilityBtn', name: '시설 추가' }
        ];
        
        buttons.forEach(({ id, name }) => {
            const btn = document.getElementById(id);
            if (btn) {
                console.log(`✅ ${name} 버튼 발견:`, {
                    id: btn.id,
                    text: btn.textContent.trim(),
                    visible: btn.offsetParent !== null,
                    enabled: !btn.disabled,
                    zIndex: window.getComputedStyle(btn).zIndex,
                    position: btn.getBoundingClientRect()
                });
            } else {
                console.log(`❌ ${name} 버튼을 찾을 수 없음 (ID: ${id})`);
            }
        });
    },
    
    // 패키지 추가 버튼 테스트
    testPackageAdd: () => {
        console.log('📦 패키지 추가 버튼 테스트...');
        const btn = document.getElementById('addPackageBtn');
        if (btn && btn.offsetParent !== null && !btn.disabled) {
            btn.scrollIntoView({ behavior: 'smooth' });
            setTimeout(() => {
                btn.click();
                console.log('✅ 패키지 추가 버튼 클릭됨');
            }, 500);
        } else {
            console.log('❌ 패키지 추가 버튼 클릭 불가:', {
                found: !!btn,
                visible: btn?.offsetParent !== null,
                enabled: !btn?.disabled
            });
        }
    },
    
    // 공지사항 추가 버튼 테스트
    testNoticeAdd: () => {
        console.log('📢 공지사항 추가 버튼 테스트...');
        const btn = document.getElementById('addNoticeBtn');
        if (btn && btn.offsetParent !== null && !btn.disabled) {
            btn.scrollIntoView({ behavior: 'smooth' });
            setTimeout(() => {
                btn.click();
                console.log('✅ 공지사항 추가 버튼 클릭됨');
            }, 500);
        } else {
            console.log('❌ 공지사항 추가 버튼 클릭 불가:', {
                found: !!btn,
                visible: btn?.offsetParent !== null,
                enabled: !btn?.disabled
            });
        }
    },
    
    // 시설 추가 버튼 테스트
    testFacilityAdd: () => {
        console.log('🏢 시설 추가 버튼 테스트...');
        const btn = document.getElementById('addFacilityBtn');
        if (btn && btn.offsetParent !== null && !btn.disabled) {
            btn.scrollIntoView({ behavior: 'smooth' });
            setTimeout(() => {
                btn.click();
                console.log('✅ 시설 추가 버튼 클릭됨');
            }, 500);
        } else {
            console.log('❌ 시설 추가 버튼 클릭 불가:', {
                found: !!btn,
                visible: btn?.offsetParent !== null,
                enabled: !btn?.disabled
            });
        }
    }
};

// 3. 섹션별 모달 열기 테스트
window.testModals = {
    // 모든 섹션 버튼 찾기
    findSectionButtons: () => {
        console.log('🔍 모든 섹션 버튼 찾기...');
        const sections = [
            '호텔 정보', '객실 정보', '시설 정보', '패키지', 
            '📅 판매기간&투숙일', '추가요금', '체크인/아웃', 
            '취소규정', '예약안내', '공지사항', '💾 템플릿 목록'
        ];
        
        sections.forEach(sectionName => {
            const buttons = Array.from(document.querySelectorAll('button')).filter(btn => 
                btn.textContent.trim().includes(sectionName)
            );
            
            if (buttons.length > 0) {
                console.log(`✅ ${sectionName} 버튼 발견:`, buttons.length + '개');
                buttons.forEach((btn, index) => {
                    console.log(`   버튼 ${index + 1}:`, {
                        text: btn.textContent.trim(),
                        visible: btn.offsetParent !== null,
                        enabled: !btn.disabled,
                        className: btn.className
                    });
                });
            } else {
                console.log(`❌ ${sectionName} 버튼을 찾을 수 없음`);
            }
        });
    },
    
    // 특정 섹션 모달 열기
    openSection: (sectionName) => {
        console.log(`📝 ${sectionName} 섹션 모달 열기...`);
        const buttons = Array.from(document.querySelectorAll('button')).filter(btn => 
            btn.textContent.trim().includes(sectionName)
        );
        
        if (buttons.length > 0) {
            const btn = buttons[0];
            if (btn.offsetParent !== null && !btn.disabled) {
                btn.click();
                console.log(`✅ ${sectionName} 모달 열기 성공`);
            } else {
                console.log(`❌ ${sectionName} 버튼 클릭 불가`);
            }
        } else {
            console.log(`❌ ${sectionName} 버튼을 찾을 수 없음`);
        }
    }
};

// 4. 종합 테스트 실행
window.runComprehensiveTest = () => {
    console.log('🚀 종합 테스트 시작...');
    
    // 1. 템플릿 기능 테스트
    console.log('\n=== 1. 템플릿 기능 테스트 ===');
    window.testTemplate.testSaveButton();
    window.testTemplate.testLoadButtons();
    
    // 2. 추가 버튼 테스트
    console.log('\n=== 2. 추가 버튼 테스트 ===');
    window.testAddButtons.findAllAddButtons();
    
    // 3. 섹션 버튼 테스트
    console.log('\n=== 3. 섹션 버튼 테스트 ===');
    window.testModals.findSectionButtons();
    
    console.log('\n✅ 종합 테스트 완료! 위 결과를 확인하세요.');
};

// 5. 개별 테스트 함수들
window.quickTest = {
    // 패키지 섹션 열고 추가 버튼 테스트
    packageTest: () => {
        console.log('📦 패키지 섹션 전체 테스트...');
        window.testModals.openSection('패키지');
        setTimeout(() => {
            window.testAddButtons.testPackageAdd();
        }, 1000);
    },
    
    // 공지사항 섹션 열고 추가 버튼 테스트
    noticeTest: () => {
        console.log('📢 공지사항 섹션 전체 테스트...');
        window.testModals.openSection('공지사항');
        setTimeout(() => {
            window.testAddButtons.testNoticeAdd();
        }, 1000);
    },
    
    // 시설 섹션 열고 추가 버튼 테스트
    facilityTest: () => {
        console.log('🏢 시설 섹션 전체 테스트...');
        window.testModals.openSection('시설 정보');
        setTimeout(() => {
            window.testAddButtons.testFacilityAdd();
        }, 1000);
    }
};

// 사용 가이드 출력
console.log(`
🎯 사용 가이드:

1. 종합 테스트 실행:
   runComprehensiveTest()

2. 개별 섹션 테스트:
   quickTest.packageTest()     // 패키지 섹션
   quickTest.noticeTest()      // 공지사항 섹션  
   quickTest.facilityTest()    // 시설 섹션

3. 템플릿 기능 테스트:
   testTemplate.testSaveButton()
   testTemplate.testLoadButtons()

4. 추가 버튼만 테스트:
   testAddButtons.findAllAddButtons()
   testAddButtons.testPackageAdd()
   testAddButtons.testNoticeAdd()
   testAddButtons.testFacilityAdd()

5. 섹션 모달 테스트:
   testModals.findSectionButtons()
   testModals.openSection('패키지')
`); 