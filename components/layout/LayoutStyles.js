// 레이아웃 설정에 따른 CSS 변수 생성
export const generateLayoutStyles = (layoutInfo) => {
  const {
    template,
    theme,
    fontFamily,
    spacing,
    colors,
    responsive
  } = layoutInfo;

  // 폰트 패밀리 매핑
  const fontFamilies = {
    sans: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif',
    serif: 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif',
    mono: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace'
  };

  // 간격 설정 매핑
  const spacingValues = {
    compact: {
      padding: '0.5rem',
      margin: '0.25rem',
      gap: '0.5rem'
    },
    normal: {
      padding: '1rem',
      margin: '0.5rem',
      gap: '1rem'
    },
    spacious: {
      padding: '1.5rem',
      margin: '1rem',
      gap: '1.5rem'
    }
  };

  // 테마별 색상 매핑
  const themeColors = {
    light: {
      background: '#FFFFFF',
      text: '#1F2937',
      border: '#E5E7EB',
      accent: colors.primary
    },
    dark: {
      background: '#1F2937',
      text: '#F9FAFB',
      border: '#374151',
      accent: colors.primary
    },
    brand: {
      background: colors.background,
      text: colors.text,
      border: colors.secondary,
      accent: colors.primary
    }
  };

  const currentTheme = themeColors[theme];
  const currentSpacing = spacingValues[spacing];

  // CSS 변수 생성
  const cssVariables = {
    '--layout-font-family': fontFamilies[fontFamily],
    '--layout-padding': currentSpacing.padding,
    '--layout-margin': currentSpacing.margin,
    '--layout-gap': currentSpacing.gap,
    '--layout-background': currentTheme.background,
    '--layout-text': currentTheme.text,
    '--layout-border': currentTheme.border,
    '--layout-accent': currentTheme.accent,
    '--layout-primary': colors.primary,
    '--layout-secondary': colors.secondary,
    '--layout-responsive': responsive ? '1' : '0'
  };

  return cssVariables;
};

// 템플릿별 CSS 클래스 생성
export const getTemplateClasses = (template) => {
  const templateClasses = {
    card: {
      container: 'layout-card-container',
      item: 'layout-card-item',
      header: 'layout-card-header',
      content: 'layout-card-content'
    },
    list: {
      container: 'layout-list-container',
      item: 'layout-list-item',
      header: 'layout-list-header',
      content: 'layout-list-content'
    },
    grid: {
      container: 'layout-grid-container',
      item: 'layout-grid-item',
      header: 'layout-grid-header',
      content: 'layout-grid-content'
    },
    minimal: {
      container: 'layout-minimal-container',
      item: 'layout-minimal-item',
      header: 'layout-minimal-header',
      content: 'layout-minimal-content'
    }
  };

  return templateClasses[template] || templateClasses.card;
};

// CSS 스타일 문자열 생성
export const generateCSSString = (layoutInfo) => {
  const cssVars = generateLayoutStyles(layoutInfo);
  const templateClasses = getTemplateClasses(layoutInfo.template);

  const cssString = `
    :root {
      ${Object.entries(cssVars).map(([key, value]) => `${key}: ${value};`).join('\n      ')}
    }

    .${templateClasses.container} {
      font-family: var(--layout-font-family);
      background: var(--layout-background);
      color: var(--layout-text);
      padding: var(--layout-padding);
      gap: var(--layout-gap);
    }

    .${templateClasses.item} {
      border: 1px solid var(--layout-border);
      border-radius: 8px;
      padding: var(--layout-padding);
      margin: var(--layout-margin);
      background: var(--layout-background);
    }

    .${templateClasses.header} {
      color: var(--layout-accent);
      font-weight: bold;
      margin-bottom: var(--layout-margin);
    }

    .${templateClasses.content} {
      color: var(--layout-text);
      line-height: 1.6;
    }

    @media (max-width: 768px) {
      .${templateClasses.container} {
        padding: calc(var(--layout-padding) * 0.5);
        gap: calc(var(--layout-gap) * 0.5);
      }
    }
  `;

  return cssString;
};

