// 로컬 스토리지 관련 상수
export const LOCAL_STORAGE_TEMPLATES_KEY = 'hotel_templates';
export const LOCAL_STORAGE_SESSION_KEY = 'hotel_session_data';

/**
 * 템플릿 카테고리 정의
 */
export const TEMPLATE_CATEGORIES = {
  HOTEL: { id: 'hotel', name: '🏨 호텔', color: 'blue' },
  RESORT: { id: 'resort', name: '🏖️ 리조트', color: 'green' },
  MOTEL: { id: 'motel', name: '🏩 모텔', color: 'purple' },
  PENSION: { id: 'pension', name: '🏡 펜션', color: 'yellow' },
  GUESTHOUSE: { id: 'guesthouse', name: '🏠 게스트하우스', color: 'orange' },
  BUSINESS: { id: 'business', name: '🏢 비즈니스', color: 'gray' },
  LUXURY: { id: 'luxury', name: '✨ 럭셔리', color: 'gold' },
  BUDGET: { id: 'budget', name: '💰 이코노미', color: 'red' },
  CUSTOM: { id: 'custom', name: '🎨 커스텀', color: 'indigo' }
};

/**
 * 기본 예제 템플릿 데이터
 */
export const EXAMPLE_TEMPLATES = [
  {
    id: 'example-template-1',
    name: '소노벨 변산 리조트',
    category: TEMPLATE_CATEGORIES.RESORT.id,
    tags: ['바다전망', '리조트', '가족여행'],
    data: {
      hotelInfo: {
        name: '소노벨 변산 리조트',
        address: '전북특별자치도 부안군 변산면 변산해변로 51',
        description: '바다를 마주한 전망이 시원한 리조트. 바다를 보며 편안한 휴식을 취하세요.'
      },
      roomInfo: {
        name: '디럭스 오션뷰',
        description: '바다가 보이는 객실'
      },
      timestamp: new Date().toISOString()
    },
    createdAt: new Date().toISOString(),
    isExample: true
  },
  {
    id: 'example-template-2',
    name: '그랜드 호텔',
    category: TEMPLATE_CATEGORIES.BUSINESS.id,
    tags: ['도심', '비즈니스', '컨벤션'],
    data: {
      hotelInfo: {
        name: '그랜드 호텔',
        address: '서울특별시 중구 세종대로 123',
        description: '도심 중앙에 위치한 럭셔리 호텔입니다. 모든 편의시설을 갖추고 있습니다.'
      },
      roomInfo: {
        name: '슈페리어 룸',
        description: '편안한 휴식을 위한 객실'
      },
      timestamp: new Date().toISOString()
    },
    createdAt: new Date().toISOString(),
    isExample: true
  }
];

/**
 * 기본 템플릿 생성 함수
 */
export const createDefaultTemplate = (defaultData = {}) => {
  // 기본 템플릿 데이터 설정
  const templateId = `template-default-${Date.now()}`;
  const currentTime = new Date().toISOString();
  
  return {
    id: templateId,
    name: '기본 템플릿',
    category: TEMPLATE_CATEGORIES.CUSTOM.id,
    tags: ['기본'],
    data: defaultData,
    createdAt: currentTime,
    updatedAt: currentTime,
    isDefault: true
  };
};

/**
 * 템플릿 저장 함수
 */
