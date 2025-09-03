'use client';

import React, { useState, useEffect, useCallback } from 'react';

import Labels from '@/src/shared/labels';
import { Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Input, Textarea, Chip } from "@heroui/react";
import { PackageTable } from '../ui/EnhancedTable';

// 기본 패키지 템플릿 데이터
const DEFAULT_PACKAGE_TEMPLATES = [
  {
    id: 'yongpyong-summer',
    name: '용평리조트 레이트 썸머 PKG',
    packages: [
      {
        id: 1,
        name: '용평리조트 레이트 썸머 PKG',
        description: '늦여름을 즐기는 특별한 패키지',
        salesPeriod: { start: '0827', end: '0829' },
        stayPeriod: { start: '0827', end: '1031' },
        productComposition: '객실1박 + 워터오후 OR 케이블카 + 레저(택1)',
        includes: [
          '객실 1박',
          '워터파크 오후권 또는 케이블카',
          '레저 선택 1개 (루지, 마운틴코스터, 사륜오토바이 중)'
        ],
        notes: [
          '판매/접수기간: 08.27~08.29',
          '투숙 적용기간: 8.27~10.31',
          '상품구성: 객실1박 + 워터오후 OR 케이블카 + 레저(택1)'
        ],
        constraints: [
          '루지: 매주 화요일 휴장',
          '마운틴코스터/사륜오토바이: 매주 월요일 휴장',
          '케이블카: 매주 월요일 휴장 (강풍/우천 시 휴장)',
          '워터파크: 매주 화/수요일 휴장',
          '워터파크 종일권 변경 시 현장에서 1인당 10,000원 추가 결제',
          '성수기기간(7/19-8/17) 워터파크 종일권 변경 시 1인당 20,000원 추가 결제'
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

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
    // 미리보기 트리거
    if (typeof window !== 'undefined' && window.triggerPreview) {
      window.triggerPreview('packages');
    }
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
        base: "max-w-4xl mx-auto w-[95vw] sm:w-full z-[99999]",
        wrapper: "p-4 sm:p-6 z-[99998]",
        body: "p-4 sm:p-6 overflow-y-auto max-h-[80vh]",
        header: "border-b border-gray-200 pb-4",
        footer: "border-t border-gray-200 pt-4"
      }}
      backdrop="opaque"
      isDismissable={true}
      isKeyboardDismissDisabled={false}
    >
      <ModalContent className="overflow-hidden bg-white">
        <ModalHeader className="text-lg sm:text-xl font-bold text-black bg-white sticky top-0 z-[99999] border-b border-gray-200">
          {isNew ? '새 패키지 추가' : '패키지 편집'}
        </ModalHeader>
        <ModalBody className="overflow-y-auto max-h-[70vh] px-4 sm:px-6 py-4 bg-white">
          <div className="space-y-4 sm:space-y-6">
            <div>
              <label className="block text-sm font-bold text-black mb-2">패키지명 *</label>
              <p className="text-xs text-gray-600 mb-3">패키지의 이름을 입력하세요 (예: 로맨틱 패키지, 가족 패키지)</p>
              <Input
                placeholder="패키지 이름을 입력하세요"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  name: e.target.value
                }))}
                classNames={{
                  input: "text-black bg-white border-gray-400 text-sm sm:text-base placeholder:text-gray-500 font-medium",
                  inputWrapper: "h-10 sm:h-12 bg-white shadow-sm border-2"
                }}
                style={{
                  color: '#000000 !important',
                  backgroundColor: '#ffffff !important'
                }}
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-black mb-2">패키지 설명 *</label>
              <p className="text-xs text-gray-600 mb-3">패키지에 대한 상세한 설명을 입력하세요 (예: 2박 3일 로맨틱 여행 패키지)</p>
              <Textarea
                placeholder="패키지에 대한 상세한 설명을 입력하세요"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  description: e.target.value
                }))}
                minRows={3}
                classNames={{
                  input: "text-black bg-white border-gray-400 text-sm sm:text-base placeholder:text-gray-500 font-medium",
                  inputWrapper: "min-h-[80px] bg-white shadow-sm border-2"
                }}
                style={{
                  color: '#000000 !important',
                  backgroundColor: '#ffffff !important'
                }}
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-black mb-2">가격 *</label>
              <p className="text-xs text-gray-600 mb-3">패키지의 가격을 원화로 입력하세요 (예: 150000)</p>
              <Input
                type="number"
                placeholder="0"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  price: parseInt(e.target.value) || 0
                }))}
                startContent={
                  <div className="pointer-events-none flex items-center">
                    <span className="text-gray-700 text-small font-medium">₩</span>
                  </div>
                }
                classNames={{
                  input: "text-black bg-white border-gray-400 text-sm sm:text-base placeholder:text-gray-500 font-medium",
                  inputWrapper: "h-10 sm:h-12 bg-white shadow-sm border-2"
                }}
                style={{
                  color: '#000000 !important',
                  backgroundColor: '#ffffff !important'
                }}
              />
            </div>

            {/* 판매기간 */}
            <div>
              <label className="block text-sm font-bold text-black mb-2">판매기간</label>
              <p className="text-xs text-gray-600 mb-3">패키지 판매 가능한 기간을 입력하세요 (MMDD 형식)</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <Input
                  type="text"
                  placeholder="시작일 (예: 0804)"
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
                  style={{
                    color: '#000000 !important',
                    backgroundColor: '#ffffff !important'
                  }}
                />
                <Input
                  type="text"
                  placeholder="종료일 (예: 0831)"
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
                  style={{
                    color: '#000000 !important',
                    backgroundColor: '#ffffff !important'
                  }}
                />
              </div>
            </div>

            {/* 투숙기간 */}
            <div>
              <label className="block text-sm font-bold text-black mb-2">투숙기간</label>
              <p className="text-xs text-gray-600 mb-3">실제 투숙 가능한 기간을 입력하세요 (MMDD 형식)</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <Input
                  type="text"
                  placeholder="시작일 (예: 0824)"
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
                  style={{
                    color: '#000000 !important',
                    backgroundColor: '#ffffff !important'
                  }}
                />
                <Input
                  type="text"
                  placeholder="종료일 (예: 0930)"
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
                  style={{
                    color: '#000000 !important',
                    backgroundColor: '#ffffff !important'
                  }}
                />
              </div>
            </div>

            {/* 상품구성 */}
            <div>
              <label className="block text-sm font-bold text-black mb-2">상품구성</label>
              <p className="text-xs text-gray-600 mb-3">패키지에 포함된 상품들을 상세히 입력하세요 (예: 객실 1박, 조식 2인, 스파 이용권)</p>
              <Textarea
                placeholder="예: 객실 1박, 조식 2인, 스파 이용권"
                value={formData.productComposition}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  productComposition: e.target.value
                }))}
                minRows={3}
                classNames={{
                  input: "text-black bg-white border-gray-300 text-sm sm:text-base",
                  inputWrapper: "min-h-[80px]"
                }}
                style={{
                  color: '#000000 !important',
                  backgroundColor: '#ffffff !important'
                }}
              />
            </div>

            {/* 포함사항 */}
            <div>
              <label className="block text-sm font-bold text-black mb-2">포함사항</label>
              <p className="text-xs text-gray-600 mb-3">패키지에 포함된 항목들을 하나씩 추가하세요 (예: 조식, 와이파이, 주차장)</p>
              
              {/* 기존 포함사항 표시 */}
              {formData.includes.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {formData.includes.map((include, index) => (
                    <Chip
                      key={index}
                      color="success"
                      variant="flat"
                      onClose={() => handleRemoveInclude(index)}
                      className="h-8 text-gray-800 text-xs sm:text-sm"
                    >
                      {include}
                    </Chip>
                  ))}
                </div>
              )}

              {/* 새 포함사항 추가 */}
              <div className="flex flex-col sm:flex-row gap-2 mb-4">
                <Input
                  size="sm"
                  placeholder="포함사항을 입력하세요"
                  value={newInclude}
                  onChange={(e) => setNewInclude(e.target.value)}
                  classNames={{
                    input: "text-black bg-white border-gray-400 text-sm placeholder:text-gray-500",
                    inputWrapper: "bg-white shadow-sm"
                  }}
                  style={{
                    color: '#000000 !important',
                    backgroundColor: '#ffffff !important'
                  }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && e.target.value.trim()) {
                      handleAddInclude();
                    }
                  }}
                />
                <Button
                  size="sm"
                  color="success"
                  className="h-10 w-full sm:w-auto"
                  onPress={handleAddInclude}
                >
                  추가
                </Button>
              </div>
            </div>

            {/* 유의사항/참고사항 */}
            <div>
              <label className="block text-sm font-bold text-black mb-2">유의사항/참고사항</label>
              <p className="text-xs text-gray-600 mb-3">고객이 알아야 할 주의사항이나 참고사항을 하나씩 추가하세요</p>
              
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
                  placeholder="유의사항을 입력하세요"
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  classNames={{
                    input: "text-black bg-white border-gray-400 text-sm placeholder:text-gray-500",
                    inputWrapper: "bg-white shadow-sm"
                  }}
                  style={{
                    color: '#000000 !important',
                    backgroundColor: '#ffffff !important'
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

            {/* 제약사항 */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-3 block">{Labels.제약사항 || '제약사항'}</label>
              
              {/* 기존 제약사항 표시 */}
              {formData.constraints.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {formData.constraints.map((constraint, index) => (
                    <Chip
                      key={index}
                      color="danger"
                      variant="flat"
                      onClose={() => handleRemoveConstraint(index)}
                      className="h-8 text-gray-800 text-xs sm:text-sm"
                    >
                      {constraint}
                    </Chip>
                  ))}
                </div>
              )}

              {/* 새 제약사항 추가 */}
              <div className="flex flex-col sm:flex-row gap-2 mb-4">
                <Input
                  size="sm"
                  placeholder="제약사항을 입력하세요"
                  value={newConstraint}
                  onChange={(e) => setNewConstraint(e.target.value)}
                  classNames={{
                    input: "text-black bg-white border-gray-400 text-sm placeholder:text-gray-500",
                    inputWrapper: "bg-white shadow-sm"
                  }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && e.target.value.trim()) {
                      handleAddConstraint();
                    }
                  }}
                />
                <Button
                  size="sm"
                  color="danger"
                  className="h-10 w-full sm:w-auto"
                  onPress={handleAddConstraint}
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

