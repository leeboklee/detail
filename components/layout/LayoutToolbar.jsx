import React, { useState } from 'react';
import { useAppContext } from '../AppContext.Context';

const LayoutToolbar = () => {
  const { layoutInfo, setLayoutInfo } = useAppContext();
  const [isExpanded, setIsExpanded] = useState(false);
  const [showTemplateManager, setShowTemplateManager] = useState(false);
  const [hoveredTemplate, setHoveredTemplate] = useState(null);

  const templates = [
    { 
      id: 'card', 
      name: '카드형', 
      icon: '🃏',
      description: '카드 형태의 깔끔한 레이아웃',
      preview: `
        <div style="background: white; border-radius: 12px; padding: 20px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); margin: 10px;">
          <h3 style="color: #1f2937; margin: 0 0 10px 0;">📞 예약안내</h3>
          <div style="background: #f8fafc; border-radius: 8px; padding: 15px; margin-bottom: 10px;">
            <p style="margin: 0; color: #374151;">• 결제 → 희망날짜 접수 페이지 링크 문자(카톡)전송</p>
          </div>
          <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 6px; padding: 10px;">
            <p style="margin: 0; color: #dc2626; font-weight: 600;">⚠️ 체크인 2일전~ 당일 예약은 유선 카톡 상담후 출발!</p>
          </div>
        </div>
      `
    },
    { 
      id: 'list', 
      name: '리스트형', 
      icon: '📋',
      description: '목록 형태의 간단한 레이아웃',
      preview: `
        <div style="background: white; padding: 20px; border: 1px solid #e5e7eb;">
          <h3 style="color: #1f2937; margin: 0 0 15px 0; border-bottom: 2px solid #3b82f6; padding-bottom: 5px;">📞 예약안내</h3>
          <ul style="margin: 0; padding-left: 20px; color: #374151;">
            <li style="margin-bottom: 8px;">결제 → 희망날짜 접수 페이지 링크 문자(카톡)전송</li>
            <li style="margin-bottom: 8px;">희망날짜 접수 → 대기 → 예약확정 / 마감 안내전송</li>
            <li style="margin-bottom: 8px; color: #dc2626; font-weight: 600;">⚠️ 체크인 2일전~ 당일 예약은 유선 카톡 상담후 출발!</li>
          </ul>
        </div>
      `
    },
    { 
      id: 'grid', 
      name: '그리드형', 
      icon: '⊞',
      description: '격자 형태의 정돈된 레이아웃',
      preview: `
        <div style="background: white; padding: 20px;">
          <h3 style="color: #1f2937; margin: 0 0 15px 0; text-align: center;">📞 예약안내</h3>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
            <div style="background: #f8fafc; border: 1px solid #e5e7eb; border-radius: 8px; padding: 15px;">
              <h4 style="margin: 0 0 10px 0; color: #374151;">🏨 구매안내</h4>
              <p style="margin: 0; font-size: 14px; color: #6b7280;">결제 → 희망날짜 접수 페이지 링크 문자(카톡)전송</p>
            </div>
            <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 15px;">
              <h4 style="margin: 0 0 10px 0; color: #dc2626;">⚠️ 중요안내</h4>
              <p style="margin: 0; font-size: 14px; color: #dc2626;">체크인 2일전~ 당일 예약은 유선 카톡 상담후 출발!</p>
            </div>
          </div>
        </div>
      `
    },
    { 
      id: 'minimal', 
      name: '미니멀', 
      icon: '⚪',
      description: '최소한의 요소로 구성된 깔끔한 레이아웃',
      preview: `
        <div style="background: white; padding: 30px; text-align: center;">
          <h3 style="color: #1f2937; margin: 0 0 20px 0; font-weight: 300; font-size: 24px;">📞 예약안내</h3>
          <div style="max-width: 400px; margin: 0 auto;">
            <p style="margin: 0 0 15px 0; color: #6b7280; line-height: 1.6;">결제 → 희망날짜 접수 페이지 링크 문자(카톡)전송</p>
            <p style="margin: 0; color: #dc2626; font-weight: 500;">⚠️ 체크인 2일전~ 당일 예약은 유선 카톡 상담후 출발!</p>
          </div>
        </div>
      `
    }
  ];

  const themes = [
    { id: 'light', name: '라이트', icon: '☀️' },
    { id: 'dark', name: '다크', icon: '🌙' },
    { id: 'brand', name: '브랜드', icon: '🎨' }
  ];

  const fonts = [
    { id: 'sans', name: '산세리프', icon: 'A' },
    { id: 'serif', name: '세리프', icon: 'A' },
    { id: 'mono', name: '모노', icon: 'A' }
  ];

  const spacingOptions = [
    { id: 'compact', name: '컴팩트', icon: '↔️' },
    { id: 'normal', name: '일반', icon: '↔️' },
    { id: 'spacious', name: '넓은', icon: '↔️' }
  ];

  const sections = [
    { id: 'hotel', name: '호텔 정보' },
    { id: 'package', name: '패키지' },
    { id: 'notice', name: '안내사항' },
    { id: 'cancel', name: '취소/환불규정' },
    { id: 'booking', name: '예약안내' },
    { id: 'checkin', name: '체크인/아웃' },
    { id: 'period', name: '기간' },
    { id: 'price', name: '가격' },
    { id: 'rooms', name: '객실' }
  ];

  const handleTemplateChange = (templateId) => {
    setLayoutInfo('template', templateId);
  };

  const handleThemeChange = (themeId) => {
    setLayoutInfo('theme', themeId);
  };

  const handleFontChange = (fontId) => {
    setLayoutInfo('fontFamily', fontId);
  };

  const handleSpacingChange = (spacingId) => {
    setLayoutInfo('spacing', spacingId);
  };

  const handleColorChange = (colorType, value) => {
    setLayoutInfo('colors', {
      ...layoutInfo.colors,
      [colorType]: value
    });
  };

  const handleResponsiveChange = (checked) => {
    setLayoutInfo('responsive', checked);
  };

  const handleSectionTemplateChange = (sectionId, templateId) => {
    setLayoutInfo('sectionTemplates', {
      ...layoutInfo.sectionTemplates,
      [sectionId]: templateId
    });
  };

  return (
    <>
      <div className="bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* 기본 레이아웃 옵션 */}
            <div className="flex items-center space-x-4">
              {/* 템플릿 선택 - 개선된 UI */}
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700">템플릿:</span>
                <div className="flex space-x-1">
                  {templates.map((template) => (
                    <div key={template.id} className="relative">
                      <button
                        onClick={() => handleTemplateChange(template.id)}
                        onMouseEnter={() => setHoveredTemplate(template.id)}
                        onMouseLeave={() => setHoveredTemplate(null)}
                        className={`px-3 py-1 text-sm rounded-md transition-all ${
                          layoutInfo.template === template.id
                            ? 'bg-blue-500 text-white shadow-md'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                        title={template.description}
                      >
                        <span className="mr-1">{template.icon}</span>
                        {template.name}
                      </button>
                      
                      {/* 템플릿 미리보기 툴팁 */}
                      {hoveredTemplate === template.id && (
                        <div className="absolute top-full left-0 mt-2 z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-3 w-80">
                          <div className="text-xs text-gray-600 mb-2">{template.description}</div>
                          <div 
                            className="border border-gray-200 rounded overflow-hidden"
                            dangerouslySetInnerHTML={{ __html: template.preview }}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* 테마 선택 */}
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700">테마:</span>
                <div className="flex space-x-1">
                  {themes.map((theme) => (
                    <button
                      key={theme.id}
                      onClick={() => handleThemeChange(theme.id)}
                      className={`px-3 py-1 text-sm rounded-md transition-all ${
                        layoutInfo.theme === theme.id
                          ? 'bg-blue-500 text-white shadow-md'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                      title={theme.name}
                    >
                      <span className="mr-1">{theme.icon}</span>
                      {theme.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* 폰트 선택 */}
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700">폰트:</span>
                <div className="flex space-x-1">
                  {fonts.map((font) => (
                    <button
                      key={font.id}
                      onClick={() => handleFontChange(font.id)}
                      className={`px-3 py-1 text-sm rounded-md transition-all ${
                        layoutInfo.fontFamily === font.id
                          ? 'bg-blue-500 text-white shadow-md'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                      title={font.name}
                    >
                      <span className="mr-1">{font.icon}</span>
                      {font.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* 간격 설정 */}
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700">간격:</span>
                <div className="flex space-x-1">
                  {spacingOptions.map((spacing) => (
                    <button
                      key={spacing.id}
                      onClick={() => handleSpacingChange(spacing.id)}
                      className={`px-3 py-1 text-sm rounded-md transition-all ${
                        layoutInfo.spacing === spacing.id
                          ? 'bg-blue-500 text-white shadow-md'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                      title={spacing.name}
                    >
                      <span className="mr-1">{spacing.icon}</span>
                      {spacing.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 확장/축소 버튼 */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowTemplateManager(!showTemplateManager)}
                className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-all"
              >
                🎨 섹션별 템플릿
              </button>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-all"
              >
                {isExpanded ? '🔽' : '🔼'} 고급 설정
              </button>
            </div>
          </div>

          {/* 섹션별 템플릿 관리 */}
          {showTemplateManager && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-3 gap-4">
                {sections.map((section) => (
                  <div key={section.id} className="bg-gray-50 p-3 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">{section.name}</h4>
                    <div className="flex space-x-1">
                      {templates.map((template) => (
                        <button
                          key={template.id}
                          onClick={() => handleSectionTemplateChange(section.id, template.id)}
                          className={`px-2 py-1 text-xs rounded transition-all ${
                            (layoutInfo.sectionTemplates?.[section.id] || layoutInfo.template) === template.id
                              ? 'bg-blue-500 text-white shadow-md'
                              : 'bg-white text-gray-700 hover:bg-gray-200 border border-gray-300'
                          }`}
                          title={`${section.name} - ${template.name}`}
                        >
                          {template.icon}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 확장된 고급 설정 */}
          {isExpanded && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center space-x-6">
                {/* 색상 설정 */}
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-700">주요 색상:</span>
                  <input
                    type="color"
                    value={layoutInfo.colors.primary}
                    onChange={(e) => handleColorChange('primary', e.target.value)}
                    className="w-8 h-8 border border-gray-300 rounded cursor-pointer"
                    title="주요 색상 선택"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-700">보조 색상:</span>
                  <input
                    type="color"
                    value={layoutInfo.colors.secondary}
                    onChange={(e) => handleColorChange('secondary', e.target.value)}
                    className="w-8 h-8 border border-gray-300 rounded cursor-pointer"
                    title="보조 색상 선택"
                  />
                </div>

                {/* 반응형 설정 */}
                <div className="flex items-center space-x-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={layoutInfo.responsive}
                      onChange={(e) => handleResponsiveChange(e.target.checked)}
                      className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700">모바일 반응형</span>
                  </label>
                </div>

                {/* 현재 설정 표시 */}
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-700">현재:</span>
                  <span className="text-sm text-gray-600">
                    {templates.find(t => t.id === layoutInfo.template)?.name} | 
                    {themes.find(t => t.id === layoutInfo.theme)?.name} | 
                    {fonts.find(f => f.id === layoutInfo.fontFamily)?.name}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default LayoutToolbar; 