// 釉뚮씪?곗? 肄섏넄?먯꽌 ?ㅽ뻾?????덈뒗 ?섎룞 ?뚯뒪???⑥닔??
// ?ъ슜踰? 釉뚮씪?곗? 媛쒕컻???꾧뎄 肄섏넄?먯꽌 ??肄붾뱶瑜?蹂듭궗?섏뿬 ?ㅽ뻾

console.log('?? ?섎룞 ?뚯뒪???⑥닔?ㅼ씠 濡쒕뱶?섏뿀?듬땲??');

// 1. ?쒗뵆由?湲곕뒫 ?뚯뒪??
window.testTemplate = {
    // ?쒗뵆由?紐⑸줉 紐⑤떖 ?닿린
    openTemplateModal: () => {
        console.log('?뱥 ?쒗뵆由?紐⑸줉 紐⑤떖 ?닿린 ?뚯뒪??..');
        const templateBtn = document.querySelector('button[contains(text(), "?뮶 ?쒗뵆由?紐⑸줉")], [aria-label*="?쒗뵆由?]');
        if (templateBtn) {
            templateBtn.click();
            console.log('???쒗뵆由?踰꾪듉 ?대┃??);
        } else {
            console.log('???쒗뵆由?踰꾪듉??李얠쓣 ???놁쓬');
        }
    },
    
    // ?덈줈 ???踰꾪듉 ?뚯뒪??
    testSaveButton: () => {
        console.log('?뮶 ?덈줈 ???踰꾪듉 ?뚯뒪??..');
        const saveBtn = Array.from(document.querySelectorAll('button')).find(btn => 
            btn.textContent.includes('?덈줈 ???)
        );
        if (saveBtn) {
            console.log('???덈줈 ???踰꾪듉 諛쒓껄:', saveBtn.textContent.trim());
            console.log('   踰꾪듉 ?곹깭:', {
                visible: saveBtn.offsetParent !== null,
                enabled: !saveBtn.disabled,
                className: saveBtn.className
            });
        } else {
            console.log('???덈줈 ???踰꾪듉??李얠쓣 ???놁쓬');
        }
    },
    
    // 遺덈윭?ㅺ린 踰꾪듉 ?뚯뒪??
    testLoadButtons: () => {
        console.log('?뱿 遺덈윭?ㅺ린 踰꾪듉???뚯뒪??..');
        const loadBtns = Array.from(document.querySelectorAll('button')).filter(btn => 
            btn.textContent.includes('遺덈윭?ㅺ린')
        );
        console.log(`??${loadBtns.length}媛쒖쓽 遺덈윭?ㅺ린 踰꾪듉 諛쒓껄`);
        loadBtns.forEach((btn, index) => {
            console.log(`   踰꾪듉 ${index + 1}:`, {
                text: btn.textContent.trim(),
                visible: btn.offsetParent !== null,
                enabled: !btn.disabled
            });
        });
    }
};

// 2. ?뱀뀡蹂?異붽? 踰꾪듉 ?뚯뒪??
window.testAddButtons = {
    // 紐⑤뱺 異붽? 踰꾪듉 李얘린
    findAllAddButtons: () => {
        console.log('?뵇 紐⑤뱺 異붽? 踰꾪듉 李얘린...');
        const buttons = [
            { id: 'addPackageBtn', name: '?⑦궎吏 異붽?' },
            { id: 'addNoticeBtn', name: '怨듭??ы빆 異붽?' },
            { id: 'addFacilityBtn', name: '?쒖꽕 異붽?' }
        ];
        
        buttons.forEach(({ id, name }) => {
            const btn = document.getElementById(id);
            if (btn) {
                console.log(`??${name} 踰꾪듉 諛쒓껄:`, {
                    id: btn.id,
                    text: btn.textContent.trim(),
                    visible: btn.offsetParent !== null,
                    enabled: !btn.disabled,
                    zIndex: window.getComputedStyle(btn).zIndex,
                    position: btn.getBoundingClientRect()
                });
            } else {
                console.log(`??${name} 踰꾪듉??李얠쓣 ???놁쓬 (ID: ${id})`);
            }
        });
    },
    
    // ?⑦궎吏 異붽? 踰꾪듉 ?뚯뒪??
    testPackageAdd: () => {
        console.log('?벀 ?⑦궎吏 異붽? 踰꾪듉 ?뚯뒪??..');
        const btn = document.getElementById('addPackageBtn');
        if (btn && btn.offsetParent !== null && !btn.disabled) {
            btn.scrollIntoView({ behavior: 'smooth' });
            setTimeout(() => {
                btn.click();
                console.log('???⑦궎吏 異붽? 踰꾪듉 ?대┃??);
            }, 500);
        } else {
            console.log('???⑦궎吏 異붽? 踰꾪듉 ?대┃ 遺덇?:', {
                found: !!btn,
                visible: btn?.offsetParent !== null,
                enabled: !btn?.disabled
            });
        }
    },
    
    // 怨듭??ы빆 異붽? 踰꾪듉 ?뚯뒪??
    testNoticeAdd: () => {
        console.log('?뱼 怨듭??ы빆 異붽? 踰꾪듉 ?뚯뒪??..');
        const btn = document.getElementById('addNoticeBtn');
        if (btn && btn.offsetParent !== null && !btn.disabled) {
            btn.scrollIntoView({ behavior: 'smooth' });
            setTimeout(() => {
                btn.click();
                console.log('??怨듭??ы빆 異붽? 踰꾪듉 ?대┃??);
            }, 500);
        } else {
            console.log('??怨듭??ы빆 異붽? 踰꾪듉 ?대┃ 遺덇?:', {
                found: !!btn,
                visible: btn?.offsetParent !== null,
                enabled: !btn?.disabled
            });
        }
    },
    
    // ?쒖꽕 異붽? 踰꾪듉 ?뚯뒪??
    testFacilityAdd: () => {
        console.log('?룫 ?쒖꽕 異붽? 踰꾪듉 ?뚯뒪??..');
        const btn = document.getElementById('addFacilityBtn');
        if (btn && btn.offsetParent !== null && !btn.disabled) {
            btn.scrollIntoView({ behavior: 'smooth' });
            setTimeout(() => {
                btn.click();
                console.log('???쒖꽕 異붽? 踰꾪듉 ?대┃??);
            }, 500);
        } else {
            console.log('???쒖꽕 異붽? 踰꾪듉 ?대┃ 遺덇?:', {
                found: !!btn,
                visible: btn?.offsetParent !== null,
                enabled: !btn?.disabled
            });
        }
    }
};

// 3. ?뱀뀡蹂?紐⑤떖 ?닿린 ?뚯뒪??
window.testModals = {
    // 紐⑤뱺 ?뱀뀡 踰꾪듉 李얘린
    findSectionButtons: () => {
        console.log('?뵇 紐⑤뱺 ?뱀뀡 踰꾪듉 李얘린...');
        const sections = [
            '?명뀛 ?뺣낫', '媛앹떎 ?뺣낫', '?쒖꽕 ?뺣낫', '?⑦궎吏', 
            '?뱟 ?먮ℓ湲곌컙&?ъ닕??, '異붽??붽툑', '泥댄겕???꾩썐', 
            '痍⑥냼洹쒖젙', '?덉빟?덈궡', '怨듭??ы빆', '?뮶 ?쒗뵆由?紐⑸줉'
        ];
        
        sections.forEach(sectionName => {
            const buttons = Array.from(document.querySelectorAll('button')).filter(btn => 
                btn.textContent.trim().includes(sectionName)
            );
            
            if (buttons.length > 0) {
                console.log(`??${sectionName} 踰꾪듉 諛쒓껄:`, buttons.length + '媛?);
                buttons.forEach((btn, index) => {
                    console.log(`   踰꾪듉 ${index + 1}:`, {
                        text: btn.textContent.trim(),
                        visible: btn.offsetParent !== null,
                        enabled: !btn.disabled,
                        className: btn.className
                    });
                });
            } else {
                console.log(`??${sectionName} 踰꾪듉??李얠쓣 ???놁쓬`);
            }
        });
    },
    
    // ?뱀젙 ?뱀뀡 紐⑤떖 ?닿린
    openSection: (sectionName) => {
        console.log(`?뱷 ${sectionName} ?뱀뀡 紐⑤떖 ?닿린...`);
        const buttons = Array.from(document.querySelectorAll('button')).filter(btn => 
            btn.textContent.trim().includes(sectionName)
        );
        
        if (buttons.length > 0) {
            const btn = buttons[0];
            if (btn.offsetParent !== null && !btn.disabled) {
                btn.click();
                console.log(`??${sectionName} 紐⑤떖 ?닿린 ?깃났`);
            } else {
                console.log(`??${sectionName} 踰꾪듉 ?대┃ 遺덇?`);
            }
        } else {
            console.log(`??${sectionName} 踰꾪듉??李얠쓣 ???놁쓬`);
        }
    }
};

// 4. 醫낇빀 ?뚯뒪???ㅽ뻾
window.runComprehensiveTest = () => {
    console.log('?? 醫낇빀 ?뚯뒪???쒖옉...');
    
    // 1. ?쒗뵆由?湲곕뒫 ?뚯뒪??
    console.log('\n=== 1. ?쒗뵆由?湲곕뒫 ?뚯뒪??===');
    window.testTemplate.testSaveButton();
    window.testTemplate.testLoadButtons();
    
    // 2. 異붽? 踰꾪듉 ?뚯뒪??
    console.log('\n=== 2. 異붽? 踰꾪듉 ?뚯뒪??===');
    window.testAddButtons.findAllAddButtons();
    
    // 3. ?뱀뀡 踰꾪듉 ?뚯뒪??
    console.log('\n=== 3. ?뱀뀡 踰꾪듉 ?뚯뒪??===');
    window.testModals.findSectionButtons();
    
    console.log('\n??醫낇빀 ?뚯뒪???꾨즺! ??寃곌낵瑜??뺤씤?섏꽭??');
};

// 5. 媛쒕퀎 ?뚯뒪???⑥닔??
window.quickTest = {
    // ?⑦궎吏 ?뱀뀡 ?닿퀬 異붽? 踰꾪듉 ?뚯뒪??
    packageTest: () => {
        console.log('?벀 ?⑦궎吏 ?뱀뀡 ?꾩껜 ?뚯뒪??..');
        window.testModals.openSection('?⑦궎吏');
        setTimeout(() => {
            window.testAddButtons.testPackageAdd();
        }, 1000);
    },
    
    // 怨듭??ы빆 ?뱀뀡 ?닿퀬 異붽? 踰꾪듉 ?뚯뒪??
    noticeTest: () => {
        console.log('?뱼 怨듭??ы빆 ?뱀뀡 ?꾩껜 ?뚯뒪??..');
        window.testModals.openSection('怨듭??ы빆');
        setTimeout(() => {
            window.testAddButtons.testNoticeAdd();
        }, 1000);
    },
    
    // ?쒖꽕 ?뱀뀡 ?닿퀬 異붽? 踰꾪듉 ?뚯뒪??
    facilityTest: () => {
        console.log('?룫 ?쒖꽕 ?뱀뀡 ?꾩껜 ?뚯뒪??..');
        window.testModals.openSection('?쒖꽕 ?뺣낫');
        setTimeout(() => {
            window.testAddButtons.testFacilityAdd();
        }, 1000);
    }
};

// ?ъ슜 媛?대뱶 異쒕젰
console.log(`
?렞 ?ъ슜 媛?대뱶:

1. 醫낇빀 ?뚯뒪???ㅽ뻾:
   runComprehensiveTest()

2. 媛쒕퀎 ?뱀뀡 ?뚯뒪??
   quickTest.packageTest()     // ?⑦궎吏 ?뱀뀡
   quickTest.noticeTest()      // 怨듭??ы빆 ?뱀뀡  
   quickTest.facilityTest()    // ?쒖꽕 ?뱀뀡

3. ?쒗뵆由?湲곕뒫 ?뚯뒪??
   testTemplate.testSaveButton()
   testTemplate.testLoadButtons()

4. 異붽? 踰꾪듉留??뚯뒪??
   testAddButtons.findAllAddButtons()
   testAddButtons.testPackageAdd()
   testAddButtons.testNoticeAdd()
   testAddButtons.testFacilityAdd()

5. ?뱀뀡 紐⑤떖 ?뚯뒪??
   testModals.findSectionButtons()
   testModals.openSection('?⑦궎吏')
`); 
