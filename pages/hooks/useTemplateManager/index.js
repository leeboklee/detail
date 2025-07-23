'use client'

import { useState, useEffect } from 'react';
import { 
  saveTemplate, 
  saveTemplatesToStorage, 
  loadTemplatesFromStorage, 
  saveDefaultTemplate,
  saveSessionData
} from '@shared/utils/templateUtils.js';

/**
 * 템플릿 관리 커스텀 훅
 */
const useTemplateManager = (initialSectionStates, initialSectionSetters, initialSections) => {
  const [templates, setTemplates] = useState([]);
  const [templateName, setTemplateName] = useState('');
  
  // 초기화: 로컬 스토리지에서 템플릿 로드
  useEffect(() => {
    loadTemplatesFromStorage().then(storedTemplates => {
      if (Array.isArray(storedTemplates) && storedTemplates.length > 0) {
        console.log('저장된 템플릿 로드:', storedTemplates);
        setTemplates(storedTemplates);
      } else {
        console.log('저장된 템플릿 없음. 기본 템플릿 생성');
        const defaultTemplates = saveDefaultTemplate(initialSectionStates, []);
        setTemplates(defaultTemplates);
        saveTemplatesToStorage(defaultTemplates);
      }
    }).catch(error => {
      console.error('템플릿 로드 실패:', error);
      const defaultTemplates = saveDefaultTemplate(initialSectionStates, []);
      setTemplates(defaultTemplates);
      saveTemplatesToStorage(defaultTemplates);
    });
  }, [initialSectionStates]);
  
  // 템플릿 저장 핸들러
  const handleSaveTemplate = (sectionStates, sections) => {
    if (!templateName) {
      alert('템플릿 이름을 입력해주세요.');
      return;
    }

    // 현재 상태로 데이터 모음
    const templateData = {
      ...sectionStates,
      sections
    };

    try {
      const { updatedTemplates, isUpdate } = saveTemplate(templateName, templateData, templates);
      
      // 상태 업데이트
      setTemplates(updatedTemplates);
      
      // 로컬 스토리지에 저장
      if (saveTemplatesToStorage(updatedTemplates)) {
        alert(`"${templateName}" 템플릿이 ${isUpdate ? '업데이트' : '저장'}되었습니다.`);
        console.log('템플릿 저장 성공:', updatedTemplates);
      } else {
        alert('템플릿 저장에 실패했습니다.');
      }
    } catch (e) {
      console.error('템플릿 저장 실패:', e);
      alert('템플릿 저장에 실패했습니다.');
    }
  };

  // 템플릿 로드 핸들러
  const handleLoadTemplate = (index, sectionSetters, setSections) => {
    const selectedTemplate = templates[index];
    if (!selectedTemplate) {
      alert('선택한 템플릿을 찾을 수 없습니다.');
      return;
    }

    // 상태 업데이트
    Object.keys(sectionSetters).forEach(key => {
      // selectedTemplate.data에 해당 key가 있는 경우에만 업데이트
      if (selectedTemplate.data.hasOwnProperty(key)) { 
        sectionSetters[key](selectedTemplate.data[key]);
      } else {
        console.log(`Template data does not contain key: ${key}. Keeping current state.`);
      }
    });
    
    // 섹션 순서 업데이트 (템플릿에 sections가 있는 경우)
    if (selectedTemplate.data.hasOwnProperty('sections')) {
      setSections(selectedTemplate.data.sections);
    } else {
      setSections(initialSections); // 없으면 초기 순서로
    }
    
    setTemplateName(selectedTemplate.name);
    console.log('Template loaded:', selectedTemplate);
    alert(`템플릿 '${selectedTemplate.name}'을(를) 불러왔습니다.`);
  };

  // 템플릿 삭제 핸들러
  const handleDeleteTemplate = (index) => {
    const templateToDelete = templates[index];
    if (!templateToDelete) {
      alert('삭제할 템플릿을 찾을 수 없습니다.');
      return;
    }
    
    if (!confirm(`'${templateToDelete.name}' 템플릿을 정말 삭제하시겠습니까?`)) {
      return;
    }
    
    try {
      const updatedTemplates = templates.filter((_, i) => i !== index);
      setTemplates(updatedTemplates);
      
      if (saveTemplatesToStorage(updatedTemplates)) {
        alert('템플릿이 삭제되었습니다.');
      } else {
        alert('템플릿 삭제는 되었으나 저장소 업데이트에 실패했습니다.');
      }
    } catch (error) {
      console.error('템플릿 삭제 오류:', error);
      alert('템플릿을 삭제하는 중 오류가 발생했습니다.');
    }
  };

  // 섹션 순서 저장 핸들러
  const handleSaveSectionOrder = (sectionStates, sections) => {
    try {
      saveSessionData({
        ...sectionStates,
        sections
      });
      alert('섹션 순서가 저장되었습니다.');
    } catch (error) {
      console.error('섹션 순서 저장 실패:', error);
      alert('섹션 순서 저장에 실패했습니다.');
    }
  };

  return {
    templates,
    templateName,
    setTemplateName,
    handleSaveTemplate,
    handleLoadTemplate,
    handleDeleteTemplate,
    handleSaveSectionOrder
  };
};

export default useTemplateManager; 