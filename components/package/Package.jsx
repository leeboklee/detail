'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Input, Textarea, Chip } from "@heroui/react";
import { PackageTable } from '../ui/EnhancedTable';

// 패키지 편집 모달 컴포넌트
function PackageEditModal({ isOpen, onClose, packageData, onSave, isNew = false }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    includes: [],
    salesPeriod: {
      start: '',
      end: ''
    },
    stayPeriod: {
      start: '',
      end: ''
    },
    productComposition: '',
    notes: [],
    constraints: []
  });

  const [newInclude, setNewInclude] = useState('');
  const [newNote, setNewNote] = useState('');
  const [newConstraint, setNewConstraint] = useState('');

  useEffect(() => {
    if (packageData) {
      setFormData(packageData);
    }
  }, [packageData]);

  const handleSave = useCallback(() => {
    onSave(formData);
    onClose();
  }, [formData, onSave, onClose]);

  const handleAddInclude = useCallback(() => {
    if (newInclude.trim()) {
      setFormData(prev => ({
        ...prev,
        includes: [...prev.includes, newInclude.trim()]
      }));
      setNewInclude('');
    }
  }, [newInclude]);

  const handleRemoveInclude = useCallback((index) => {
    setFormData(prev => ({
      ...prev,
      includes: prev.includes.filter((_, i) => i !== index)
    }));
  }, []);

  const handleAddNote = useCallback(() => {
    if (newNote.trim()) {
      setFormData(prev => ({
        ...prev,
        notes: [...prev.notes, newNote.trim()]
      }));
      setNewNote('');
    }
  }, [newNote]);

  const handleRemoveNote = useCallback((index) => {
    setFormData(prev => ({
      ...prev,
      notes: prev.notes.filter((_, i) => i !== index)
    }));
  }, []);

  const handleAddConstraint = useCallback(() => {
    if (newConstraint.trim()) {
      setFormData(prev => ({
        ...prev,
        constraints: [...prev.constraints, newConstraint.trim()]
      }));
      setNewConstraint('');
    }
  }, [newConstraint]);

  const handleRemoveConstraint = useCallback((index) => {
    setFormData(prev => ({
      ...prev,
      constraints: prev.constraints.filter((_, i) => i !== index)
    }));
  }, []);

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      size="lg" 
      scrollBehavior="inside"
      classNames={{
        base: "max-w-4xl mx-auto w-[95vw] sm:w-full z-[9999]",
        wrapper: "p-4 sm:p-6 z-[9998]",
        body: "p-4 sm:p-6 overflow-y-auto max-h-[80vh]",
        header: "border-b border-gray-200 pb-4",
        footer: "border-t border-gray-200 pt-4"
      }}
      backdrop="blur"
      isDismissable={true}
      isKeyboardDismissDisabled={false}
    >
      <ModalContent className="overflow-hidden">
        <ModalHeader className="text-lg sm:text-xl font-semibold text-gray-900 bg-white sticky top-0 z-10">
          {isNew ? '새 패키지 추가' : '패키지 편집'}
        </ModalHeader>
        <ModalBody className="overflow-y-auto max-h-[70vh] px-4 sm:px-6 py-4">
          <div className="space-y-4 sm:space-y-6">
            <Input
              label="패키지명"
              placeholder="패키지 이름을 입력하세요"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                name: e.target.value
              }))}
              classNames={{
                input: "text-gray-800 bg-white border-gray-300 text-sm sm:text-base",
                label: "text-gray-700 font-medium mb-2 text-sm sm:text-base",
                inputWrapper: "h-10 sm:h-12"
              }}
            />
            
            <Textarea
              label="패키지 설명"
              placeholder="패키지에 대한 상세한 설명을 입력하세요"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                description: e.target.value
              }))}
              minRows={3}
              classNames={{
                input: "text-gray-800 bg-white border-gray-300 text-sm sm:text-base",
                label: "text-gray-700 font-medium mb-2 text-sm sm:text-base",
                inputWrapper: "min-h-[80px]"
              }}
            />
            
            <Input
              label="가격"
              type="number"
              placeholder="0"
              value={formData.price}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                price: parseInt(e.target.value) || 0
              }))}
              startContent={
                <div className="pointer-events-none flex items-center">
                  <span className="text-gray-500 text-small">₩</span>
                </div>
              }
              classNames={{
                input: "text-gray-800 bg-white border-gray-300 text-sm sm:text-base",
                label: "text-gray-700 font-medium mb-2 text-sm sm:text-base",
                inputWrapper: "h-10 sm:h-12"
              }}
            />

            {/* 판매기간 */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-3 block">판매기간</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <Input
                  type="text"
                  placeholder="MMDD (예: 0804)"
                  value={formData.salesPeriod.start}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 4);
                    setFormData(prev => ({
                      ...prev,
                      salesPeriod: { ...prev.salesPeriod, start: value }
                    }));
                  }}
                  classNames={{
                    input: "text-gray-800 bg-white border-gray-300 text-sm text-center font-mono",
                    inputWrapper: "h-10 sm:h-12"
                  }}
                />
                <Input
                  type="text"
                  placeholder="MMDD (예: 0831)"
                  value={formData.salesPeriod.end}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 4);
                    setFormData(prev => ({
                      ...prev,
                      salesPeriod: { ...prev.salesPeriod, end: value }
                    }));
                  }}
                  classNames={{
                    input: "text-gray-800 bg-white border-gray-300 text-sm text-center font-mono",
                    inputWrapper: "h-10 sm:h-12"
                  }}
                />
              </div>
            </div>

            {/* 투숙기간 */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-3 block">투숙 적용기간</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <Input
                  type="text"
                  placeholder="MMDD (예: 0824)"
                  value={formData.stayPeriod.start}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 4);
                    setFormData(prev => ({
                      ...prev,
                      stayPeriod: { ...prev.stayPeriod, start: value }
                    }));
                  }}
                  classNames={{
                    input: "text-gray-800 bg-white border-gray-300 text-sm text-center font-mono",
                    inputWrapper: "h-10 sm:h-12"
                  }}
                />
                <Input
                  type="text"
                  placeholder="MMDD (예: 0930)"
                  value={formData.stayPeriod.end}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 4);
                    setFormData(prev => ({
                      ...prev,
                      stayPeriod: { ...prev.stayPeriod, end: value }
                    }));
                  }}
                  classNames={{
                    input: "text-gray-800 bg-white border-gray-300 text-sm text-center font-mono",
                    inputWrapper: "h-10 sm:h-12"
                  }}
                />
              </div>
            </div>

            {/* 상품구성 */}
            <Textarea
              label="상품구성"
              placeholder="예: 객실 1박 + 조식 2인 + 스파 이용권"
              value={formData.productComposition}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                productComposition: e.target.value
              }))}
              minRows={3}
              classNames={{
                input: "text-gray-800 bg-white border-gray-300 text-sm sm:text-base",
                label: "text-gray-700 font-medium mb-2 text-sm sm:text-base",
                inputWrapper: "min-h-[80px]"
              }}
            />

            <div>
              <label className="text-sm font-medium text-gray-700 mb-3 block">유의사항/참고사항</label>
              
              {/* 기존 참고사항 표시 */}
              {formData.notes.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {formData.notes.map((note, index) => (
                    <Chip
                      key={index}
                      color="warning"
                      variant="flat"
                      onClose={() => handleRemoveNote(index)}
                      className="h-8 text-gray-800 text-xs sm:text-sm"
                    >
                      {note}
                    </Chip>
                  ))}
                </div>
              )}

              {/* 새 참고사항 추가 */}
              <div className="flex flex-col sm:flex-row gap-2 mb-4">
                <Input
                  size="sm"
                  placeholder="유의사항 입력"
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  classNames={{
                    input: "text-gray-800 bg-white border-gray-300 text-sm"
                  }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && e.target.value.trim()) {
                      handleAddNote();
                    }
                  }}
                />
                <Button
                  size="sm"
                  color="warning"
                  className="h-10 w-full sm:w-auto"
                  onPress={handleAddNote}
                >
                  추가
                </Button>
              </div>
            </div>
          </div>
        </ModalBody>
        <ModalFooter className="flex flex-col sm:flex-row gap-2 bg-white sticky bottom-0 z-10">
          <Button color="primary" onPress={handleSave} disabled={!formData.name.trim()} className="w-full sm:w-auto">
            저장
          </Button>
          <Button variant="light" onPress={onClose} className="w-full sm:w-auto">
            취소
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default function Package({ value = [], onChange }) {
  const [editingPackage, setEditingPackage] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isTemplateListOpen, setIsTemplateListOpen] = useState(false);
  const [templateList, setTemplateList] = useState([]);

  // 컴포넌트 마운트 시 템플릿 목록 로드
  useEffect(() => {
    try {
      const savedTemplates = JSON.parse(localStorage.getItem('packageTemplates') || '[]');
      setTemplateList(savedTemplates);
    } catch (error) {
      console.error('템플릿 로드 실패:', error);
      setTemplateList([]);
    }
  }, []);

  const packages = value || [];

  const handleAddPackage = () => {
    setEditingPackage({
      name: '',
      description: '',
      salesPeriod: {
        start: '',
        end: ''
      },
      stayPeriod: {
        start: '',
        end: ''
      },
      productComposition: '',
      notes: []
    });
    setIsEditing(true);
    setShowAddForm(true);
  };

  const handleEditPackage = (packageData, index) => {
    setEditingPackage({ ...packageData, index });
    setIsEditing(true);
    setShowAddForm(false);
  };

  const handleDeletePackage = (packageData, index) => {
    const updatedPackages = packages.filter((_, i) => i !== index);
    onChange(updatedPackages);
  };

  const handleSavePackage = () => {
    try {
      // 필수 필드 검증
      if (!editingPackage?.name?.trim()) {
        alert('패키지명을 입력해주세요.');
        return;
      }

      let updatedPackages;
      
      if (showAddForm) {
        // 새 패키지 추가
        const newPackage = {
          ...editingPackage,
          id: Date.now().toString(),
          createdAt: new Date().toISOString()
        };
        updatedPackages = [...packages, newPackage];
        alert('새 패키지가 성공적으로 저장되었습니다!');
      } else {
        // 기존 패키지 수정
        updatedPackages = packages.map((pkg, index) => 
          index === editingPackage.index ? { ...editingPackage, updatedAt: new Date().toISOString() } : pkg
        );
        alert('패키지가 성공적으로 수정되었습니다!');
      }
      
      onChange(updatedPackages);
      setIsEditing(false);
      setEditingPackage(null);
      setShowAddForm(false);
      
      console.log('패키지 저장 완료:', updatedPackages);
    } catch (error) {
      console.error('패키지 저장 오류:', error);
      alert('패키지 저장에 실패했습니다: ' + error.message);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingPackage(null);
    setShowAddForm(false);
  };

  const handleFieldChange = useCallback((field, value) => {
    setEditingPackage(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const handleAddNote = useCallback((note) => {
    if (note.trim()) {
      setEditingPackage(prev => ({
        ...prev,
        notes: [...(prev.notes || []), note.trim()]
      }));
    }
  }, []);

  const handleRemoveNote = useCallback((index) => {
    setEditingPackage(prev => ({
      ...prev,
      notes: prev.notes.filter((_, i) => i !== index)
    }));
  }, []);

  // 패키지 템플릿 저장 함수
  const savePackageTemplate = () => {
    try {
      const templateName = prompt('템플릿 이름을 입력하세요:');
      if (!templateName) return;

      const existingTemplates = JSON.parse(localStorage.getItem('packageTemplates') || '[]');
      const newTemplate = {
        id: Date.now(),
        name: templateName.trim(),
        packages: packages,
        createdAt: new Date().toISOString()
      };
      
      const updatedTemplates = [...existingTemplates, newTemplate];
      localStorage.setItem('packageTemplates', JSON.stringify(updatedTemplates));
      setTemplateList(updatedTemplates);
      alert('패키지 템플릿이 성공적으로 저장되었습니다.');
    } catch (error) {
      console.error('템플릿 저장 오류:', error);
      alert('템플릿 저장에 실패했습니다: ' + error.message);
    }
  };

  // 패키지 템플릿 목록 불러오기 함수
  const fetchTemplateList = () => {
    try {
      const savedTemplates = JSON.parse(localStorage.getItem('packageTemplates') || '[]');
      setTemplateList(savedTemplates);
      setIsTemplateListOpen(true);
    } catch (error) {
      console.error('템플릿 목록 불러오기 오류:', error);
      alert('템플릿 목록을 불러올 수 없습니다: ' + error.message);
    }
  };

  // 선택된 템플릿 불러오기 함수
  const loadSelectedTemplate = (template) => {
    try {
      if (template.packages && template.packages.length > 0) {
        onChange(template.packages);
        setIsTemplateListOpen(false);
        alert(`${template.name} 템플릿이 성공적으로 불러와졌습니다.`);
      } else {
        alert('템플릿에 패키지가 없습니다.');
      }
    } catch (error) {
      console.error('템플릿 불러오기 오류:', error);
      alert('템플릿을 불러올 수 없습니다: ' + error.message);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* 헤더 */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">패키지 관리</h2>
            <p className="text-sm sm:text-base text-gray-600 mt-1">호텔의 특별 패키지를 관리하고 편집할 수 있습니다.</p>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            color="primary"
            variant="bordered"
            onPress={savePackageTemplate}
            className="text-sm sm:text-base"
          >
            패키지 템플릿 저장
          </Button>
          <Button
            color="secondary"
            variant="bordered"
            onPress={fetchTemplateList}
            className="text-sm sm:text-base"
          >
            패키지 템플릿 목록
          </Button>
        </div>
      </div>

      {/* 편집 폼 */}
      {isEditing && (
        <div className="mb-6 p-4 sm:p-6 bg-blue-50 rounded-lg border-2 border-blue-200 relative z-10">
          <h4 className="text-lg font-semibold text-blue-800 mb-4 sticky top-0 bg-blue-50 py-2">
            {showAddForm ? '새 패키지 추가' : '패키지 편집'}
          </h4>
          
          <div className="space-y-4 sm:space-y-6 overflow-y-auto max-h-[80vh]">
            <Input
              label="패키지명"
              placeholder="패키지 이름을 입력하세요"
              value={editingPackage?.name || ''}
              onChange={(e) => handleFieldChange('name', e.target.value)}
              classNames={{
                input: "text-gray-800 bg-white border-gray-300 text-sm sm:text-base",
                label: "text-gray-700 font-medium mb-3 text-sm sm:text-base block",
                inputWrapper: "h-10 sm:h-12"
              }}
            />
            
            <Textarea
              label="패키지 설명"
              placeholder="패키지에 대한 상세한 설명을 입력하세요"
              value={editingPackage?.description || ''}
              onChange={(e) => handleFieldChange('description', e.target.value)}
              minRows={3}
              classNames={{
                input: "text-gray-800 bg-white border-gray-300 text-sm sm:text-base",
                label: "text-gray-700 font-medium mb-3 text-sm sm:text-base block",
                inputWrapper: "min-h-[80px]"
              }}
            />
            
            {/* 가격 필드 제거됨 */}

            {/* 판매기간 */}
            <div className="mt-6">
              <label className="text-sm font-medium text-gray-700 mb-3 block">판매기간</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <Input
                  type="text"
                  placeholder="MMDD (예: 1031)"
                  value={editingPackage?.salesPeriod?.start || ''}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 4);
                    console.log('판매기간 시작:', value); // 디버깅용
                    handleFieldChange('salesPeriod', {
                      ...editingPackage?.salesPeriod,
                      start: value
                    });
                  }}
                  classNames={{
                    input: "text-gray-800 bg-white border-gray-300 text-sm text-center font-mono",
                    inputWrapper: "h-10 sm:h-12"
                  }}
                />
                <Input
                  type="text"
                  placeholder="MMDD (예: 1102)"
                  value={editingPackage?.salesPeriod?.end || ''}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 4);
                    console.log('판매기간 종료:', value); // 디버깅용
                    handleFieldChange('salesPeriod', {
                      ...editingPackage?.salesPeriod,
                      end: value
                    });
                  }}
                  classNames={{
                    input: "text-gray-800 bg-white border-gray-300 text-sm text-center font-mono",
                    inputWrapper: "h-10 sm:h-12"
                  }}
                />
              </div>
              {/* 현재 입력된 값 표시 (디버깅용) */}
              {editingPackage?.salesPeriod?.start || editingPackage?.salesPeriod?.end ? (
                <div className="mt-2 text-xs text-gray-500">
                  입력된 값: {editingPackage?.salesPeriod?.start || '없음'} ~ {editingPackage?.salesPeriod?.end || '없음'}
                </div>
              ) : null}
            </div>

            {/* 투숙기간 */}
            <div className="mt-6">
              <label className="text-sm font-medium text-gray-700 mb-3 block">투숙 적용기간</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <Input
                  type="text"
                  placeholder="MMDD (예: 0824)"
                  value={editingPackage?.stayPeriod?.start || ''}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 4);
                    handleFieldChange('stayPeriod', {
                      ...editingPackage?.stayPeriod,
                      start: value
                    });
                  }}
                  classNames={{
                    input: "text-gray-800 bg-white border-gray-300 text-sm text-center font-mono",
                    inputWrapper: "h-10 sm:h-12"
                  }}
                />
                <Input
                  type="text"
                  placeholder="MMDD (예: 0930)"
                  value={editingPackage?.stayPeriod?.end || ''}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 4);
                    handleFieldChange('stayPeriod', {
                      ...editingPackage?.stayPeriod,
                      end: value
                    });
                  }}
                  classNames={{
                    input: "text-gray-800 bg-white border-gray-300 text-sm text-center font-mono",
                    inputWrapper: "h-10 sm:h-12"
                  }}
                />
              </div>
            </div>

            {/* 상품구성 */}
            <div className="mt-6">
              <Textarea
                label="상품구성"
                placeholder="예: 객실 1박 + 조식 2인 + 스파 이용권"
                value={editingPackage?.productComposition || ''}
                onChange={(e) => handleFieldChange('productComposition', e.target.value)}
                minRows={3}
                classNames={{
                  input: "text-gray-800 bg-white border-gray-300 text-sm sm:text-base",
                  label: "text-gray-700 font-medium mb-3 text-sm sm:text-base block",
                  inputWrapper: "min-h-[80px]"
                }}
              />
            </div>

            {/* 유의사항/참고사항 */}
            <div className="mt-6">
              <label className="text-sm font-medium text-gray-700 mb-3 block">
                유의사항/참고사항
              </label>
              
              {/* 기존 참고사항 표시 */}
              {editingPackage?.notes?.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {editingPackage.notes.map((note, index) => (
                    <Chip
                      key={index}
                      color="warning"
                      variant="flat"
                      onClose={() => handleRemoveNote(index)}
                      className="h-8 text-gray-800 text-xs sm:text-sm"
                    >
                      {note}
                    </Chip>
                  ))}
                </div>
              )}

              {/* 새 참고사항 추가 */}
              <div className="flex flex-col sm:flex-row gap-2 mb-4">
                <Input
                  size="sm"
                  placeholder="유의사항 입력"
                  classNames={{
                    input: "text-gray-800 bg-white border-gray-300 text-sm"
                  }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && e.target.value.trim()) {
                      handleAddNote(e.target.value);
                      e.target.value = '';
                    }
                  }}
                />
                <Button
                  size="sm"
                  color="warning"
                  className="h-10 w-full sm:w-auto"
                  onPress={(e) => {
                    const input = e.target.closest('div').querySelector('input');
                    if (input.value.trim()) {
                      handleAddNote(input.value);
                      input.value = '';
                    }
                  }}
                >
                  추가
                </Button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4 sticky bottom-0 bg-blue-50 pb-2">
              <Button
                color="primary"
                onPress={handleSavePackage}
                disabled={!editingPackage?.name?.trim()}
                className="w-full sm:w-auto"
              >
                저장
              </Button>
              <Button
                color="danger"
                variant="light"
                onPress={handleCancelEdit}
                className="w-full sm:w-auto"
              >
                취소
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="mt-6 sm:mt-8">
        <PackageTable
          packages={packages}
          onEdit={handleEditPackage}
          onDelete={handleDeletePackage}
          onAdd={handleAddPackage}
        />
      </div>

      {/* 템플릿 목록 모달 */}
      <Modal
        isOpen={isTemplateListOpen}
        onClose={() => setIsTemplateListOpen(false)}
        size="lg"
        placement="center"
        classNames={{
          base: "max-w-2xl mx-auto w-[95vw] sm:w-full z-[9999]",
          wrapper: "p-4 sm:p-6 z-[9998]",
          body: "p-4 sm:p-6 overflow-y-auto max-h-[80vh]",
          header: "border-b border-gray-200 pb-4",
          footer: "border-t border-gray-200 pt-4"
        }}
        backdrop="blur"
        isDismissable={true}
        isKeyboardDismissDisabled={false}
      >
        <ModalContent className="overflow-hidden">
          <ModalHeader className="text-lg sm:text-xl font-semibold text-gray-900 bg-white sticky top-0 z-10">패키지 템플릿 목록</ModalHeader>
          <ModalBody className="overflow-y-auto max-h-[70vh] px-4 sm:px-6 py-4">
            {templateList.length > 0 ? (
              <div className="space-y-3 sm:space-y-4">
                {templateList.map((template, index) => (
                  <div key={index} className="border rounded-lg p-3 sm:p-4 hover:bg-gray-50">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm sm:text-base">{template.name}</h4>
                        <p className="text-xs sm:text-sm text-gray-500 mt-1">
                          생성일: {new Date(template.createdAt).toLocaleDateString()}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-600 mt-1">
                          패키지 개수: {template.packages?.length || 0}개
                        </p>
                      </div>
                      <Button
                        color="primary"
                        size="sm"
                        onPress={() => loadSelectedTemplate(template)}
                        className="w-full sm:w-auto"
                      >
                        불러오기
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 sm:py-8">
                <p className="text-gray-500 text-sm sm:text-base">저장된 템플릿이 없습니다.</p>
              </div>
            )}
          </ModalBody>
          <ModalFooter className="flex flex-col sm:flex-row gap-2 bg-white sticky bottom-0 z-10">
            <Button variant="light" onPress={() => setIsTemplateListOpen(false)} className="w-full sm:w-auto">
              닫기
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
} 