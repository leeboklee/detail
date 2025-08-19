import React from 'react';
import { useAppContext } from '../AppContext.Context';

const LayoutManager = () => {
  const { layoutInfo, setLayoutInfo } = useAppContext();

  const templates = [
    { id: 'card', name: '카드형', description: '모던한 카드 레이아웃' },
    { id: 'list', name: '리스트형', description: '깔끔한 리스트 형태' },
    { id: 'grid', name: '그리드형', description: '격자 형태 레이아웃' },
    { id: 'minimal', name: '미니멀', description: '심플한 미니멀 디자인' }
  ];

  const themes = [
    { id: 'light', name: '라이트', description: '밝은 테마' },
    { id: 'dark', name: '다크', description: '어두운 테마' },
    { id: 'brand', name: '브랜드', description: '브랜드 컬러' }
  ];

  const fonts = [
    { id: 'sans', name: '산세리프', description: '깔끔한 산세리프' },
    { id: 'serif', name: '세리프', description: '고전적인 세리프' },
    { id: 'mono', name: '모노스페이스', description: '고정폭 폰트' }
  ];

  const spacingOptions = [
    { id: 'compact', name: '컴팩트', description: '좁은 간격' },
    { id: 'normal', name: '일반', description: '보통 간격' },
    { id: 'spacious', name: '넓은', description: '넓은 간격' }
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

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm border">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">🎨 레이아웃 설정</h2>
      
      {/* 템플릿 선택 */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">템플릿 선택</h3>
        <div className="grid grid-cols-2 gap-4">
          {templates.map((template) => (
            <div
              key={template.id}
              className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                layoutInfo.template === template.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => handleTemplateChange(template.id)}
            >
              <div className="font-medium text-gray-800">{template.name}</div>
              <div className="text-sm text-gray-600">{template.description}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 테마 선택 */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">테마 선택</h3>
        <div className="grid grid-cols-3 gap-4">
          {themes.map((theme) => (
            <div
              key={theme.id}
              className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                layoutInfo.theme === theme.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => handleThemeChange(theme.id)}
            >
              <div className="font-medium text-gray-800">{theme.name}</div>
              <div className="text-sm text-gray-600">{theme.description}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 폰트 선택 */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">폰트 선택</h3>
        <div className="grid grid-cols-3 gap-4">
          {fonts.map((font) => (
            <div
              key={font.id}
              className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                layoutInfo.fontFamily === font.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => handleFontChange(font.id)}
            >
              <div className="font-medium text-gray-800">{font.name}</div>
              <div className="text-sm text-gray-600">{font.description}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 간격 설정 */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">간격 설정</h3>
        <div className="grid grid-cols-3 gap-4">
          {spacingOptions.map((spacing) => (
            <div
              key={spacing.id}
              className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                layoutInfo.spacing === spacing.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => handleSpacingChange(spacing.id)}
            >
              <div className="font-medium text-gray-800">{spacing.name}</div>
              <div className="text-sm text-gray-600">{spacing.description}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 색상 설정 */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">색상 설정</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              주요 색상
            </label>
            <input
              type="color"
              value={layoutInfo.colors.primary}
              onChange={(e) => handleColorChange('primary', e.target.value)}
              className="w-full h-10 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              보조 색상
            </label>
            <input
              type="color"
              value={layoutInfo.colors.secondary}
              onChange={(e) => handleColorChange('secondary', e.target.value)}
              className="w-full h-10 border border-gray-300 rounded-md"
            />
          </div>
        </div>
      </div>

      {/* 반응형 설정 */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">반응형 설정</h3>
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={layoutInfo.responsive}
            onChange={(e) => handleResponsiveChange(e.target.checked)}
            className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <span className="text-gray-700">모바일 반응형 활성화</span>
        </label>
      </div>
    </div>
  );
};

export default LayoutManager; 