// 동적 스타일 적용
export const applyLayoutStyles = (layoutInfo) => {
  const cssString = generateCSSString(layoutInfo);
  
  // 기존 스타일 태그 제거
  const existingStyle = document.getElementById('dynamic-layout-styles');
  if (existingStyle) {
    existingStyle.remove();
  }

  // 새로운 스타일 태그 생성
  const styleTag = document.createElement('style');
  styleTag.id = 'dynamic-layout-styles';
  styleTag.textContent = cssString;
  document.head.appendChild(styleTag);
}; 

// 예약안내 섹션 전용 스타일
export const BOOKING_SECTION_STYLES = {
  // 문서형 템플릿
  document: {
    container: `
      .booking-document-container {
        max-width: 800px;
        margin: 0 auto;
        padding: 20px;
        background: #ffffff;
        font-family: 'Noto Sans KR', sans-serif;
        line-height: 1.6;
        color: #333;
      }
      
      .booking-document-section {
        margin-bottom: 30px;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        overflow: hidden;
      }
      
      .booking-document-header {
        background: #f8fafc;
        padding: 16px 20px;
        border-bottom: 1px solid #e5e7eb;
        font-size: 18px;
        font-weight: 700;
        color: #1f2937;
      }
      
      .booking-document-content {
        padding: 20px;
      }
      
      .booking-document-item {
        margin-bottom: 12px;
        padding: 8px 0;
        border-bottom: 1px solid #f3f4f6;
      }
      
      .booking-document-item:last-child {
        border-bottom: none;
      }
      
      .booking-document-urgent {
        background: #fef2f2;
        border: 1px solid #fecaca;
        border-radius: 6px;
        padding: 12px;
        margin: 12px 0;
        color: #dc2626;
        font-weight: 600;
      }
      
      .booking-document-kakao {
        background: #fef3c7;
        border: 1px solid #f59e0b;
        border-radius: 8px;
        padding: 16px;
        text-align: center;
        color: #92400e;
        font-weight: 600;
        font-size: 16px;
      }
    `,
    
    // 예약안내 섹션 HTML 템플릿
    template: (data) => `
      <div class="booking-document-container">
        <div class="booking-document-section">
          <div class="booking-document-header">
            🏨 숙박권 구매안내
          </div>
          <div class="booking-document-content">
            <div class="booking-document-item">
              <strong>1.</strong> ${data.paymentProcess || '결제 → 희망날짜 접수 페이지 링크 문자(카톡)전송'}
            </div>
            <div class="booking-document-item">
              <strong>2.</strong> ${data.confirmationProcess || '희망날짜 접수 → 대기 → 예약확정 / 마감 안내전송'}
            </div>
            <div class="booking-document-item" style="font-size: 13px; color: #6b7280;">
              ${data.messageNote || '* 문자(카톡)는 근무시간내 수신자 번호로 전송'}
            </div>
            
            <div class="booking-document-urgent">
              ${data.urgentNote || '체크인 2일전~ 당일 예약은 유선 카톡 상담후 출발!'}
            </div>
            
            <div class="booking-document-item">
              ${data.waitingProduct || '본 숙박권은 대기예약 상품으로 구매즉시 확정 되지않습니다.'}
            </div>
            <div class="booking-document-item">
              ${data.orderNumberNote || '구매완료 및 주문번호는 결제번호를 의미합니다 (예약확정X)'}
            </div>
            <div class="booking-document-item">
              ${data.refundPolicy || '결제후에도 희망날짜 마감시 전액환불/날짜변경 안내드립니다.'}
            </div>
            <div class="booking-document-item">
              ${data.responsibilityNote || '예약 미확정 관련 문제는 책임질수 없음을 안내드립니다.'}
            </div>
            <div class="booking-document-item">
              ${data.stayType || '1박 숙박권이며 연박 / 객실 추가시 수량에 맞춰 구매'}
            </div>
            <div class="booking-document-item">
              ${data.stayExample || 'ex) 1박 2실 : 2매 / 2박 1실 : 2매'}
            </div>
            <div class="booking-document-item">
              ${data.additionalCharge || '요일별 추가요금이 있으므로 하단 요금표를 확인 부탁드립니다.'}
            </div>
          </div>
        </div>
        
        <div class="booking-document-section">
          <div class="booking-document-header">
            📋 참고사항
          </div>
          <div class="booking-document-content">
            <div class="booking-document-item">
              ${data.contactNote || '해피콜/문자수신 불가 번호는 예약 및 주문취소 됩니다.'}
            </div>
            <div class="booking-document-item">
              ${data.cancellationFee || '예약확정 후 문자 미수신 사유로 취소시 위약금 적용됩니다.'}
            </div>
            <div class="booking-document-item">
              ${data.penaltyReference || '취소/변경 위약규정은 아래 하단 참고 부탁드립니다.'}
            </div>
            <div class="booking-document-item">
              ${data.partialRefund || '부분환불 불가'}
            </div>
            <div class="booking-document-item">
              ${data.optionQuantity || '옵션수량은 대기가능 수량을 의미'}
            </div>
            <div class="booking-document-item">
              ${data.facilityNote || '현장 상황에 따라 부대시설 휴장 및 운영시간이 변동 될 수 있음'}
            </div>
            <div class="booking-document-item">
              ${data.productNamePriority || '상세페이지와 상품명이 다른 경우 상품명 우선적용'}
            </div>
            <div class="booking-document-item">
              ${data.additionalPayment || '추가요금 발생시 추가금 안내후 예약확정'}
            </div>
            <div class="booking-document-item">
              ${data.quickConfirmation || '빠른 확정 문의는 카톡상담 부탁드립니다.'}
            </div>
          </div>
        </div>
        
        <div class="booking-document-kakao">
          💬 ${data.kakaoChannel || '카톡에서 한투어 채널 추가하세요 +'}
        </div>
      </div>
    `
  },
  
  // 카드형 템플릿
  card: {
    container: `
      .booking-card-container {
        display: grid;
        gap: 20px;
        padding: 20px;
      }
      
      .booking-card {
        background: #ffffff;
        border: 1px solid #e5e7eb;
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      }
      
      .booking-card-header {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: #1f2937;
        padding: 16px 20px;
        font-size: 16px;
        font-weight: 600;
      }
      
      .booking-card-content {
        padding: 20px;
      }
      
      .booking-card-item {
        padding: 8px 0;
        border-bottom: 1px solid #f3f4f6;
      }
      
      .booking-card-item:last-child {
        border-bottom: none;
      }
    `,
    
    template: (data) => `
      <div class="booking-card-container">
        <div class="booking-card">
          <div class="booking-card-header">
            🏨 숙박권 구매안내
          </div>
          <div class="booking-card-content">
            <div class="booking-card-item">
              <strong>1.</strong> ${data.paymentProcess || '결제 → 희망날짜 접수 페이지 링크 문자(카톡)전송'}
            </div>
            <div class="booking-card-item">
              <strong>2.</strong> ${data.confirmationProcess || '희망날짜 접수 → 대기 → 예약확정 / 마감 안내전송'}
            </div>
            <div class="booking-card-item" style="color: #6b7280; font-size: 13px;">
              ${data.messageNote || '* 문자(카톡)는 근무시간내 수신자 번호로 전송'}
            </div>
          </div>
        </div>
        
        <div class="booking-card">
          <div class="booking-card-header">
            📋 참고사항
          </div>
          <div class="booking-card-content">
            <div class="booking-card-item">
              ${data.contactNote || '해피콜/문자수신 불가 번호는 예약 및 주문취소 됩니다.'}
            </div>
            <div class="booking-card-item">
              ${data.cancellationFee || '예약확정 후 문자 미수신 사유로 취소시 위약금 적용됩니다.'}
            </div>
          </div>
        </div>
      </div>
    `
  }
}; 