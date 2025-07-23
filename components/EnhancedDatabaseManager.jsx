import React, { useState, useEffect, useCallback } from 'react';

export default function EnhancedDatabaseManager({ currentData, updateData }) {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [dbStatus, setDbStatus] = useState(null);
  
  // 현재 작업 중인 프로젝트 (호텔명 + 패키지명 조합)
  const [currentProject, setCurrentProject] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('currentProject');
        return saved ? JSON.parse(saved) : null;
      } catch (error) {
        console.error('localStorage 복원 실패:', error);
        return null;
      }
    }
    return null;
  });

  // 최근 작업 이력
  const [recentProjects, setRecentProjects] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('recentProjects');
        return saved ? JSON.parse(saved) : [];
      } catch (error) {
        return [];
      }
    }
    return [];
  });

  // 프로젝트 템플릿 목록 (호텔 데이터를 템플릿으로 변환)
  const [templates, setTemplates] = useState([]);

  // 프로젝트 정보를 localStorage에 저장
  useEffect(() => {
    if (typeof window !== 'undefined' && currentProject) {
      try {
        localStorage.setItem('currentProject', JSON.stringify(currentProject));
        
        // 최근 프로젝트 목록에 추가 (중복 제거)
        const updated = [currentProject, ...recentProjects.filter(p => 
          p.fullName !== currentProject.fullName
        )].slice(0, 10); // 최대 10개만 유지
        
        setRecentProjects(updated);
        localStorage.setItem('recentProjects', JSON.stringify(updated));
      } catch (error) {
        console.error('localStorage 저장 실패:', error);
      }
    }
  }, [currentProject, recentProjects]);

  // 현재 데이터 변경 감지
  useEffect(() => {
    if (currentData?.hotel?.name) {
      const packageName = extractPackageName(currentData);
      const hotelName = currentData.hotel.name;
      const fullName = `${hotelName} ${packageName}`;
      
      // 프로젝트 정보 업데이트
      setCurrentProject(prev => {
        if (!prev || prev.fullName !== fullName) {
          return {
            hotelName,
            packageName,
            fullName,
            lastModified: new Date().toISOString(),
            isModified: true,
            version: prev?.version || '1.0'
          };
        }
        
        if (!prev.isModified) {
          return {
            ...prev,
            isModified: true,
            lastModified: new Date().toISOString()
          };
        }
        
        return prev;
      });
    }
  }, [currentData]);

  // 패키지명 추출 함수
  const extractPackageName = (data) => {
    if (data?.packages && data.packages.length > 0) {
      return data.packages[0].name || '기본 패키지';
    }
    return '표준 PKG';
  };

  // 메시지 표시 함수
  const showMessage = (msg, type = 'info') => {
    setMessage({ text: msg, type });
    setTimeout(() => setMessage(''), 5000);
  };

  // 데이터베이스 상태 확인
  const checkDatabaseStatus = useCallback(async () => {
    try {
      const response = await fetch('/api/init-db');
      const result = await response.json();
      
      const hotelsResponse = await fetch('/api/hotels');
      const hotelsData = await hotelsResponse.json();
      
      setDbStatus({
        ...result,
        statistics: {
          ...result.statistics,
          hotels: hotelsData.length
        }
      });
      
      if (result.success) {
        showMessage('데이터베이스 연결 상태: 정상', 'success');
      }
    } catch (error) {
      console.error('DB 상태 확인 오류:', error);
      showMessage('데이터베이스 상태 확인 실패', 'error');
    }
  }, []);

  // 호텔 목록 불러오기 및 템플릿 변환
  const loadHotels = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/hotels');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const loadedHotels = await response.json();
      
      // 호텔 데이터를 템플릿으로 변환
      const templateList = loadedHotels.map(hotel => {
        const packageName = extractPackageFromHotel(hotel);
        return {
          id: hotel.id,
          hotelName: hotel.name,
          packageName,
          fullName: `${hotel.name} ${packageName}`,
          lastModified: hotel.updatedAt || hotel.createdAt,
          description: hotel.description,
          hasRooms: hotel.rooms?.length > 0,
          hasPackages: hotel.packages?.length > 0,
          data: hotel
        };
      });
      
      setTemplates(templateList);
      showMessage(`${loadedHotels.length}개 템플릿을 불러왔습니다`, 'success');
    } catch (error) {
      console.error('호텔 목록 로드 오류:', error);
      showMessage('템플릿 목록 불러오기 실패', 'error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 호텔에서 패키지명 추출
  const extractPackageFromHotel = (hotel) => {
    if (hotel.packages && hotel.packages.length > 0) {
      return hotel.packages[0].name;
    }
    
    // 호텔명에서 패키지명 추출 로직
    const name = hotel.name.toLowerCase();
    if (name.includes('조식')) return '조식 PKG';
    if (name.includes('오션')) return '오션 PKG';
    if (name.includes('비발디')) return '비발디 PKG';
    if (name.includes('pkg') || name.includes('패키지')) {
      const match = hotel.name.match(/([\w가-힣]+\s*PKG|[\w가-힣]+\s*패키지)/i);
      return match ? match[0] : '표준 PKG';
    }
    return '표준 PKG';
  };

  // 새 프로젝트 시작
  const startNewProject = () => {
    const newProject = {
      hotelName: currentData?.hotel?.name || '새 호텔',
      packageName: extractPackageName(currentData) || '표준 PKG',
      fullName: `${currentData?.hotel?.name || '새 호텔'} ${extractPackageName(currentData) || '표준 PKG'}`,
      created: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      version: '1.0',
      isNew: true,
      isModified: false
    };
    
    setCurrentProject(newProject);
    showMessage('새 프로젝트를 시작했습니다', 'success');
  };

  // 템플릿 불러오기
  const loadTemplate = async (templateId) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/hotels/${templateId}`);
      if (!response.ok) {
        throw new Error(`템플릿 로드 실패: ${response.status}`);
      }
      
      const responseData = await response.json();
      const hotel = responseData.hotel || responseData;
      
      // 데이터 구조 변환
      const transformedData = transformHotelDataToCurrentFormat(hotel);
      
      // 메인 앱에 데이터 적용
      updateData(transformedData);
      
      // 현재 프로젝트 정보 업데이트
      const template = templates.find(t => t.id === templateId);
      if (template) {
        setCurrentProject({
          id: template.id,
          hotelName: template.hotelName,
          packageName: template.packageName,
          fullName: template.fullName,
          loadedAt: new Date().toISOString(),
          lastModified: template.lastModified,
          isModified: false,
          isNew: false,
          version: '1.0'
        });
      }
      
      showMessage(`"${template?.fullName}" 템플릿을 불러왔습니다`, 'success');
    } catch (error) {
      console.error('템플릿 로드 오류:', error);
      showMessage('템플릿 불러오기 실패', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // 호텔 데이터 변환 함수
  const transformHotelDataToCurrentFormat = (hotel) => {
    return {
      hotel: {
        name: hotel.name || '',
        address: hotel.address || '',
        description: hotel.description || '',
        image_url: hotel.imageUrl || '',
        phone: hotel.phone || '',
        email: hotel.email || '',
        website: hotel.website || '',
        checkin_time: '15:00',
        checkout_time: '11:00'
      },
      rooms: hotel.rooms || [],
      packages: hotel.packages || [],
      facilities: hotel.facilities || {
        general: [],
        business: [],
        leisure: [],
        dining: []
      },
      checkin: hotel.checkin || {},
      pricing: hotel.priceConfiguration || {},
      cancel: hotel.cancel || {},
      booking: hotel.booking || {},
      notices: hotel.notices || []
    };
  };

  // 프로젝트 저장 (새로 저장)
  const saveAsNewProject = async () => {
    if (!currentProject) {
      showMessage('저장할 프로젝트가 없습니다', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/hotels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentData)
      });

      if (!response.ok) {
        throw new Error(`저장 실패: ${response.status}`);
      }

      const savedHotel = await response.json();
      
      // 프로젝트 정보 업데이트
      const updatedProject = {
        ...currentProject,
        id: savedHotel.hotel?.id,
        lastModified: new Date().toISOString(),
        isNew: false,
        isModified: false
      };

      setCurrentProject(updatedProject);
      showMessage(`"${currentProject.fullName}"을 새 템플릿으로 저장했습니다`, 'success');
      
      // 목록 새로고침
      await loadHotels();
    } catch (error) {
      console.error('프로젝트 저장 오류:', error);
      showMessage('저장 중 오류가 발생했습니다', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // 기존 프로젝트 업데이트
  const updateExistingProject = async () => {
    if (!currentProject?.id) {
      showMessage('업데이트할 프로젝트가 없습니다', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/hotels/${currentProject.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: currentProject.id,
          ...currentData.hotel
        })
      });

      if (!response.ok) {
        throw new Error(`업데이트 실패: ${response.status}`);
      }

      await response.json();
      
      // 프로젝트 정보 업데이트
      const updatedProject = {
        ...currentProject,
        lastModified: new Date().toISOString(),
        isModified: false
      };

      setCurrentProject(updatedProject);
      showMessage(`"${currentProject.fullName}"을 업데이트했습니다`, 'success');
      
      // 목록 새로고침
      await loadHotels();
    } catch (error) {
      console.error('프로젝트 업데이트 오류:', error);
      showMessage('업데이트 중 오류가 발생했습니다', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // 템플릿 복사해서 새 프로젝트 시작
  const copyTemplate = async (templateId) => {
    await loadTemplate(templateId);
    
    // 복사된 것으로 표시
    if (currentProject) {
      const copiedProject = {
        ...currentProject,
        hotelName: currentProject.hotelName,
        packageName: currentProject.packageName,
        fullName: `${currentProject.hotelName} ${currentProject.packageName}`,
        isNew: true,
        isModified: true,
        version: '1.0',
        baseTemplateId: templateId
      };
      
      setCurrentProject(copiedProject);
      showMessage(`"${currentProject.fullName}"을 복사했습니다. 수정 후 저장하세요.`, 'info');
    }
  };

  // 프로젝트 삭제
  const deleteProject = async (projectId) => {
    const template = templates.find(t => t.id === projectId);
    if (!confirm(`"${template?.fullName}" 템플릿을 정말 삭제하시겠습니까?`)) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/hotels?id=${projectId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error(`삭제 실패: ${response.status}`);
      }

      showMessage(`"${template?.fullName}" 템플릿이 삭제되었습니다`, 'success');
      
      // 현재 프로젝트가 삭제된 것이면 초기화
      if (currentProject?.id === projectId) {
        setCurrentProject(null);
      }
      
      // 목록 새로고침
      await loadHotels();
    } catch (error) {
      console.error('프로젝트 삭제 오류:', error);
      showMessage('삭제 중 오류가 발생했습니다', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // 호텔명 변경 (패키지는 유지)
  const changeHotelName = (newHotelName) => {
    if (currentProject) {
      const updatedProject = {
        ...currentProject,
        hotelName: newHotelName,
        fullName: `${newHotelName} ${currentProject.packageName}`,
        isModified: true
      };
      setCurrentProject(updatedProject);
      
      // 메인 데이터도 업데이트
      updateData({
        ...currentData,
        hotel: {
          ...currentData.hotel,
          name: newHotelName
        }
      });
    }
  };

  // 패키지명 변경 (호텔은 유지)
  const changePackageName = (newPackageName) => {
    if (currentProject) {
      const updatedProject = {
        ...currentProject,
        packageName: newPackageName,
        fullName: `${currentProject.hotelName} ${newPackageName}`,
        isModified: true
      };
      setCurrentProject(updatedProject);
      
      // 패키지 데이터도 업데이트
      if (currentData.packages && currentData.packages.length > 0) {
        const updatedPackages = [...currentData.packages];
        updatedPackages[0] = { ...updatedPackages[0], name: newPackageName };
        
        updateData({
          ...currentData,
          packages: updatedPackages
        });
      }
    }
  };

  // 컴포넌트 마운트 시 초기 로드
  useEffect(() => {
    checkDatabaseStatus();
    loadHotels();
  }, [checkDatabaseStatus, loadHotels]);

  return (
    <div className="bg-white rounded-lg shadow-lg">
      {/* 헤더 */}
      <div className="border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">🏨 프로젝트 관리</h2>
            <p className="text-sm text-gray-600 mt-1">호텔 + 패키지 조합 템플릿 관리</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={startNewProject}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              ➕ 새 프로젝트
            </button>
            <button
              onClick={loadHotels}
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              🔄 새로고침
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* 현재 프로젝트 상태 */}
        {currentProject && (
          <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-lg font-semibold text-blue-900">
                  📋 현재 작업: {currentProject.fullName}
                </h3>
                <div className="text-sm text-blue-700 mt-1 flex items-center space-x-4">
                  <span>📅 {new Date(currentProject.lastModified).toLocaleString()}</span>
                  {currentProject.isModified && <span className="text-orange-600 font-medium">● 수정됨</span>}
                  {currentProject.isNew && <span className="text-green-600 font-medium">● 새 프로젝트</span>}
                </div>
              </div>
              <div className="flex space-x-2">
                {currentProject.isModified && (
                  <>
                    <button
                      onClick={saveAsNewProject}
                      disabled={isLoading}
                      className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 text-sm"
                    >
                      💾 새로 저장
                    </button>
                    {!currentProject.isNew && (
                      <button
                        onClick={updateExistingProject}
                        disabled={isLoading}
                        className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 text-sm"
                      >
                        🔄 업데이트
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
            
            {/* 빠른 편집 */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-blue-700 mb-1 font-medium">🏨 호텔명</label>
                <input
                  type="text"
                  value={currentProject.hotelName}
                  onChange={(e) => changeHotelName(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-blue-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="호텔명을 입력하세요"
                />
              </div>
              <div>
                <label className="block text-xs text-blue-700 mb-1 font-medium">📦 패키지명</label>
                <input
                  type="text"
                  value={currentProject.packageName}
                  onChange={(e) => changePackageName(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-blue-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="패키지명을 입력하세요"
                />
              </div>
            </div>
          </div>
        )}

        {/* 메시지 표시 */}
        {message && (
          <div className={`mb-4 p-3 rounded-lg flex items-center ${
            message.type === 'success' ? 'bg-green-100 text-green-800' :
            message.type === 'error' ? 'bg-red-100 text-red-800' :
            'bg-blue-100 text-blue-800'
          }`}>
            <span className="mr-2">
              {message.type === 'success' ? '✅' : message.type === 'error' ? '❌' : 'ℹ️'}
            </span>
            {message.text}
          </div>
        )}

        {/* 최근 작업 목록 */}
        {recentProjects.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">🕒 최근 작업</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {recentProjects.slice(0, 6).map((project, index) => (
                <div
                  key={index}
                  className="p-3 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                  onClick={() => project.id && loadTemplate(project.id)}
                >
                  <div className="font-medium text-gray-900">{project.fullName}</div>
                  <div className="text-xs text-gray-600 mt-1">
                    📅 {new Date(project.lastModified).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 템플릿 목록 */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">📚 저장된 템플릿</h3>
          
          {isLoading ? (
            <div className="text-center py-8">
              <div className="text-gray-600">🔄 로딩 중...</div>
            </div>
          ) : templates.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              📝 저장된 템플릿이 없습니다.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className="p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-gray-900">{template.fullName}</h4>
                    <div className="flex items-center space-x-1 text-xs text-gray-500">
                      {template.hasRooms && <span>🏠</span>}
                      {template.hasPackages && <span>📦</span>}
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-600 mb-3">
                    <div>🏨 {template.hotelName}</div>
                    <div>📦 {template.packageName}</div>
                    <div>📅 {new Date(template.lastModified).toLocaleDateString()}</div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => loadTemplate(template.id)}
                      className="flex-1 px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
                    >
                      📂 불러오기
                    </button>
                    <button
                      onClick={() => copyTemplate(template.id)}
                      className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors"
                    >
                      📄 복사
                    </button>
                    <button
                      onClick={() => deleteProject(template.id)}
                      className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 데이터베이스 상태 */}
        {dbStatus && (
          <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">📊 시스템 상태</h3>
            <div className="text-sm text-gray-600 grid grid-cols-2 gap-4">
              <div>📚 총 템플릿: {dbStatus.statistics?.hotels || 0}개</div>
              <div>🔗 DB 상태: {dbStatus.success ? '✅ 정상' : '❌ 오류'}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 