'use client';

import React, { useState, useEffect } from 'react';
import { useAppContext } from '../AppContext.Context';
import styles from './TemplateManager.module.css';

export default function TemplateManager() {
  const {
    templates,
    selectedTemplate,
    setSelectedTemplate,
    saveTemplate,
    loadTemplate,
    deleteTemplate,
    sections
  } = useAppContext();

  const [templateName, setTemplateName] = useState('');
  const [selectedTemplateIndex, setSelectedTemplateIndex] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // 섹션별 템플릿 목록
  const sectionTemplates = {
    hotel: ['default', 'modern', 'classic', 'luxury'],
    room: ['default', 'modern', 'classic', 'minimal'],
    price: ['default', 'modern', 'classic', 'premium'],
    package: ['default', 'modern', 'classic', 'special'],
    cancel: ['default', 'modern', 'classic', 'strict'],
    booking: ['default', 'modern', 'classic', 'friendly'],
    notice: ['default', 'modern', 'classic', 'attention'],
    checkin: ['default', 'modern', 'classic', 'convenient'],
    period: ['default', 'modern', 'classic', 'flexible']
  };

  // 섹션별 템플릿 설명
  const templateDescriptions = {
    default: '기본 디자인 - 깔끔하고 심플한 스타일',
    modern: '모던 디자인 - 최신 트렌드를 반영한 세련된 스타일',
    classic: '클래식 디자인 - 전통적이고 안정적인 스타일',
    minimal: '미니멀 디자인 - 최소한의 요소로 구성된 깔끔한 스타일',
    luxury: '럭셔리 디자인 - 고급스럽고 우아한 스타일',
    premium: '프리미엄 디자인 - 고품질을 강조하는 스타일',
    special: '스페셜 디자인 - 특별한 느낌을 주는 스타일',
    strict: '엄격한 디자인 - 규정을 강조하는 스타일',
    friendly: '친근한 디자인 - 따뜻하고 친근한 느낌의 스타일',
    attention: '주의 디자인 - 중요한 정보를 강조하는 스타일',
    convenient: '편리한 디자인 - 사용자 편의성을 중시하는 스타일',
    flexible: '유연한 디자인 - 다양한 상황에 대응하는 스타일'
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      if (!templateName.trim()) {
        alert('템플릿 이름을 입력해주세요.');
        return;
      }

      // 현재 선택된 템플릿 데이터를 저장
      const currentData = templates[selectedTemplate] || {};
      const result = await saveTemplate(templateName, currentData);
      if (result) {
        setSelectedTemplateIndex('');
        setTemplateName('');
        alert(`'${templateName}' 템플릿이 저장되었습니다.`);
      }
    } catch (error) {
      console.error('템플릿 저장 오류:', error);
      alert(`템플릿 저장 중 오류가 발생했습니다: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLoad = async () => {
    try {
      setIsLoading(true);
      if (selectedTemplateIndex === '') {
        alert('템플릿을 선택해주세요.');
        return;
      }

      const templateName = sectionTemplates[selectedSection]?.[parseInt(selectedTemplateIndex)] || 'default';
      const data = loadTemplate(templateName);
      if (data) {
        setSelectedTemplate(templateName);
        alert(`'${templateName}' 템플릿을 불러왔습니다.`);
      } else {
        alert('템플릿 불러오기에 실패했습니다.');
      }
    } catch (error) {
      console.error('템플릿 불러오기 오류:', error);
      alert(`템플릿 불러오기 중 오류가 발생했습니다: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      if (selectedTemplateIndex === '') {
        alert('템플릿을 선택해주세요.');
        return;
      }

      const templateName = sectionTemplates[selectedSection]?.[parseInt(selectedTemplateIndex)] || 'default';
      if (confirm(`'${templateName}' 템플릿을 정말 삭제하시겠습니까?`)) {
        if (deleteTemplate(templateName)) {
          alert(`'${templateName}' 템플릿을 삭제했습니다.`);
          setSelectedTemplateIndex('');
        } else {
          alert('템플릿 삭제에 실패했습니다.');
        }
      }
    } catch (error) {
      console.error('템플릿 삭제 오류:', error);
      alert(`템플릿 삭제 중 오류가 발생했습니다: ${error.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  // 섹션 선택 시 템플릿 목록 초기화
  useEffect(() => {
    setSelectedTemplateIndex('');
  }, [selectedSection]);

  return (
    <div className={styles.templatesSection}>
      <h4 className="text-xl font-bold mb-4">🎨 템플릿 디자인 관리</h4>
      
      {/* 섹션 선택 */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">영역 선택</label>
        <select 
          value={selectedSection}
          onChange={(e) => setSelectedSection(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg bg-white"
        >
          <option value="">-- 영역을 선택하세요 --</option>
          {sections?.filter((section) => section.visible).map((section) => (
            <option key={section.id} value={section.id}>
              {section.label}
            </option>
          ))}
        </select>
      </div>

      {selectedSection && (
        <>
          {/* 템플릿 저장 */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h5 className="text-lg font-semibold mb-3 text-blue-800">💾 현재 설정 저장</h5>
            <div className="flex gap-3">
              <input
                type="text"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                className="flex-1 p-3 border border-gray-300 rounded-lg"
                placeholder={`${sections?.find(s => s.id === selectedSection)?.label} 템플릿 이름 입력`}
                disabled={isSaving}
              />
              <button 
                onClick={handleSave} 
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                disabled={isSaving || !templateName.trim()}
              >
                {isSaving ? '저장 중...' : '저장'}
              </button>
            </div>
          </div>

          {/* 템플릿 불러오기/삭제 */}
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <h5 className="text-lg font-semibold mb-3 text-green-800">📂 템플릿 관리</h5>
            <div className="space-y-3">
              <select 
                value={selectedTemplateIndex}
                onChange={(e) => setSelectedTemplateIndex(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg bg-white"
                disabled={isLoading || isDeleting}
              >
                <option value="">-- 템플릿 선택 --</option>
                {sectionTemplates[selectedSection]?.map((template, index) => (
                  <option key={index} value={index}>
                    {template} - {templateDescriptions[template]}
                  </option>
                ))}
              </select>
              
              <div className="flex gap-3">
                <button 
                  onClick={handleLoad} 
                  className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                  disabled={selectedTemplateIndex === '' || isLoading}
                >
                  {isLoading ? '불러오는 중...' : '불러오기'}
                </button>
                <button 
                  onClick={handleDelete} 
                  className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                  disabled={selectedTemplateIndex === '' || isDeleting}
                >
                  {isDeleting ? '삭제 중...' : '삭제'}
                </button>
              </div>
            </div>
          </div>

          {/* 현재 선택된 템플릿 정보 */}
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <h5 className="text-lg font-semibold mb-2">현재 선택된 템플릿</h5>
            <p className="text-gray-700">
              <strong>{selectedTemplate}</strong>
              {templateDescriptions[selectedTemplate] && (
                <span className="block text-sm text-gray-500 mt-1">
                  {templateDescriptions[selectedTemplate]}
                </span>
              )}
            </p>
          </div>

          {/* 템플릿 미리보기 */}
          <div className="mt-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
            <h5 className="text-lg font-semibold mb-3 text-purple-800">👁️ 템플릿 미리보기</h5>
            <div className="text-sm text-gray-600">
              <p>선택한 템플릿이 적용된 모습을 오른쪽 미리보기에서 확인할 수 있습니다.</p>
              <p className="mt-2">각 영역별로 다른 템플릿을 적용하여 전체적인 디자인을 구성할 수 있습니다.</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
} 