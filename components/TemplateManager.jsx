'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAppState } from '../hooks/useAppState';

const TemplateManager = ({ onLoadTemplate, onSaveTemplate }) => {
  const { data } = useAppState();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showLoadModal, setShowLoadModal] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');

  // 템플릿 목록 불러오기
  const loadTemplates = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/templates');
      const result = await response.json();
      
      if (result.success) {
        setTemplates(result.data);
      } else {
        console.error('템플릿 목록 로드 실패:', result.message);
      }
    } catch (error) {
      console.error('템플릿 목록 로드 오류:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // 템플릿 저장
  const saveTemplate = useCallback(async () => {
    if (!templateName.trim()) {
      alert('템플릿 이름을 입력해주세요.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: templateName.trim(),
          description: templateDescription.trim(),
          data: data
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        alert('템플릿이 성공적으로 저장되었습니다.');
        setShowSaveModal(false);
        setTemplateName('');
        setTemplateDescription('');
        loadTemplates(); // 목록 새로고침
        onSaveTemplate?.(result.data);
      } else {
        alert('템플릿 저장에 실패했습니다: ' + result.message);
      }
    } catch (error) {
      console.error('템플릿 저장 오류:', error);
      alert('템플릿 저장 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }, [templateName, templateDescription, data, loadTemplates, onSaveTemplate]);

  // 템플릿 불러오기
  const loadTemplate = useCallback(async (template) => {
    try {
      const templateData = template.templateData ? JSON.parse(template.templateData) : template;
      onLoadTemplate?.(templateData);
      setShowLoadModal(false);
      alert('템플릿을 성공적으로 불러왔습니다.');
    } catch (error) {
      console.error('템플릿 불러오기 오류:', error);
      alert('템플릿 불러오기 중 오류가 발생했습니다.');
    }
  }, [onLoadTemplate]);

  // 템플릿 삭제
  const deleteTemplate = useCallback(async (templateId) => {
    if (!confirm('정말로 이 템플릿을 삭제하시겠습니까?')) {
      return;
    }

    try {
      const response = await fetch(`/api/templates?id=${templateId}`, {
        method: 'DELETE',
      });

      const result = await response.json();
      
      if (result.success) {
        alert('템플릿이 성공적으로 삭제되었습니다.');
        loadTemplates(); // 목록 새로고침
      } else {
        alert('템플릿 삭제에 실패했습니다: ' + result.message);
      }
    } catch (error) {
      console.error('템플릿 삭제 오류:', error);
      alert('템플릿 삭제 중 오류가 발생했습니다.');
    }
  }, [loadTemplates]);

  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  return (
    <div className="template-manager">
      {/* 저장하기 버튼 */}
      <button
        onClick={() => setShowSaveModal(true)}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        disabled={loading}
      >
        {loading ? '저장 중...' : '저장하기'}
      </button>

      {/* 목록 버튼 */}
      <button
        onClick={() => setShowLoadModal(true)}
        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors ml-2"
        disabled={loading}
      >
        목록
      </button>

      {/* 저장 모달 */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <h3 className="text-lg font-bold mb-4">템플릿 저장</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">템플릿 이름</label>
              <input
                type="text"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="템플릿 이름을 입력하세요"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">설명 (선택사항)</label>
              <textarea
                value={templateDescription}
                onChange={(e) => setTemplateDescription(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="템플릿 설명을 입력하세요"
                rows={3}
              />
            </div>

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowSaveModal(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors"
              >
                취소
              </button>
              <button
                onClick={saveTemplate}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                disabled={loading}
              >
                {loading ? '저장 중...' : '저장'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 불러오기 모달 */}
      {showLoadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-4/5 max-w-4xl max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-bold mb-4">템플릿 목록</h3>
            
            {loading ? (
              <div className="text-center py-8">로딩 중...</div>
            ) : templates.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                저장된 템플릿이 없습니다.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {templates.map((template) => (
                  <div key={template.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-gray-900">{template.hotelName}</h4>
                      <button
                        onClick={() => deleteTemplate(template.id)}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        삭제
                      </button>
                    </div>
                    
                    {template.description && (
                      <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                    )}
                    
                    <div className="text-xs text-gray-500 mb-3">
                      생성일: {new Date(template.createdAt).toLocaleDateString()}
                      {template.updatedAt !== template.createdAt && (
                        <span> | 수정일: {new Date(template.updatedAt).toLocaleDateString()}</span>
                      )}
                    </div>
                    
                    <button
                      onClick={() => loadTemplate(template)}
                      className="w-full px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors text-sm"
                    >
                      불러오기
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowLoadModal(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TemplateManager;