export const saveTemplate = (templateName, templateData, existingTemplates = [], category = TEMPLATE_CATEGORIES.CUSTOM.id, tags = []) => {
  if (!templateName) {
    throw new Error('템플릿 이름이 필요합니다.');
  }

  // 고유 ID 생성
  const templateId = `template-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  // 템플릿 객체 생성
  const newTemplate = {
    id: templateId,
    name: templateName,
    category: category,
    tags: Array.isArray(tags) ? tags : [],
    data: templateData,
    createdAt: new Date().toISOString()
  };

  // 기존 템플릿 중 동일 이름이 있는지 확인
  const existingIndex = existingTemplates.findIndex(t => t.name === templateName);
  let updatedTemplates = [];
  
  if (existingIndex >= 0) {
    // 기존 템플릿 업데이트
    updatedTemplates = [...existingTemplates];
    updatedTemplates[existingIndex] = { 
      ...updatedTemplates[existingIndex], 
      data: templateData,
      category: category,
      tags: Array.isArray(tags) ? tags : updatedTemplates[existingIndex].tags || [],
      updatedAt: new Date().toISOString()
    };
    return { updatedTemplates, isUpdate: true };
  } else {
    // 새 템플릿 추가
    updatedTemplates = [...existingTemplates, newTemplate];
    return { updatedTemplates, isUpdate: false };
  }
};

/**
 * 로컬 스토리지에 템플릿 저장
 */
export const saveTemplatesToStorage = (templates) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_TEMPLATES_KEY, JSON.stringify(templates));
    return true;
  } catch (e) {
    console.error('템플릿 저장 실패:', e);
    return false;
  }
};

/**
 * 로컬 스토리지에서 템플릿 불러오기
 */
export const loadTemplatesFromStorage = () => {
  try {
    console.log('로컬 스토리지에서, 템플릿 불러오기 시작');
    const storedTemplates = localStorage.getItem(LOCAL_STORAGE_TEMPLATES_KEY);
    if (storedTemplates) {
      const parsedTemplates = JSON.parse(storedTemplates);
      console.log('템플릿 불러오기 성공:', parsedTemplates.length);
      return parsedTemplates;
    } else {
      console.log('템플릿 정보 없음, 예제 템플릿 반환');
      // 템플릿이 없을 경우 예제 템플릿 반환
      saveTemplatesToStorage(EXAMPLE_TEMPLATES);
      return EXAMPLE_TEMPLATES;
    }
  } catch (e) {
    console.error('템플릿 로드 실패:', e);
    // 로드 실패 시 예제 템플릿 반환
    return EXAMPLE_TEMPLATES;
  }
};

/**
 * 기본 템플릿 저장 함수
 */
export const saveDefaultTemplate = (defaultData, existingTemplates = []) => {
  // 기존 기본 템플릿 찾기
  const existingDefaultTemplate = existingTemplates.find(t => t.isDefault);
  
  let updatedTemplates = [];
  
  if (existingDefaultTemplate) {
    // 기존 기본 템플릿 업데이트
    const updatedDefaultTemplate = {
      ...existingDefaultTemplate,
      data: defaultData,
      updatedAt: new Date().toISOString() // 항상 업데이트 시간 갱신
    };
    
    // 기존 기본 템플릿 제거 후 업데이트된 기본 템플릿 추가
    updatedTemplates = [
      updatedDefaultTemplate,
      ...existingTemplates.filter(t => !t.isDefault)
    ];
  } else {
    // 새 기본 템플릿 생성
    const defaultTemplate = createDefaultTemplate(defaultData);
    
    // 기존 템플릿 배열에 기본 템플릿 추가
    updatedTemplates = [
      defaultTemplate, 
      ...existingTemplates.filter(t => !t.isDefault)
    ];
  }
  
  // 템플릿을 로컬 스토리지에 즉시 저장
  saveTemplatesToStorage(updatedTemplates);
  console.log('기본 템플릿 저장 완료:', updatedTemplates[0]);
  
  return updatedTemplates;
};

/**
 * 템플릿 삭제 함수
 */
export const deleteTemplate = (templateIndex, templates) => {
  if (templateIndex < 0 || templateIndex >= templates.length) {
    throw new Error('유효하지 않은 템플릿 인덱스입니다.');
  }
  
  return templates.filter((_, i) => i !== templateIndex);
};

/**
 * 카테고리별 템플릿 필터링
 */
export const filterTemplatesByCategory = (templates, categoryId) => {
  if (!categoryId || categoryId === 'all') {
    return templates;
  }
  return templates.filter(template => template.category === categoryId);
};

/**
 * 태그별 템플릿 필터링
 */
export const filterTemplatesByTag = (templates, tag) => {
  if (!tag) {
    return templates;
  }
  return templates.filter(template => 
    template.tags && template.tags.some(t => 
      t.toLowerCase().includes(tag.toLowerCase())
    )
  );
};

/**
 * 템플릿 검색 (이름, 카테고리, 태그 포함)
 */
export const searchTemplates = (templates, searchTerm) => {
  if (!searchTerm) {
    return templates;
  }
  
  const term = searchTerm.toLowerCase();
  return templates.filter(template => {
    const name = template.name?.toLowerCase() || '';
    const categoryName = TEMPLATE_CATEGORIES[template.category]?.name?.toLowerCase() || '';
    const tags = template.tags?.join(' ').toLowerCase() || '';
    
    return name.includes(term) || categoryName.includes(term) || tags.includes(term);
  });
};

// 세션 데이터 저장 함수
export const saveSessionData = (data) => {
  try {
    if (!data) return;
    
    // 세션 데이터를 로컬 스토리지에 저장
    const sessionData = {
      ...data,
      lastUpdated: new Date().toISOString()
    };
    
    localStorage.setItem('hotelEditorSession', JSON.stringify(sessionData));
    console.log('세션 데이터 저장됨');
  } catch (error) {
    console.error('세션 데이터 저장 중 오류:', error);
  }
};

/**
 * 세션 데이터 불러오기 함수
 */
export const loadSessionData = () => {
  try {
    const storedData = localStorage.getItem(LOCAL_STORAGE_SESSION_KEY);
    if (storedData) {
      return JSON.parse(storedData);
    }
  } catch (e) {
    console.error('세션 데이터 로드 실패:', e);
  }
  return null;
};

/**
 * 기본 HTML 템플릿을 가져오는 함수
 * @returns {string} 기본 HTML 템플릿
 */
export function getTemplateHtml() {
  console.log('[getTemplateHtml] 템플릿 HTML 가져오기 시작');
  
  try {
    // 기본 HTML 템플릿
    const template = `
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>미리보기</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
      line-height: 1.6;
      color: #333;
      margin: 0;
      padding: 0;
      background-color: #f9f9f9;
    }
    .container {
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      background-color: #fff;
      box-shadow: 0 0 10px rgba(0,0,0,0.1);
    }
    h1, h2, h3 {
      margin-top: 0;
      color: #222;
    }
    img {
      max-width: 100%;
      height: auto;
    }
    .debug-info {
      margin-top: 20px;
      padding: 10px;
      background-color: #f0f0f0;
      border-radius: 4px;
      font-family: monospace;
      font-size: 12px;
      white-space: pre-wrap;
    }
  </style>
  <script>
    // 디버깅을 위한 스크립트
    window.addEventListener('DOMContentLoaded', function() {
      console.log('Preview document loaded');
      
      // 부모 창으로 로드 완료 메시지 전달
      if (window.parent) {
        try {
          window.parent.postMessage({
            type: 'PREVIEW_LOADED',
            timestamp: new Date().toISOString()
          }, '*');
        } catch (e) {
          console.error('Failed to send message to parent:', e);
        }
      }
    });
  </script>
