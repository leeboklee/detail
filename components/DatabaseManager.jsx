import React, { useState, useEffect } from 'react';
import { useAppContext } from './AppContext.Context';

const DatabaseManager = ({ onClose }) => {
  const { 
    templateList, 
    loadHotelDetails,
    loadTemplateList,
    isContextLoading,
  } = useAppContext();

  const [searchTerm, setSearchTerm] = useState('');
  const [message, setMessage] = useState('');

  // 컴포넌트 마운트 시 템플릿 목록 로드
  useEffect(() => {
    loadTemplateList().catch(error => {
      console.error('템플릿 목록 로드 실패:', error);
      showMessage('템플릿 목록 로드에 실패했습니다.', 'error');
    });
  }, [loadTemplateList]);

  // 검색 필터링된 템플릿 목록
  const filteredTemplates = (templateList || []).filter(template => 
    template.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.fullName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 메시지 표시 함수
  const showMessage = (msg, type = 'info') => {
    setMessage({ text: msg, type });
    setTimeout(() => setMessage(''), 3000);
  };

  // 템플릿 불러오기
  const handleLoadTemplate = async (templateId) => {
    try {
      await loadHotelDetails(templateId);
      const template = templateList.find(t => t.id === templateId);
      if (template) {
        showMessage(`"${template.name}" 템플릿 로드 완료.`, 'success');
        if(onClose) onClose(); // 로드 후 모달 닫기
      }
    } catch (error) {
      showMessage(`템플릿 로드 실패: ${error.message}`, 'error');
    }
  };
  
  // 템플릿 삭제
  const handleDeleteTemplate = async (templateId, templateName) => {
    if (!confirm(`'${templateName}' 템플릿을 정말 삭제하시겠습니까?`)) return;
    
    try {
      const response = await fetch(`/api/hotels/${templateId}`, { method: 'DELETE' });
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || '삭제에 실패했습니다.');
      }
      
      showMessage(`'${templateName}' 템플릿이 삭제되었습니다.`, 'success');
      await loadTemplateList(); // 삭제 후 템플릿 목록 새로고침
    } catch (error) {
      showMessage(`오류: ${error.message}`, 'error');
    }
  };

  // 템플릿 복제
  const handleDuplicateTemplate = async (templateId, templateName) => {
    try {
      const response = await fetch(`/api/hotels/${templateId}/duplicate`, { 
        method: 'POST' 
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || '복제에 실패했습니다.');
      }
      
      showMessage(`'${templateName}' 템플릿이 복제되었습니다.`, 'success');
      await loadTemplateList(); // 복제 후 템플릿 목록 새로고침
    } catch (error) {
      showMessage(`오류: ${error.message}`, 'error');
    }
  };

  // 템플릿 내보내기
  const handleExportTemplate = async (templateId, templateName) => {
    try {
      const response = await fetch(`/api/hotels/${templateId}/export`);
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || '내보내기에 실패했습니다.');
      }
      
      // JSON 파일로 다운로드
      const dataStr = JSON.stringify(result.data, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${templateName}_export.json`;
      link.click();
      URL.revokeObjectURL(url);
      
      showMessage(`'${templateName}' 템플릿이 내보내기되었습니다.`, 'success');
    } catch (error) {
      showMessage(`오류: ${error.message}`, 'error');
    }
  };

  return (
    <div className="p-4 bg-gray-50 h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">템플릿 목록</h2>
        {onClose && (
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
        )}
      </div>

      <input
        type="text"
        placeholder="템플릿 검색..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full p-2 border border-gray-300 rounded-lg mb-4"
      />

      {isContextLoading && !templateList?.length ? (
        <div className="text-center py-4">
          <p>템플릿을 불러오는 중...</p>
        </div>
      ) : (
        <div className="space-y-2 flex-grow overflow-y-auto">
          {filteredTemplates.length > 0 ? (
            filteredTemplates.map((template) => (
              <div
                key={template.id}
                className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm"
              >
                <div className="flex-1">
                  <span className="font-medium text-gray-800">{template.name || '이름 없음'}</span>
                  {template.fullName && template.fullName !== template.name && (
                    <p className="text-sm text-gray-500">{template.fullName}</p>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleLoadTemplate(template.id)}
                    className="px-2 py-1 text-xs text-white bg-blue-500 rounded hover:bg-blue-600 disabled:bg-gray-400"
                    disabled={isContextLoading}
                    title="불러오기"
                  >
                    📂
                  </button>
                  <button
                    onClick={() => handleDuplicateTemplate(template.id, template.name)}
                    className="px-2 py-1 text-xs text-white bg-green-500 rounded hover:bg-green-600 disabled:bg-gray-400"
                    disabled={isContextLoading}
                    title="복제"
                  >
                    📋
                  </button>
                  <button
                    onClick={() => handleExportTemplate(template.id, template.name)}
                    className="px-2 py-1 text-xs text-white bg-purple-500 rounded hover:bg-purple-600 disabled:bg-gray-400"
                    disabled={isContextLoading}
                    title="내보내기"
                  >
                    📤
                  </button>
                  <button
                    onClick={() => handleDeleteTemplate(template.id, template.name)}
                    className="px-2 py-1 text-xs text-white bg-red-500 rounded hover:bg-red-600 disabled:bg-gray-400"
                    disabled={isContextLoading}
                    title="삭제"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 py-4">
              {searchTerm ? '검색 결과가 없습니다.' : '사용 가능한 템플릿이 없습니다.'}
            </p>
          )}
        </div>
      )}

      {message.text && (
        <div className={`mt-4 p-2 text-center text-sm rounded ${
          message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {message.text}
        </div>
      )}
    </div>
  );
};

export default DatabaseManager;