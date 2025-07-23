import React, { useState, useEffect, useCallback } from 'react';

export default function NewDatabaseManager({ currentData, updateData }) {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  
  // 현재 작업 중인 프로젝트 상태
  const [currentProject, setCurrentProject] = useState(null);
  
  // 템플릿 목록
  const [templates, setTemplates] = useState([]);

  // 현재 데이터 변경 감지하여 프로젝트 정보 업데이트
  useEffect(() => {
    if (currentData?.hotel?.name) {
      const hotelName = currentData.hotel.name;
      const packageName = currentData.packages?.[0]?.name || '표준 PKG';
      const fullName = `${hotelName} ${packageName}`;
      
      setCurrentProject(prev => {
        if (!prev || prev.fullName !== fullName) {
          return {
            hotelName,
            packageName, 
            fullName,
            lastModified: new Date().toISOString(),
            isModified: true,
            isNew: true
          };
        }
        return { ...prev, isModified: true, lastModified: new Date().toISOString() };
      });
    }
  }, [currentData?.hotel?.name, currentData?.packages]);

  // 메시지 표시 함수
  const showMessage = (msg, type = 'info') => {
    setMessage({ text: msg, type });
    setTimeout(() => setMessage(''), 4000);
  };

  // 템플릿 목록 불러오기
  const loadTemplates = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/hotels');
      if (!response.ok) throw new Error('템플릿 로드 실패');
      
      const hotels = await response.json();
      const templateList = hotels.map(hotel => ({
        id: hotel.id,
        hotelName: hotel.name,
        packageName: hotel.packages?.[0]?.name || '표준 PKG',
        fullName: `${hotel.name} ${hotel.packages?.[0]?.name || '표준 PKG'}`,
        lastModified: hotel.updatedAt || hotel.createdAt,
        data: hotel
      }));
      
      setTemplates(templateList);
      showMessage(`${templateList.length}개 템플릿 로드됨`, 'success');
    } catch (error) {
      showMessage('템플릿 로드 실패', 'error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 템플릿 불러오기
  const loadTemplate = async (templateId) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/hotels/${templateId}`);
      if (!response.ok) throw new Error('템플릿 로드 실패');
      
      const result = await response.json();
      const hotel = result.hotel || result;
      
      // 데이터 변환 후 메인 앱에 적용
      const transformedData = {
        hotel: {
          name: hotel.name || '',
          address: hotel.address || '',
          description: hotel.description || '',
          image_url: hotel.imageUrl || '',
          phone: hotel.phone || '',
          email: hotel.email || '',
          website: hotel.website || ''
        },
        rooms: hotel.rooms || [],
        packages: hotel.packages || [],
        facilities: hotel.facilities || { general: [], business: [], leisure: [], dining: [] },
        notices: hotel.notices || []
      };
      
      updateData(transformedData);
      
      const template = templates.find(t => t.id === templateId);
      setCurrentProject({
        id: templateId,
        hotelName: template?.hotelName || hotel.name,
        packageName: template?.packageName || '표준 PKG',
        fullName: template?.fullName || `${hotel.name} 표준 PKG`,
        isModified: false,
        isNew: false
      });
      
      showMessage(`"${template?.fullName}" 템플릿 로드됨`, 'success');
    } catch (error) {
      showMessage('템플릿 로드 실패', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // 새 템플릿으로 저장
  const saveAsNew = async () => {
    if (!currentProject) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/hotels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentData)
      });
      
      if (!response.ok) throw new Error('저장 실패');
      
      const result = await response.json();
      setCurrentProject(prev => ({
        ...prev,
        id: result.hotel?.id,
        isNew: false,
        isModified: false
      }));
      
      showMessage(`"${currentProject.fullName}" 저장 완료`, 'success');
      await loadTemplates();
    } catch (error) {
      showMessage('저장 실패', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // 기존 템플릿 업데이트
  const updateTemplate = async () => {
    if (!currentProject?.id) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`/api/hotels/${currentProject.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: currentProject.id, ...currentData.hotel })
      });
      
      if (!response.ok) throw new Error('업데이트 실패');
      
      setCurrentProject(prev => ({ ...prev, isModified: false }));
      showMessage(`"${currentProject.fullName}" 업데이트 완료`, 'success');
      await loadTemplates();
    } catch (error) {
      showMessage('업데이트 실패', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // 호텔명/패키지명 변경
  const changeProjectName = (field, value) => {
    if (!currentProject) return;
    
    const updated = { ...currentProject, [field]: value, isModified: true };
    updated.fullName = `${updated.hotelName} ${updated.packageName}`;
    setCurrentProject(updated);
    
    if (field === 'hotelName') {
      updateData({
        ...currentData,
        hotel: { ...currentData.hotel, name: value }
      });
    }
  };

  // 템플릿 삭제
  const deleteTemplate = async (templateId) => {
    const template = templates.find(t => t.id === templateId);
    if (!confirm(`"${template?.fullName}" 삭제하시겠습니까?`)) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`/api/hotels?id=${templateId}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('삭제 실패');
      
      showMessage(`"${template?.fullName}" 삭제됨`, 'success');
      if (currentProject?.id === templateId) setCurrentProject(null);
      await loadTemplates();
    } catch (error) {
      showMessage('삭제 실패', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">🏨 프로젝트 관리</h2>
        <p className="text-gray-600">호텔 + 패키지 조합으로 템플릿 관리</p>
      </div>

      {/* 현재 프로젝트 */}
      {currentProject && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-semibold text-blue-900">
              📋 현재 작업: {currentProject.fullName}
            </h3>
            <div className="flex space-x-2">
              {currentProject.isModified && (
                <>
                  <button
                    onClick={saveAsNew}
                    disabled={isLoading}
                    className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                  >
                    💾 새로 저장
                  </button>
                  {!currentProject.isNew && (
                    <button
                      onClick={updateTemplate}
                      disabled={isLoading}
                      className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                    >
                      🔄 업데이트
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-blue-700 mb-1">🏨 호텔명</label>
              <input
                type="text"
                value={currentProject.hotelName}
                onChange={(e) => changeProjectName('hotelName', e.target.value)}
                className="w-full px-2 py-1 text-sm border border-blue-300 rounded"
              />
            </div>
            <div>
              <label className="block text-xs text-blue-700 mb-1">📦 패키지명</label>
              <input
                type="text"
                value={currentProject.packageName}
                onChange={(e) => changeProjectName('packageName', e.target.value)}
                className="w-full px-2 py-1 text-sm border border-blue-300 rounded"
              />
            </div>
          </div>
          
          <div className="mt-2 text-xs text-blue-600">
            {currentProject.isModified && '● 수정됨'}
            {currentProject.isNew && ' ● 새 프로젝트'}
          </div>
        </div>
      )}

      {/* 메시지 */}
      {message && (
        <div className={`mb-4 p-3 rounded-lg ${
          message.type === 'success' ? 'bg-green-100 text-green-800' :
          message.type === 'error' ? 'bg-red-100 text-red-800' :
          'bg-blue-100 text-blue-800'
        }`}>
          {message.text}
        </div>
      )}

      {/* 템플릿 목록 */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-semibold">📚 저장된 템플릿</h3>
          <button
            onClick={loadTemplates}
            disabled={isLoading}
            className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
          >
            🔄 새로고침
          </button>
        </div>
        
        {isLoading ? (
          <div className="text-center py-4">로딩 중...</div>
        ) : templates.length === 0 ? (
          <div className="text-center py-4 text-gray-500">저장된 템플릿이 없습니다</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((template) => (
              <div key={template.id} className="p-3 border border-gray-200 rounded-lg">
                <h4 className="font-semibold mb-2">{template.fullName}</h4>
                <div className="text-sm text-gray-600 mb-3">
                  <div>🏨 {template.hotelName}</div>
                  <div>📦 {template.packageName}</div>
                  <div>📅 {new Date(template.lastModified).toLocaleDateString()}</div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => loadTemplate(template.id)}
                    className="flex-1 px-2 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                  >
                    📂 불러오기
                  </button>
                  <button
                    onClick={() => deleteTemplate(template.id)}
                    className="px-2 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 