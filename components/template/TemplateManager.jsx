'use client';

import React, { useState, useEffect } from 'react';
import styles from './TemplateManager.module.css';
import useTemplates from '../../hooks/useTemplates';

export default function TemplateManager({ type, currentData, onLoad }) {
  const {
    templates,
    templateName,
    setTemplateName,
    saveTemplate,
    loadTemplate,
    deleteTemplate
  } = useTemplates();

  const [selectedTemplateIndex, setSelectedTemplateIndex] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // 타입에 따른 템플릿 유효성 검사
  useEffect(() => {
    if (!templates || !templates[type]) return;
    // 선택된 인덱스가 유효하지 않을 경우 초기화
    if (selectedTemplateIndex && parseInt(selectedTemplateIndex, 10) >= templates[type].length) {
      setSelectedTemplateIndex('');
    }
  }, [templates, type, selectedTemplateIndex]);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      if (!templateName.trim()) {
        alert('템플릿 이름을 입력해주세요.');
        return;
      }

      const result = await saveTemplate(type, currentData);
      if (result) {
        setSelectedTemplateIndex('');
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
      if (selectedTemplateIndex === '') {
        alert('불러올 템플릿을 선택해주세요.');
        return;
      }
      
      setIsLoading(true);
      const index = parseInt(selectedTemplateIndex, 10);
      
      // 유효성 검사 추가
      if (!templates[type] || !templates[type][index]) {
        alert('유효하지 않은 템플릿입니다.');
        return;
      }
      
      const data = loadTemplate(type, index);
      if (data) {
        onLoad(data);
        alert(`'${templates[type][index].name}' 템플릿을 불러왔습니다.`);
      } else {
        alert('템플릿 데이터를 불러올 수 없습니다.');
      }
    } catch (error) {
      console.error('템플릿 로드 오류:', error);
      alert(`템플릿 로드 중 오류가 발생했습니다: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      if (selectedTemplateIndex === '') {
        alert('삭제할 템플릿을 선택해주세요.');
        return;
      }
      
      setIsDeleting(true);
      const index = parseInt(selectedTemplateIndex, 10);
      
      // 유효성 검사 추가
      if (!templates[type] || !templates[type][index]) {
        alert('유효하지 않은 템플릿입니다.');
        return;
      }
      
      if (deleteTemplate(type, index)) {
        alert(`'${templates[type][index].name}' 템플릿을 삭제했습니다.`);
        setSelectedTemplateIndex('');
      } else {
        alert('템플릿 삭제가 취소되었습니다.');
      }
    } catch (error) {
      console.error('템플릿 삭제 오류:', error);
      alert(`템플릿 삭제 중 오류가 발생했습니다: ${error.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className={styles.templatesSection}>
      <h4>{type === 'price' ? '가격 템플릿' : '취소 정책 템플릿'}</h4>
      <div className={styles.templateControls}>
        <div className={styles.saveTemplate}>
          <input
            type="text"
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            className={styles.templateNameInput}
            placeholder="템플릿 이름 입력 (예: 소노벨 변산 - 가격)"
            disabled={isSaving}
          />
          <button 
            onClick={handleSave} 
            className={styles.saveButton}
            disabled={isSaving || !templateName.trim()}
          >
            {isSaving ? '저장 중...' : '현재 설정 저장'}
          </button>
        </div>

        <div className={styles.loadDeleteTemplate}>
          <select 
            value={selectedTemplateIndex}
            onChange={(e) => setSelectedTemplateIndex(e.target.value)}
            className={styles.templateSelect}
            disabled={isLoading || isDeleting}
          >
            <option value="">-- 템플릿 선택 --</option>
            {templates[type] && templates[type].map((template, index) => (
              <option key={index} value={index}>{template.name}</option>
            ))}
          </select>
          <button 
            onClick={handleLoad} 
            className={styles.loadButton} 
            disabled={selectedTemplateIndex === '' || isLoading}
          >
            {isLoading ? '불러오는 중...' : '불러오기'}
          </button>
          <button 
            onClick={handleDelete} 
            className={styles.deleteButton} 
            disabled={selectedTemplateIndex === '' || isDeleting}
          >
            {isDeleting ? '삭제 중...' : '삭제'}
          </button>
        </div>
      </div>
    </div>
  );
} 