// 메인 패키지 컴포넌트
export default function Package({ value = [], onChange }) {
  const [packages, setPackages] = useState(value);
  const [isEditing, setIsEditing] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPackageData, setEditingPackageData] = useState(null);
  const [isNewPackage, setIsNewPackage] = useState(false);
  const [templateList, setTemplateList] = useState([]);
  const [isTemplateListOpen, setIsTemplateListOpen] = useState(false);

  // 초기 데이터 설정
  useEffect(() => {
    if (value && Array.isArray(value) && value.length > 0) {
      setPackages(value);
    } else {
      // 기본 템플릿 로드
      loadDefaultTemplates();
    }
  }, [value]);

  // 기본 템플릿 로드
  const loadDefaultTemplates = useCallback(() => {
    try {
      // 로컬 스토리지에서 기본 템플릿 확인
      const savedTemplates = JSON.parse(localStorage.getItem('packageTemplates') || '[]');
      
      if (savedTemplates.length === 0) {
        // 기본 템플릿이 없으면 기본값으로 설정
        localStorage.setItem('packageTemplates', JSON.stringify(DEFAULT_PACKAGE_TEMPLATES));
        setTemplateList(DEFAULT_PACKAGE_TEMPLATES);
        
        // 첫 번째 기본 템플릿을 패키지로 로드
        if (DEFAULT_PACKAGE_TEMPLATES.length > 0) {
          const defaultPackages = DEFAULT_PACKAGE_TEMPLATES[0].packages;
          setPackages(defaultPackages);
          if (onChange) {
            onChange(defaultPackages);
          }
        }
      } else {
        setTemplateList(savedTemplates);
      }
    } catch (error) {
      console.error('기본 템플릿 로드 오류:', error);
    }
  }, [onChange]);

  // 패키지 추가
  const handleAddPackage = useCallback(() => {
    const newPackage = {
      id: Date.now(),
      name: '',
      description: '',
      salesPeriod: { start: '', end: '' },
      stayPeriod: { start: '', end: '' },
      productComposition: '',
      includes: [],
      notes: [],
      constraints: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    setEditingPackageData(newPackage);
    setIsNewPackage(true);
    setShowEditModal(true);
  }, []);

  // 패키지 편집
  const handleEditPackage = useCallback((packageData) => {
    setEditingPackageData(packageData);
    setIsNewPackage(false);
    setShowEditModal(true);
  }, []);

  // 패키지 삭제
  const handleDeletePackage = useCallback((packageId) => {
    if (confirm('정말로 이 패키지를 삭제하시겠습니까?')) {
      const updatedPackages = packages.filter(pkg => pkg.id !== packageId);
      setPackages(updatedPackages);
      if (onChange) {
        onChange(updatedPackages);
      }
      // 미리보기 트리거
      if (typeof window !== 'undefined' && window.triggerPreview) {
        window.triggerPreview('packages');
      }
    }
  }, [packages, onChange]);

  // 패키지 저장
  const handleSavePackage = useCallback((packageData) => {
    try {
      let updatedPackages;
      
      if (isNewPackage) {
        // 새 패키지 추가
        const newPackage = {
          ...packageData,
          id: Date.now(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        updatedPackages = [...packages, newPackage];
        alert('패키지가 성공적으로 추가되었습니다!');
      } else {
        // 기존 패키지 수정
        updatedPackages = packages.map(pkg => 
          pkg.id === packageData.id 
            ? { ...packageData, updatedAt: new Date().toISOString() }
            : pkg
        );
        alert('패키지가 성공적으로 수정되었습니다!');
      }
      
      setPackages(updatedPackages);
      if (onChange) {
        onChange(updatedPackages);
      }
      
      setShowEditModal(false);
      setEditingPackageData(null);
      setIsNewPackage(false);
      
      // 미리보기 트리거
      if (typeof window !== 'undefined' && window.triggerPreview) {
        window.triggerPreview('packages');
      }
      
      console.log('패키지 저장 완료:', updatedPackages);
    } catch (error) {
      console.error('패키지 저장 오류:', error);
      alert('패키지 저장에 실패했습니다: ' + error.message);
    }
  }, [packages, onChange, isNewPackage]);

  // 패키지 템플릿 저장 함수
  const savePackageTemplate = useCallback(() => {
    try {
      const templateName = prompt('템플릿 이름을 입력하세요:');
      if (!templateName) return;

      const existingTemplates = JSON.parse(localStorage.getItem('packageTemplates') || '[]');
      const newTemplate = {
        id: Date.now(),
        name: templateName.trim(),
        packages: packages,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const updatedTemplates = [...existingTemplates, newTemplate];
      localStorage.setItem('packageTemplates', JSON.stringify(updatedTemplates));
      setTemplateList(updatedTemplates);
      alert('패키지 템플릿이 성공적으로 저장되었습니다.');
    } catch (error) {
      console.error('템플릿 저장 오류:', error);
      alert('템플릿 저장에 실패했습니다: ' + error.message);
    }
  }, [packages]);

  // 패키지 템플릿 목록 불러오기 함수
  const fetchTemplateList = useCallback(() => {
    try {
      const savedTemplates = JSON.parse(localStorage.getItem('packageTemplates') || '[]');
      setTemplateList(savedTemplates);
      setIsTemplateListOpen(true);
    } catch (error) {
      console.error('템플릿 목록 불러오기 오류:', error);
      alert('템플릿 목록을 불러올 수 없습니다: ' + error.message);
    }
  }, []);

  // 선택된 템플릿 불러오기 함수
  const loadSelectedTemplate = useCallback((template) => {
    try {
      if (template.packages && template.packages.length > 0) {
        setPackages(template.packages);
        if (onChange) {
          onChange(template.packages);
        }
        setIsTemplateListOpen(false);
        alert(`${template.name} 템플릿이 성공적으로 불러와졌습니다.`);
      } else {
        alert('템플릿에 패키지가 없습니다.');
      }
    } catch (error) {
      console.error('템플릿 불러오기 오류:', error);
      alert('템플릿을 불러올 수 없습니다: ' + error.message);
    }
  }, [onChange]);

  // 기본 템플릿 불러오기
  const loadDefaultTemplate = useCallback(() => {
    if (confirm('기본 템플릿을 불러오시겠습니까? 현재 패키지가 대체됩니다.')) {
      if (DEFAULT_PACKAGE_TEMPLATES.length > 0) {
        const defaultPackages = DEFAULT_PACKAGE_TEMPLATES[0].packages;
        setPackages(defaultPackages);
        if (onChange) {
          onChange(defaultPackages);
        }
        alert('기본 템플릿이 성공적으로 불러와졌습니다.');
      }
    }
  }, [onChange]);

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
        
        <div className="flex flex-wrap gap-2 justify-end">
          <Button
            color="success"
            variant="bordered"
            onPress={() => {
              console.log('패키지 생성 버튼 클릭됨');
              console.log('현재 packages 데이터:', packages);
              console.log('onChange 함수 존재 여부:', !!onChange);
              
              if (onChange) {
                onChange(packages);
                console.log('onChange 호출 완료');
              } else {
                console.log('onChange가 undefined입니다');
              }
              
              alert('패키지가 미리보기에 생성되었습니다.');
            }}
            className="text-sm whitespace-nowrap"
            startContent="✨"
          >
            생성
          </Button>
          <Button
            color="primary"
            variant="bordered"
            onPress={handleAddPackage}
            className="text-sm whitespace-nowrap"
          >
            + 추가
          </Button>
          <Button
            color="secondary"
            variant="bordered"
            onPress={savePackageTemplate}
            className="text-sm whitespace-nowrap"
          >
            템플릿 저장
          </Button>
          <Button
            color="warning"
            variant="bordered"
            onPress={fetchTemplateList}
            className="text-sm whitespace-nowrap"
          >
            템플릿 목록
          </Button>
          <Button
            color="default"
            variant="bordered"
            onPress={loadDefaultTemplate}
            className="text-sm whitespace-nowrap"
          >
            기본 템플릿
          </Button>
        </div>
      </div>

      <div className="mt-6 sm:mt-8">
        <PackageTable
          packages={packages}
          onEdit={handleEditPackage}
          onDelete={handleDeletePackage}
          onAdd={handleAddPackage}
        />
      </div>

      {/* 패키지 편집 모달 */}
      <PackageEditModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingPackageData(null);
          setIsNewPackage(false);
        }}
        packageData={editingPackageData}
        onSave={handleSavePackage}
        isNew={isNewPackage}
      />

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
                  <div key={template.id || index} className="border rounded-lg p-3 sm:p-4 hover:bg-gray-50">
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
                      <div className="flex gap-2">
                        <Button
                          color="primary"
                          size="sm"
                          onPress={() => loadSelectedTemplate(template)}
                          className="w-full sm:w-auto"
                        >
                          불러오기
                        </Button>
                        <Button
                          color="danger"
                          size="sm"
                          variant="light"
                          onPress={() => {
                            if (confirm('정말로 이 템플릿을 삭제하시겠습니까?')) {
                              const updatedTemplates = templateList.filter(t => t.id !== template.id);
                              localStorage.setItem('packageTemplates', JSON.stringify(updatedTemplates));
                              setTemplateList(updatedTemplates);
                            }
                          }}
                          className="w-full sm:w-auto"
                        >
                          삭제
                        </Button>
                      </div>
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

      {/* 패키지 정보 미리보기 안내 */}
      <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
        <div className="text-center">
          <h4 className="font-medium text-purple-900 mb-2">패키지 정보 미리보기</h4>
          <p className="text-sm text-purple-600">상단의 "🎯 전체 미리보기 생성" 버튼을 클릭하여 전체 미리보기를 생성하세요</p>
        </div>
      </div>
    </div>
  );
} 