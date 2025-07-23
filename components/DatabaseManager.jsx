import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';

const DatabaseManager = ({ onClose }) => {
  const { 
    templateList, 
    loadHotelDetails,
    isContextLoading,
    loadTemplateList, // 삭제 후 목록 새로고침을 위해 추가
  } = useAppContext();

  const [searchTerm, setSearchTerm] = useState('');
  const [message, setMessage] = useState('');

  // 검색 필터링된 템플릿 목록
  const filteredTemplates = (templateList || []).filter(template => 
    template.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 메시지 표시 함수
  const showMessage = (msg, type = 'info') => {
    setMessage({ text: msg, type });
    setTimeout(() => setMessage(''), 3000);
  };

  // 템플릿 불러오기
  const handleLoadTemplate = async (templateId) => {
    await loadHotelDetails(templateId);
    const template = templateList.find(t => t.id === templateId);
    if (template) {
      showMessage(`"${template.name}" 템플릿 로드 완료.`, 'success');
      if(onClose) onClose(); // 로드 후 모달 닫기
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

  return (
    <div className="p-4 bg-gray-50 h-full flex flex-col">
      {/* DEBUG: 템플릿 리스트 확인 */}
      <pre className="hidden">{JSON.stringify(templateList, null, 2)}</pre>
      
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
                <span className="font-medium text-gray-800">{template.name || '이름 없음'}</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleLoadTemplate(template.id)}
                    className="px-3 py-1 text-sm text-white bg-blue-500 rounded hover:bg-blue-600 disabled:bg-gray-400"
                    disabled={isContextLoading}
                  >
                    {isContextLoading ? '로딩중...' : '불러오기'}
                  </button>
                  <button
                    onClick={() => handleDeleteTemplate(template.id, template.name)}
                    className="px-3 py-1 text-sm text-white bg-red-500 rounded hover:bg-red-600 disabled:bg-gray-400"
                    disabled={isContextLoading}
                  >
                    삭제
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