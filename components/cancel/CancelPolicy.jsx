'use client';

import React, { useState, useEffect } from 'react';
import { Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Input, Chip } from '@heroui/react';
import styles from './CancelPolicy.module.css';

export default function CancelPolicy({ value = {}, onChange }) {
  const cancelInfo = value || {};
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isLoadModalOpen, setIsLoadModalOpen] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  // 템플릿 저장
  const handleSaveTemplate = () => {
    if (!templateName.trim()) return;
    
    try {
      const existingTemplates = JSON.parse(localStorage.getItem('cancelPolicyTemplates') || '[]');
      const newTemplate = {
        id: Date.now(),
        name: templateName.trim(),
        data: cancelInfo,
        createdAt: new Date().toISOString()
      };
      
      const updatedTemplates = [...existingTemplates, newTemplate];
      localStorage.setItem('cancelPolicyTemplates', JSON.stringify(updatedTemplates));
      
      setTemplates(updatedTemplates);
      setTemplateName('');
      setIsSaveModalOpen(false);
    } catch (error) {
      console.error('템플릿 저장 실패:', error);
    }
  };

  // 템플릿 불러오기
  const handleLoadTemplate = () => {
    if (!selectedTemplate) return;
    
    try {
      const template = templates.find(t => t.id === selectedTemplate);
      if (template && onChange) {
        onChange(template.data);
      }
      setIsLoadModalOpen(false);
      setSelectedTemplate(null);
    } catch (error) {
      console.error('템플릿 불러오기 실패:', error);
    }
  };

  // 템플릿 삭제
  const handleDeleteTemplate = (templateId) => {
    try {
      const updatedTemplates = templates.filter(t => t.id !== templateId);
      localStorage.setItem('cancelPolicyTemplates', JSON.stringify(updatedTemplates));
      setTemplates(updatedTemplates);
      if (selectedTemplate === templateId) {
        setSelectedTemplate(null);
      }
    } catch (error) {
      console.error('템플릿 삭제 실패:', error);
    }
  };

  // 컴포넌트 마운트 시 템플릿 로드
  useEffect(() => {
    try {
      const savedTemplates = JSON.parse(localStorage.getItem('cancelPolicyTemplates') || '[]');
      setTemplates(savedTemplates);
    } catch (error) {
      console.error('템플릿 로드 실패:', error);
      setTemplates([]);
    }
  }, []);

  const handleUpdate = (field, value) => {
    const updatedInfo = { ...cancelInfo, [field]: value };
    if (onChange) onChange(updatedInfo);
  };

  const handleRuleChange = (season, index, prop, value) => {
    const rules = [...(cancelInfo[season] || [])];
    rules[index] = { ...rules[index], [prop]: value };
    handleUpdate(season, rules);
  };

  const addRule = (season) => {
    const rules = [...(cancelInfo[season] || []), { days: '', rate: '' }];
    handleUpdate(season, rules);
  };

  const removeRule = (season, index) => {
    const rules = (cancelInfo[season] || []).filter((_, i) => i !== index);
    handleUpdate(season, rules);
  };

  const renderRulesFor = (season, title) => (
    <div className={styles.seasonSection}>
      <h3 className="text-xl font-semibold mb-3">{title}</h3>
      {(cancelInfo[season] || []).map((rule, index) => (
        <div key={index} className="grid grid-cols-12 gap-2 mb-2 items-center">
          <div className="col-span-5">
            <input
              type="text"
              className={styles.input}
              placeholder="취소 시점 (예: 10일 전)"
              value={rule.days}
              onChange={(e) => handleRuleChange(season, index, 'days', e.target.value)}
            />
          </div>
          <div className="col-span-5">
            <input
              type="text"
              className={styles.input}
              placeholder="환불 규정 (예: 20% 위약금)"
              value={rule.rate}
              onChange={(e) => handleRuleChange(season, index, 'rate', e.target.value)}
            />
          </div>
          <div className="col-span-2">
            <button onClick={() => removeRule(season, index)} className={styles.removeButton}>삭제</button>
          </div>
        </div>
      ))}
      <button onClick={() => addRule(season)} className={styles.addButton}>+ 규정 추가</button>
    </div>
  );

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">취소 및 환불 규정 관리</h2>
        <div className="flex gap-2">
          <Button
            size="sm"
            color="primary"
            variant="bordered"
            onPress={() => setIsSaveModalOpen(true)}
            startContent="💾"
          >
            템플릿 저장
          </Button>
          <Button
            size="sm"
            color="secondary"
            variant="bordered"
            onPress={() => setIsLoadModalOpen(true)}
            startContent="📂"
          >
            템플릿 불러오기
          </Button>
        </div>
      </div>
      
      <div className="mb-6">
        <label className="block text-lg font-medium mb-2">규정 설명</label>
        <textarea
          className={styles.textarea}
          placeholder="예약 취소 및 환불 규정에 대한 전반적인 설명을 입력하세요."
          value={cancelInfo.description || ''}
          onChange={(e) => handleUpdate('description', e.target.value)}
          rows="3"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {renderRulesFor('offSeason', '비수기 규정')}
        {renderRulesFor('midSeason', '준성수기 규정')}
        {renderRulesFor('highSeason', '성수기 규정')}
      </div>

      <div className="mt-6">
        <label className="block text-lg font-medium mb-2">추가 참고사항</label>
        <textarea
          className={styles.textarea}
          placeholder="기타 참고사항이나 특별 정책을 입력하세요."
          value={cancelInfo.notes || ''}
          onChange={(e) => handleUpdate('notes', e.target.value)}
          rows="3"
        />
      </div>

      {/* 템플릿 저장 모달 */}
      <Modal 
        isOpen={isSaveModalOpen} 
        onClose={() => setIsSaveModalOpen(false)}
        size="sm"
        placement="center"
        classNames={{
          base: "max-w-md mx-auto",
          wrapper: "flex items-center justify-center p-4"
        }}
      >
        <ModalContent>
          <ModalHeader className="text-lg font-semibold">템플릿 저장</ModalHeader>
          <ModalBody className="pb-6">
            <Input
              label="템플릿 이름"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="템플릿 이름을 입력하세요"
              size="sm"
              classNames={{
                input: "text-gray-800 bg-white border-gray-300",
                label: "text-gray-700 font-medium"
              }}
            />
            <p className="text-sm text-gray-500 mt-2">
              현재 취소규정 설정을 템플릿으로 저장합니다.
            </p>
          </ModalBody>
          <ModalFooter>
            <Button color="danger" variant="light" onPress={() => setIsSaveModalOpen(false)}>
              취소
            </Button>
            <Button color="primary" onPress={handleSaveTemplate}>
              저장
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* 템플릿 불러오기 모달 */}
      <Modal 
        isOpen={isLoadModalOpen} 
        onClose={() => setIsLoadModalOpen(false)} 
        size="lg"
        placement="center"
        classNames={{
          base: "max-w-2xl mx-auto",
          wrapper: "flex items-center justify-center p-4"
        }}
      >
        <ModalContent>
          <ModalHeader>템플릿 불러오기</ModalHeader>
          <ModalBody>
            {templates.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">저장된 템플릿이 없습니다.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedTemplate === template.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedTemplate(template.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-800">{template.name}</h4>
                        <p className="text-sm text-gray-500">
                          생성일: {new Date(template.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          color="danger"
                          variant="light"
                          onPress={() => handleDeleteTemplate(template.id)}
                        >
                          삭제
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button color="danger" variant="light" onPress={() => setIsLoadModalOpen(false)}>
              취소
            </Button>
            <Button
              color="primary"
              onPress={handleLoadTemplate}
              isDisabled={!selectedTemplate}
            >
              불러오기
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
} 