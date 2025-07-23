'use client';

import React, { useState } from 'react';
import { saveTemplatesToStorage, TEMPLATE_CATEGORIES, filterTemplatesByCategory, searchTemplates } from '@shared/utils/templateUtils.js';

/**
 * 전체 템플릿 관리 컴포넌트
 * 템플릿 목록을 표시하고 선택, 로드, 삭제 기능 제공
 */
export default function AllTemplateManager({
  templates = [], 
  setTemplates = () => {},
  templateName = '',
  setTemplateName = () => {},
  onLoadTemplate, // 템플릿 로드 콜백
  onDeleteTemplate, // 템플릿 삭제 콜백
  generateHtml
}) {
  const [selectedTemplateIndex, setSelectedTemplateIndex] = useState(-1);

  // 검색 및 필터 상태
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  // 저장 중 상태
  const [isSaving, setIsSaving] = useState(false);
  
  // 이름 변경 모드
  const [editingIndex, setEditingIndex] = useState(-1);
  const [editingName, setEditingName] = useState('');
  
  // 새 템플릿 생성 모드
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newTemplateCategory, setNewTemplateCategory] = useState(TEMPLATE_CATEGORIES.CUSTOM.id);
  const [newTemplateTags, setNewTemplateTags] = useState('');
  
  // 검색어 및 카테고리에 따른 템플릿 필터링
  const filteredTemplates = React.useMemo(() => {
    let result = templates && Array.isArray(templates) ? templates : [];
    
    // 카테고리 필터링
    result = filterTemplatesByCategory(result, selectedCategory);
    
    // 검색어 필터링
    result = searchTemplates(result, searchTerm);
    
    // 최신순 정렬
    return result.sort((a, b) => {
      if (a?.timestamp && b?.timestamp) {
        return new Date(b.timestamp) - new Date(a.timestamp);
      }
      return a?.name?.localeCompare(b?.name || '') || 0;
    });
  }, [templates, searchTerm, selectedCategory]);
    
  // 템플릿 선택 핸들러
  const handleSelectTemplate = (index) => {
    setSelectedTemplateIndex(index);
  };
  
  // 템플릿 로드 핸들러
  const handleLoadTemplate = (index) => {
    try {
      if (typeof onLoadTemplate === 'function') {
        onLoadTemplate(index);
        // 로드 후 선택된 템플릿 인덱스 초기화
        setSelectedTemplateIndex(-1);
      } else {
        console.warn('템플릿 로드 함수가 지정되지 않았습니다.');
        alert('템플릿 로드 기능을 사용할 수 없습니다.');
      }
    } catch (error) {
      console.error('템플릿 로드 중 오류:', error);
      alert('템플릿 로드 중 오류가 발생했습니다.');
    }
  };
  
  // 템플릿 삭제 핸들러
  const handleDeleteTemplate = (index) => {
    try {
      if (!window.confirm('정말로 이 템플릿을 삭제하시겠습니까?')) {
        return;
      }
      
      if (typeof onDeleteTemplate === 'function') {
        onDeleteTemplate(index);
        // 삭제 후 선택된 템플릿 인덱스 초기화
        setSelectedTemplateIndex(-1);
      } else {
        // 직접 삭제 처리 (콜백이 없는 경우)
        const updatedTemplates = [...templates];
        updatedTemplates.splice(index, 1);
        setTemplates(updatedTemplates);
        saveTemplatesToStorage(updatedTemplates);
        alert('템플릿이 삭제되었습니다.');
      }
    } catch (error) {
      console.error('템플릿 삭제 중 오류:', error);
      alert('템플릿 삭제 중 오류가 발생했습니다.');
    }
  };

  // 템플릿 저장 핸들러
  const handleSaveTemplate = async () => {
    try {
      setIsSaving(true);
      
      if (!templateName.trim()) {
        alert('템플릿 이름을 입력해주세요.');
        setIsSaving(false);
        return;
      }
      
      // generateHtml 함수 호출하여 최신 HTML 생성
      if (typeof generateHtml === 'function') {
        try {
          console.log('HTML 생성 중...');
          await generateHtml();
          console.log('HTML 생성 완료');
        } catch (err) {
          console.error('HTML 생성 실패:', err);
          // HTML 생성이 실패해도 템플릿은 저장 진행
        }
      } else {
        console.warn('HTML 생성 함수가 제공되지 않았습니다.');
      }
      
      // 기존 템플릿 중 동일한 이름이 있는지 확인
      const existingIndex = templates.findIndex(t => t.name === templateName);
      
      if (existingIndex >= 0) {
        if (window.confirm(`"${templateName}" 템플릿이 이미 존재합니다. 덮어쓰시겠습니까?`)) {
          // 사용자가 확인하면 덮어쓰기
          const updatedTemplates = [...templates];
          updatedTemplates[existingIndex] = {
            ...templates[existingIndex],
            name: templateName,
            category: newTemplateCategory,
            tags: newTemplateTags.split(',').map(tag => tag.trim()).filter(tag => tag),
            timestamp: new Date().toISOString()
          };
          setTemplates(updatedTemplates);
          saveTemplatesToStorage(updatedTemplates);
          alert(`"${templateName}" 템플릿을 덮어썼습니다.`);
        }
      } else {
        // 새 템플릿 추가
        const newTemplate = {
          name: templateName,
          category: newTemplateCategory,
          tags: newTemplateTags.split(',').map(tag => tag.trim()).filter(tag => tag),
          timestamp: new Date().toISOString()
        };
        const updatedTemplates = [...templates, newTemplate];
        setTemplates(updatedTemplates);
        saveTemplatesToStorage(updatedTemplates);
        alert(`"${templateName}" 템플릿을 저장했습니다.`);
      }
    } catch (error) {
      console.error('템플릿 저장 중 오류:', error);
      alert('템플릿 저장 중 오류가 발생했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  // 빈 템플릿 생성 핸들러
  const handleCreateBlankTemplate = () => {
    if (!isCreatingNew) {
      setIsCreatingNew(true);
      return;
    }
    
    const blankTemplateName = templateName.trim() || `새 템플릿 ${new Date().toLocaleString()}`;
    const newTemplate = {
      name: blankTemplateName,
      category: newTemplateCategory,
      tags: newTemplateTags.split(',').map(tag => tag.trim()).filter(tag => tag),
      timestamp: new Date().toISOString(),
      data: {
        hotel: { name: '', address: '', description: '', image_url: '', phone: '', email: '', website: '' },
        rooms: [],
        packages: [],
        facilities: { general: [], business: [], leisure: [], dining: [] },
        notices: [],
        pricing: { priceTypes: [] }
      }
    };
    
    const updatedTemplates = [...templates, newTemplate];
    setTemplates(updatedTemplates);
    saveTemplatesToStorage(updatedTemplates);
    alert(`"${blankTemplateName}" 빈 템플릿을 생성했습니다.`);
    
    // 초기화
    setIsCreatingNew(false);
    setTemplateName('');
    setNewTemplateTags('');
    setNewTemplateCategory(TEMPLATE_CATEGORIES.CUSTOM.id);
  };

  // 템플릿 복사 핸들러
  const handleCopyTemplate = (index) => {
    try {
      if (index < 0 || index >= templates.length) {
        alert('유효하지 않은 템플릿입니다.');
        return;
      }
      
      const originalTemplate = templates[index];
      const copiedTemplate = {
        ...originalTemplate,
        name: `${originalTemplate.name} (복사본)`,
        timestamp: new Date().toISOString()
      };
      
      const updatedTemplates = [...templates, copiedTemplate];
      setTemplates(updatedTemplates);
      saveTemplatesToStorage(updatedTemplates);
      alert(`"${originalTemplate.name}" 템플릿을 복사했습니다.`);
    } catch (error) {
      console.error('템플릿 복사 중 오류:', error);
      alert('템플릿 복사 중 오류가 발생했습니다.');
    }
  };

  // 템플릿 이름 변경 시작
  const handleStartEditName = (index) => {
    setEditingIndex(index);
    setEditingName(templates[index]?.name || '');
  };

  // 템플릿 이름 변경 저장
  const handleSaveEditName = () => {
    try {
      if (!editingName.trim()) {
        alert('템플릿 이름을 입력해주세요.');
        return;
      }
      
      if (editingIndex < 0 || editingIndex >= templates.length) {
        alert('유효하지 않은 템플릿입니다.');
        return;
      }
      
      const updatedTemplates = [...templates];
      updatedTemplates[editingIndex] = {
        ...updatedTemplates[editingIndex],
        name: editingName.trim(),
        timestamp: new Date().toISOString()
      };
      
      setTemplates(updatedTemplates);
      saveTemplatesToStorage(updatedTemplates);
      setEditingIndex(-1);
      setEditingName('');
      alert('템플릿 이름이 변경되었습니다.');
    } catch (error) {
      console.error('템플릿 이름 변경 중 오류:', error);
      alert('템플릿 이름 변경 중 오류가 발생했습니다.');
    }
  };

  // 템플릿 이름 변경 취소
  const handleCancelEditName = () => {
    setEditingIndex(-1);
    setEditingName('');
  };

  // 카테고리 색상 가져오기
  const getCategoryColor = (categoryId) => {
    const category = Object.values(TEMPLATE_CATEGORIES).find(cat => cat.id === categoryId);
    return category?.color || 'gray';
  };

  return (
    <div className="template-manager">
      {/* 템플릿 생성 및 저장 섹션 */}
      <div className="bg-gray-50 p-4 rounded-lg mb-4">
        <h4 className="text-lg font-semibold mb-3">🎨 템플릿 생성</h4>
        
        {/* 빈 템플릿 생성 */}
        {!isCreatingNew ? (
          <div className="flex gap-2 mb-3">
            <button
              onClick={handleCreateBlankTemplate}
              className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded flex items-center gap-2"
            >
              ➕ 빈 템플릿 생성
            </button>
          </div>
        ) : (
          <div className="bg-white p-3 rounded border mb-3">
            <h5 className="font-medium mb-2">새 템플릿 설정</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-sm font-medium mb-1">카테고리</label>
                <select
                  value={newTemplateCategory}
                  onChange={(e) => setNewTemplateCategory(e.target.value)}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  {Object.values(TEMPLATE_CATEGORIES).map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">태그 (쉼표로 구분)</label>
                <input
                  type="text"
                  value={newTemplateTags}
                  onChange={(e) => setNewTemplateTags(e.target.value)}
                  placeholder="예: 바다전망, 가족여행, 럭셔리"
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleCreateBlankTemplate}
                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded"
              >
                ✓ 생성
              </button>
              <button
                onClick={() => setIsCreatingNew(false)}
                className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded"
              >
                ✕ 취소
              </button>
            </div>
          </div>
        )}
        
        {/* 현재 설정으로 템플릿 저장 */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            placeholder="템플릿 이름 (현재 설정 저장용)"
            className="flex-grow px-3 py-2 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <button
            onClick={handleSaveTemplate}
            disabled={isSaving || !templateName.trim()}
            className={`whitespace-nowrap px-4 py-2 ${isSaving || !templateName.trim() ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'} text-white rounded disabled:cursor-not-allowed`}
          >
            {isSaving ? '저장 중...' : '💾 현재 설정 저장'}
          </button>
        </div>
      </div>

      {/* 검색 및 필터 */}
      <div className="mb-4 space-y-3">
        {/* 검색 */}
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="템플릿 검색 (이름, 카테고리, 태그)..."
          className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        
        {/* 카테고리 필터 */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1 rounded text-sm ${selectedCategory === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          >
            🔍 전체
          </button>
          {Object.values(TEMPLATE_CATEGORIES).map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-3 py-1 rounded text-sm ${selectedCategory === category.id ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* 템플릿 목록 */}
      <div className="border rounded overflow-hidden">
        <div className="bg-gray-100 px-4 py-2 border-b font-medium flex justify-between">
          <span>📚 저장된 템플릿</span>
          <span className="text-sm text-gray-500">{filteredTemplates.length}개</span>
        </div>
        
        {filteredTemplates.length === 0 ? (
          <div className="p-4 text-gray-500 text-center">
            {searchTerm || selectedCategory !== 'all' ? '검색 결과가 없습니다.' : '저장된 템플릿이 없습니다.'}
            <div className="mt-2 text-sm">
              ➕ <strong>빈 템플릿 생성</strong> 버튼으로 새 템플릿을 만들어보세요!
            </div>
          </div>
        ) : (
          <div className="divide-y max-h-[400px] overflow-y-auto">
            {filteredTemplates.map((template, index) => (
              <div 
                key={`template-${index}`} 
                className={`p-3 hover:bg-gray-50 ${selectedTemplateIndex === index ? 'bg-blue-50' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 mr-2" onClick={() => handleSelectTemplate(index)}>
                    {editingIndex === index ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          className="flex-grow px-2 py-1 border rounded text-sm"
                          autoFocus
                          onKeyPress={(e) => e.key === 'Enter' && handleSaveEditName()}
                        />
                        <button
                          onClick={handleSaveEditName}
                          className="px-2 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600"
                        >
                          ✓
                        </button>
                        <button
                          onClick={handleCancelEditName}
                          className="px-2 py-1 bg-gray-500 text-white rounded text-xs hover:bg-gray-600"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="font-medium cursor-pointer flex items-center gap-2">
                          <span>{template?.name || '이름 없음'}</span>
                          {template.category && (
                            <span className={`px-2 py-1 rounded text-xs bg-${getCategoryColor(template.category)}-100 text-${getCategoryColor(template.category)}-700`}>
                              {TEMPLATE_CATEGORIES[template.category]?.name || template.category}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          <div>{template?.timestamp ? new Date(template.timestamp).toLocaleString() : '날짜 정보 없음'}</div>
                          {template.tags && template.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {template.tags.map((tag, tagIndex) => (
                                <span key={tagIndex} className="px-1 py-0.5 bg-gray-200 rounded text-xs">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                  
                  {editingIndex !== index && (
                    <div className="shrink-0 flex gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLoadTemplate(index);
                        }}
                        className="px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-xs"
                        title="템플릿 불러오기"
                      >
                        📂 불러오기
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopyTemplate(index);
                        }}
                        className="px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 text-xs"
                        title="템플릿 복사"
                      >
                        📋 복사
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStartEditName(index);
                        }}
                        className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 text-xs"
                        title="이름 변경"
                      >
                        ✏️ 이름변경
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteTemplate(index);
                        }}
                        className="px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 text-xs"
                        title="템플릿 삭제"
                      >
                        🗑️ 삭제
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* 도움말 */}
      <div className="mt-4 p-3 bg-blue-50 rounded text-sm text-blue-800">
        <strong>💡 사용 팁:</strong>
        <ul className="mt-1 ml-4 list-disc">
          <li><strong>빈 템플릿 생성</strong>: 완전히 새로운 템플릿 시작 (카테고리와 태그 설정 가능)</li>
          <li><strong>현재 설정 저장</strong>: 지금 입력한 모든 데이터를 템플릿으로 저장</li>
          <li><strong>카테고리 필터</strong>: 호텔 유형별로 템플릿 분류 및 검색</li>
          <li><strong>태그 검색</strong>: 키워드로 빠른 템플릿 찾기</li>
          <li><strong>복사</strong>: 기존 템플릿을 복사해서 수정</li>
          <li><strong>이름변경</strong>: 템플릿 이름만 변경</li>
        </ul>
      </div>
    </div>
  );
} 