</head>
<body>
  <div class="container">
    {{content}}
    <div class="debug-info" id="debug-info"></div>
  </div>
  <script>
    // 디버깅 정보 표시 (개발 모드에서만)
    (function() {
      var debugElement = document.getElementById('debug-info');
      if (debugElement) {
        var debugInfo = {
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          screenSize: {
            width: window.innerWidth,
            height: window.innerHeight
          }
        };
        
        debugElement.textContent = JSON.stringify(debugInfo, null, 2);
      }
    })();
  </script>
</body>
</html>
    `;
    
    console.log('[getTemplateHtml] 템플릿 가져오기 완료, 길이:', template.length);
    
    return template;
  } catch (error) {
    console.error('[getTemplateHtml] 템플릿 가져오기 오류:', error);
    
    // 에러 정보 기록
    if (typeof window !== 'undefined' && window._debugMode) {
      window._debugData.errors.push({
        timestamp: new Date().toISOString(),
        message: error.message,
        stack: error.stack,
        location: 'getTemplateHtml'
      });
    }
    
    // 오류 발생 시 최소한의 기본 템플릿 반환
    return `
      <!DOCTYPE html>
      <html>
        <head><title>기본 템플릿(오류)</title></head>
        <body>
          <div style="padding: 20px;">
            {{content}}
            <div style="color: red; margin-top: 20px;">템플릿 로드 중 오류 발생</div>
          </div>
        </body>
      </html>
    `;
  }
}

// 템플릿 유틸리티 함수를 전역 객체에 등록 (디버깅용)
if (typeof window !== 'undefined') {
  window.templateUtils = {
    getTemplateHtml
  };
  
  console.log('템플릿 유틸리티가 전역 객체에 등록되었습니다.');
} 