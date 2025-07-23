'use client';

import { useState, useEffect } from 'react';

export default function useTemplates() {
  const [templates, setTemplates] = useState({});
  
  const [templateName, setTemplateName] = useState('');
  
  // 로컬 스토리지 키
  const localStorageKey = 'templates';

  // 컴포넌트 마운트 시 템플릿 로드
  useEffect(() => {
    const loadTemplatesFromStorage = () => {
      if (typeof window === 'undefined') return;
      
      try {
      const savedData = localStorage.getItem(localStorageKey); 
      if (savedData) {
          const parsedData = JSON.parse(savedData);
          // 로드된 데이터가 객체 형태인지 확인
          if (parsedData && typeof parsedData === 'object' && !Array.isArray(parsedData)) {
            console.log('템플릿 데이터 로드 성공:', Object.keys(parsedData));
            setTemplates(parsedData);
          } else {
            console.error('로드된 템플릿 데이터 구조 오류 (객체 형태 아님):', parsedData);
            setTemplates({}); // 오류 시 빈 객체로 초기화
          }
        } else {
          console.log('저장된 템플릿 데이터 없음, 초기화');
          setTemplates({}); // 저장된 데이터 없으면 빈 객체로 초기화
          }
        } catch (e) {
          console.error('템플릿 로드 오류:', e);
          setTemplates({}); // 오류 시 빈 객체로 초기화
        }
    };
    
    loadTemplatesFromStorage();
  }, []); // 의존성 배열 비움

  // 템플릿 저장 함수
  const saveTemplate = (type, data) => {
    try {
    if (!type) {
      alert('템플릿 타입을 지정해주세요.');
      return false;
    }
    if (!templateName) {
      alert(`템플릿 이름을 입력해주세요. (예: 섹션명 - ${type})`); 
      return false;
    }

    const newTemplates = {...templates};
    // 해당 타입의 배열이 없으면 생성
    if (!newTemplates[type]) {
      newTemplates[type] = [];
    }
    
      // 동일한 이름의 템플릿이 있는지 확인
      const existingIndex = newTemplates[type].findIndex(t => t.name === templateName);
      
      if (existingIndex >= 0) {
        // 이미 존재하는 템플릿 업데이트 확인
        if (!window.confirm(`'${templateName}' 템플릿이 이미 존재합니다. 덮어쓰시겠습니까?`)) {
          return false;
        }
        
        // 기존 템플릿 업데이트
        newTemplates[type][existingIndex] = { 
          ...newTemplates[type][existingIndex],
          name: templateName, 
          data,
          updatedAt: new Date().toISOString()
        };
      } else {
        // 새 템플릿 추가
    newTemplates[type] = [...newTemplates[type], { 
      name: templateName, 
      data,
      createdAt: new Date().toISOString()
    }];
      }
    
    setTemplates(newTemplates);
    
      // 로컬 스토리지에 저장
      try {
    localStorage.setItem(localStorageKey, JSON.stringify(newTemplates)); 
      } catch (storageError) {
        console.error('템플릿 저장 오류 (로컬 스토리지):', storageError);
        alert('템플릿을 브라우저에 저장하는 중 오류가 발생했습니다. 브라우저 스토리지 사용량을 확인해주세요.');
        return false;
      }
    
    setTemplateName('');
      alert(`'${templateName}' 템플릿을 저장했습니다.`);
    return true;
    } catch (error) {
      console.error('템플릿 저장 중 오류:', error);
      alert(`템플릿 저장 중 오류가 발생했습니다: ${error.message}`);
      return false;
    }
  };

  // 템플릿 불러오기 함수
  const loadTemplate = (type, index) => {
    try {
    if (!templates[type] || !templates[type][index]) {
        console.error('템플릿을 찾을 수 없음:', { type, index, availableTypes: Object.keys(templates) });
      alert('템플릿을 찾을 수 없습니다.');
        return null;
      }
      return templates[type][index].data;
    } catch (error) {
      console.error('템플릿 로드 중 오류:', error);
      alert(`템플릿 로드 중 오류가 발생했습니다: ${error.message}`);
      return null;
    }
  };

  // 템플릿 삭제 함수
  const deleteTemplate = (type, index) => {
    try {
      if (!templates[type] || !templates[type][index]) {
        console.error('삭제할 템플릿을 찾을 수 없음:', { type, index });
        alert('삭제할 템플릿을 찾을 수 없습니다.');
        return false;
      }
      
      const templateToDelete = templates[type][index];
      
      if (!confirm(`'${templateToDelete.name}' 템플릿을 정말 삭제하시겠습니까?`)) {
        return false;
      }
    
    const newTemplates = {...templates};
    newTemplates[type] = newTemplates[type].filter((_, i) => i !== index);
    
    setTemplates(newTemplates);
    
      // 로컬 스토리지에 저장
      try {
    localStorage.setItem(localStorageKey, JSON.stringify(newTemplates)); 
      } catch (storageError) {
        console.error('템플릿 삭제 후 저장 오류 (로컬 스토리지):', storageError);
        alert('템플릿 삭제 후 저장하는 중 오류가 발생했습니다.');
        return false;
      }
      
      alert(`'${templateToDelete.name}' 템플릿을 삭제했습니다.`);
      return true;
    } catch (error) {
      console.error('템플릿 삭제 중 오류:', error);
      alert(`템플릿 삭제 중 오류가 발생했습니다: ${error.message}`);
      return false;
    }
  };

  // 데이터 내보내기 함수 추가
  const exportTemplates = () => {
    try {
      if (Object.keys(templates).length === 0) {
        alert('내보낼 템플릿이 없습니다.');
        return null;
      }
      
      const exportData = JSON.stringify(templates, null, 2);
      return exportData;
    } catch (error) {
      console.error('템플릿 내보내기 중 오류:', error);
      alert(`템플릿 내보내기 중 오류가 발생했습니다: ${error.message}`);
      return null;
    }
  };

  // 데이터 가져오기 함수 추가
  const importTemplates = (jsonData) => {
    try {
      if (!jsonData) {
        alert('가져올 템플릿 데이터가 없습니다.');
        return false;
      }
      
      const importedData = JSON.parse(jsonData);
      
      // 구조 검증
      if (!importedData || typeof importedData !== 'object' || Array.isArray(importedData)) {
        alert('유효하지 않은 템플릿 데이터 형식입니다.');
        return false;
      }
      
      if (Object.keys(importedData).length === 0) {
        alert('가져올 템플릿이 없습니다.');
        return false;
      }
      
      // 기존 데이터와 병합 여부 확인
      if (Object.keys(templates).length > 0) {
        if (!confirm('기존 템플릿과 병합하시겠습니까? 취소를 선택하면 기존 템플릿이 모두 대체됩니다.')) {
          // 대체
          setTemplates(importedData);
          localStorage.setItem(localStorageKey, JSON.stringify(importedData));
          alert('템플릿을 성공적으로 가져왔습니다. 기존 템플릿을 대체했습니다.');
          return true;
        }
        
        // 병합
        const mergedTemplates = {...templates};
        
        // 각 타입별로 병합
        Object.keys(importedData).forEach(type => {
          if (!mergedTemplates[type]) {
            mergedTemplates[type] = [];
          }
          
          // 중복 이름 확인하며 병합
          importedData[type].forEach(template => {
            const existingIndex = mergedTemplates[type].findIndex(t => t.name === template.name);
            if (existingIndex >= 0) {
              // 날짜 비교해서 더 새로운 것으로 업데이트
              const existingDate = new Date(mergedTemplates[type][existingIndex].updatedAt || mergedTemplates[type][existingIndex].createdAt);
              const importedDate = new Date(template.updatedAt || template.createdAt);
              
              if (importedDate > existingDate) {
                mergedTemplates[type][existingIndex] = template;
              }
            } else {
              mergedTemplates[type].push(template);
            }
          });
        });
        
        setTemplates(mergedTemplates);
        localStorage.setItem(localStorageKey, JSON.stringify(mergedTemplates));
        alert('템플릿을 성공적으로 가져와서 기존 템플릿과 병합했습니다.');
      } else {
        // 기존 데이터가 없으면 바로 가져오기
        setTemplates(importedData);
        localStorage.setItem(localStorageKey, JSON.stringify(importedData));
        alert('템플릿을 성공적으로 가져왔습니다.');
      }
      
    return true;
    } catch (error) {
      console.error('템플릿 가져오기 중 오류:', error);
      alert(`템플릿 가져오기 중 오류가 발생했습니다: ${error.message}`);
      return false;
    }
  };

  return {
    templates,
    templateName,
    setTemplateName,
    saveTemplate,
    loadTemplate,
    deleteTemplate,
    exportTemplates,
    importTemplates
  };
} 