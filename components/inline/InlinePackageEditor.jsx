'use client';

import React, { useState } from 'react';

import Labels from '@/src/shared/labels';
import { Button, Input, Textarea, Chip, Divider, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from "@heroui/react";
import { FaPlus, FaTrash, FaSave, FaTimes, FaDownload, FaUpload } from 'react-icons/fa';

const InlinePackageEditor = ({ packages = [], onPackagesChange }) => {
  const [editingIndex, setEditingIndex] = useState(null);
  const [tempPackage, setTempPackage] = useState({});
  const [savedTemplates, setSavedTemplates] = useState([]);
  const [templateName, setTemplateName] = useState('');
  const { isOpen: isSaveModalOpen, onOpen: onSaveModalOpen, onClose: onSaveModalClose } = useDisclosure();
  const { isOpen: isLoadModalOpen, onOpen: onLoadModalOpen, onClose: onLoadModalClose } = useDisclosure();

  const startEditing = (index) => {
    setEditingIndex(index);
    const existingPackage = packages[index];
    if (existingPackage) {
      // 기존 패키지 데이터를 완전히 복사
      setTempPackage({
        name: existingPackage.name || '',
        description: existingPackage.description || '',
        price: existingPackage.price || 0,
        includes: [...(existingPackage.includes || [])],
        salesPeriod: {
          start: existingPackage.salesPeriod?.start || '',
          end: existingPackage.salesPeriod?.end || ''
        },
        stayPeriod: {
          start: existingPackage.stayPeriod?.start || '',
          end: existingPackage.stayPeriod?.end || ''
        },
        productComposition: existingPackage.productComposition || '',
        notes: [...(existingPackage.notes || [])],
        constraints: [...(existingPackage.constraints || [])]
      });
    } else {
      // 새 패키지 기본값
      setTempPackage({
        name: '',
        description: '',
        price: 0,
        includes: [],
        salesPeriod: { start: '', end: '' },
        stayPeriod: { start: '', end: '' },
        productComposition: '',
        notes: [],
        constraints: []
      });
    }
  };

  const savePackage = () => {
    console.log('패키지 저장 시작:', { editingIndex, tempPackage, packages });
    const updatedPackages = [...packages];
    if (editingIndex !== null) {
      updatedPackages[editingIndex] = tempPackage;
      console.log('패키지 수정:', { index: editingIndex, updatedPackage: tempPackage });
    } else {
      updatedPackages.push(tempPackage);
      console.log('새 패키지 추가:', tempPackage);
    }
    console.log('업데이트된 패키지 목록:', updatedPackages);
    onPackagesChange(updatedPackages);
    setEditingIndex(null);
    setTempPackage({});
    console.log('패키지 저장 완료');
  };

  const cancelEditing = () => {
    setEditingIndex(null);
    setTempPackage({});
  };

  const deletePackage = (index) => {
    const updatedPackages = packages.filter((_, i) => i !== index);
    onPackagesChange(updatedPackages);
  };

  const addPackage = () => {
    setEditingIndex(packages.length);
    setTempPackage({
      name: '',
      description: '',
      price: 0,
      includes: [],
      salesPeriod: { start: '', end: '' },
      stayPeriod: { start: '', end: '' },
      productComposition: '',
      notes: [],
      constraints: []
    });
  };

  const addInclude = () => {
    const newInclude = prompt('포함 사항을 입력하세요:');
    if (newInclude && newInclude.trim()) {
      const currentIncludes = tempPackage.includes || [];
      setTempPackage({
        ...tempPackage,
        includes: [...currentIncludes, newInclude.trim()]
      });
    }
  };

  const updateInclude = (index, value) => {
    const updatedIncludes = [...(tempPackage.includes || [])];
    updatedIncludes[index] = value;
    setTempPackage({
      ...tempPackage,
      includes: updatedIncludes
    });
  };

  const removeInclude = (index) => {
    const updatedIncludes = tempPackage.includes.filter((_, i) => i !== index);
    setTempPackage({
      ...tempPackage,
      includes: updatedIncludes
    });
  };

  const savePackageTemplate = () => {
    if (templateName.trim()) {
      const template = {
        id: Date.now(),
        name: templateName.trim(),
        packages: packages,
        createdAt: new Date().toISOString()
      };
      const updatedTemplates = [...savedTemplates, template];
      setSavedTemplates(updatedTemplates);
      localStorage.setItem('packageTemplates', JSON.stringify(updatedTemplates));
        setTemplateName('');
        onSaveModalClose();
    }
  };

  const loadTemplate = (template) => {
    if (template.packages && Array.isArray(template.packages)) {
      onPackagesChange(template.packages);
      onLoadModalClose();
    }
  };

  const handleSaveModalOpen = () => {
    onSaveModalOpen();
  };

  const handleLoadModalOpen = () => {
    // 저장된 템플릿 불러오기
    const saved = localStorage.getItem('packageTemplates');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSavedTemplates(parsed);
      } catch (error) {
        console.error('템플릿 불러오기 실패:', error);
      }
    }
    onLoadModalOpen();
  };

  return (
    <div className="space-y-6 min-h-screen">
      {/* 헤더 */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <span className="mr-2">📦</span>
            패키지 정보 관리
          </h2>
          <p className="text-sm text-gray-600">호텔의 특별 패키지를 관리하고 편집할 수 있습니다.</p>
        </div>
        <div className="flex gap-2">
        <Button
          color="primary"
          variant="bordered"
            onPress={handleSaveModalOpen}
          startContent={<FaDownload />}
          size="sm"
        >
            패키지 템플릿 저장
        </Button>
        <Button
          color="secondary"
          variant="bordered"
          onPress={handleLoadModalOpen}
          startContent={<FaUpload />}
          size="sm"
        >
            패키지 템플릿 목록
        </Button>
      </div>
      </div>
      
      {/* 기존 패키지 목록 */}
      {packages.map((pkg, index) => (
        <div key={index} className="border rounded-lg p-6 bg-gray-50">
          {editingIndex === index ? (
            // 편집 모드
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                <Input
                  label={Labels["패키지명"]}
                  value={tempPackage.name}
                  onChange={(e) => setTempPackage({ ...tempPackage, name: e.target.value })}
                  placeholder={Labels["예_로맨틱_패키지_PH"]}
                  size="sm"
                  classNames={{
                    input: "text-black bg-white border-gray-400 placeholder:text-gray-500",
                    label: "text-gray-700 font-medium text-sm mb-3"
                  }}
                />
                </div>
                <div className="space-y-3">
                <Input
                  type="number"
                  label={Labels["가격"]}
                  value={tempPackage.price}
                  onChange={(e) => setTempPackage({ ...tempPackage, price: parseInt(e.target.value) || 0 })}
                  placeholder={Labels["0_PH"]}
                  size="sm"
                  startContent={
                    <div className="pointer-events-none flex items-center">
                      <span className="text-gray-700 text-small font-medium">₩</span>
                    </div>
                  }
                  classNames={{
                    input: "text-black bg-white border-gray-400 placeholder:text-gray-500",
                    label: "text-gray-700 font-medium text-sm mb-3"
                  }}
                />
              </div>
              </div>
              
              <div className="space-y-3">
              <Textarea
                label={Labels["패키지_설명"]}
                value={tempPackage.description}
                onChange={(e) => setTempPackage({ ...tempPackage, description: e.target.value })}
                placeholder={Labels["패키지에_대한_상세한_설명을_입력하세요_PH"]}
                  rows={4}
                classNames={{
                  input: "text-black bg-white border-gray-400 placeholder:text-gray-500",
                  label: "text-gray-700 font-medium text-sm mb-3"
                }}
                />
              </div>
              
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">{Labels.포함_사항}</label>
                <div className="space-y-3">
                  {(tempPackage.includes || []).map((include, includeIndex) => (
                    <div key={includeIndex} className="flex gap-3 items-center">
                      <Input
                        value={include}
                        onChange={(e) => updateInclude(includeIndex, e.target.value)}
                        placeholder={Labels["포함_사항을_입력하세요_PH"]}
                        className="flex-1"
                        size="sm"
                        classNames={{
                          input: "text-black bg-white border-gray-400 placeholder:text-gray-500",
                          label: "text-gray-700 font-medium text-sm mb-2"
                        }}
                      />
                      <Button
                        size="sm"
                        color="danger"
                        onPress={() => removeInclude(includeIndex)}
                        startContent={<FaTrash />}
                      >
                        삭제
                      </Button>
                    </div>
                  ))}
                </div>
                <Button
                  color="primary"
                  variant="bordered"
                  onPress={addInclude}
                  startContent={<FaPlus />}
                  className="mt-3"
                >
                  포함 사항 추가
                </Button>
              </div>
              
              {/* 판매기간 */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">{Labels.판매기간}</label>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    type="date"
                    value={tempPackage.salesPeriod?.start || ''}
                    onChange={(e) => setTempPackage({
                      ...tempPackage,
                      salesPeriod: { ...tempPackage.salesPeriod, start: e.target.value }
                    })}
                    classNames={{
                      input: "text-black bg-white border-gray-400 text-sm placeholder:text-gray-500",
                      inputWrapper: "h-12 bg-white shadow-sm"
                    }}
                  />
                  <Input
                    type="date"
                    value={tempPackage.salesPeriod?.end || ''}
                    onChange={(e) => setTempPackage({
                      ...tempPackage,
                      salesPeriod: { ...tempPackage.salesPeriod, end: e.target.value }
                    })}
                    classNames={{
                      input: "text-black bg-white border-gray-400 text-sm placeholder:text-gray-500",
                      inputWrapper: "h-12 bg-white shadow-sm"
                    }}
                  />
                </div>
                {tempPackage.salesPeriod?.start && tempPackage.salesPeriod?.end && (
                  <p className="text-sm text-gray-600 bg-blue-50 p-2 rounded">
                    입력된 값: {tempPackage.salesPeriod.start} ~ {tempPackage.salesPeriod.end}
                  </p>
                )}
              </div>
              
              {/* 투숙 적용기간 */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">{Labels.투숙_적용기간}</label>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    type="text"
                    placeholder={Labels["MMDD_예_0824_PH"]}
                    value={tempPackage.stayPeriod?.start || ''}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 4);
                      setTempPackage({
                        ...tempPackage,
                        stayPeriod: { ...tempPackage.stayPeriod, start: value }
                      });
                    }}
                    classNames={{
                      input: "text-gray-800 bg-white border-gray-300 text-sm text-center font-mono",
                      inputWrapper: "h-12"
                    }}
                  />
                  <Input
                    type="text"
                    placeholder={Labels["MMDD_예_0930_PH"]}
                    value={tempPackage.stayPeriod?.end || ''}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 4);
                      setTempPackage({
                        ...tempPackage,
                        stayPeriod: { ...tempPackage.stayPeriod, end: value }
                      });
                    }}
                    classNames={{
                      input: "text-gray-800 bg-white border-gray-300 text-sm text-center font-mono",
                      inputWrapper: "h-12"
                    }}
                  />
                </div>
              </div>
              
              {/* 상품구성 */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">{Labels.상품구성}</label>
                <Input
                  placeholder={Labels["예_객실_1박__조식_2인__스파_이용권_PH"]}
                  value={tempPackage.productComposition || ''}
                  onChange={(e) => setTempPackage({
                    ...tempPackage,
                    productComposition: e.target.value
                  })}
                  classNames={{
                    input: "text-gray-800 bg-white border-gray-300 text-sm",
                    inputWrapper: "h-12"
                  }}
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <Button color="primary" onPress={savePackage} startContent={<FaSave />}>
                  저장
                </Button>
                <Button color="default" onPress={cancelEditing} startContent={<FaTimes />}>
                  취소
                </Button>
              </div>
            </div>
          ) : (
            // 보기 모드
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{pkg.name}</h3>
                <p className="text-gray-600 text-sm">
                  ₩{pkg.price?.toLocaleString() || 0}
                </p>
                {pkg.description && (
                  <p className="text-gray-700 mt-2">{pkg.description}</p>
                )}
                {pkg.stayPeriod?.start && pkg.stayPeriod?.end && (
                  <p className="text-gray-600 text-sm mt-1">
                    <strong>투숙기간:</strong> {pkg.stayPeriod.start} ~ {pkg.stayPeriod.end}
                  </p>
                )}
                {pkg.productComposition && (
                  <p className="text-gray-600 text-sm mt-1">
                    <strong>상품구성:</strong> {pkg.productComposition}
                  </p>
                )}
                {pkg.includes && pkg.includes.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {pkg.includes.map((include, includeIndex) => (
                      <Chip key={includeIndex} size="sm" variant="flat" color="success">
                        {include}
                      </Chip>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <Button size="sm" color="primary" onPress={() => startEditing(index)}>
                  편집
                </Button>
                <Button size="sm" color="danger" onPress={() => deletePackage(index)} startContent={<FaTrash />}>
                  삭제
                </Button>
              </div>
            </div>
          )}
        </div>
      ))}
      
      {/* 새 패키지 추가 */}
      {editingIndex === packages.length && (
        <div className="border rounded-lg p-6 bg-blue-50">
          <h3 className="font-semibold text-lg mb-6">새 패키지 추가</h3>
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3">
              <Input
                label={Labels["패키지명_1"]}
                value={tempPackage.name}
                onChange={(e) => setTempPackage({ ...tempPackage, name: e.target.value })}
                placeholder={Labels["예_로맨틱_패키지_PH_1"]}
                size="sm"
                classNames={{
                  input: "text-black bg-white border-gray-400 placeholder:text-gray-500",
                  label: "text-gray-700 font-medium text-sm mb-3"
                }}
              />
              </div>
              <div className="space-y-3">
              <Input
                type="number"
                label={Labels["가격_1"]}
                value={tempPackage.price}
                onChange={(e) => setTempPackage({ ...tempPackage, price: parseInt(e.target.value) || 0 })}
                placeholder={Labels["0_PH_1"]}
                size="sm"
                startContent={
                  <div className="pointer-events-none flex items-center">
                    <span className="text-gray-700 text-small font-medium">₩</span>
                  </div>
                }
                classNames={{
                  input: "text-black bg-white border-gray-400 placeholder:text-gray-500",
                  label: "text-gray-700 font-medium text-sm mb-3"
                }}
              />
              </div>
            </div>
            
            <div className="space-y-2">
            <Textarea
              label={Labels["패키지_설명_1"]}
              value={tempPackage.description}
              onChange={(e) => setTempPackage({ ...tempPackage, description: e.target.value })}
              placeholder={Labels["패키지에_대한_상세한_설명을_입력하세요_PH_1"]}
                rows={4}
              classNames={{
                input: "text-gray-800 bg-white border-gray-300",
                  label: "text-gray-700 font-medium text-sm mb-2"
                }}
              />
            </div>
            
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">{Labels.포함_사항_1}</label>
              <div className="space-y-3">
                {(tempPackage.includes || []).map((include, includeIndex) => (
                  <div key={includeIndex} className="flex gap-3 items-center">
                    <Input
                      value={include}
                      onChange={(e) => updateInclude(includeIndex, e.target.value)}
                      placeholder={Labels["포함_사항을_입력하세요_PH_1"]}
                      className="flex-1"
                      size="sm"
                      classNames={{
                        input: "text-gray-800 bg-white border-gray-300",
                        label: "text-gray-700 font-medium text-sm mb-2"
                      }}
                    />
                    <Button
                      size="sm"
                      color="danger"
                      onPress={() => removeInclude(includeIndex)}
                      startContent={<FaTrash />}
                    >
                      삭제
                    </Button>
                  </div>
                ))}
              </div>
              <Button
                color="primary"
                variant="bordered"
                onPress={addInclude}
                startContent={<FaPlus />}
                className="mt-3"
              >
                포함 사항 추가
              </Button>
            </div>
            
            {/* 판매기간 */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">{Labels.판매기간_1}</label>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  type="date"
                  value={tempPackage.salesPeriod?.start || ''}
                  onChange={(e) => setTempPackage({
                    ...tempPackage,
                    salesPeriod: { ...tempPackage.salesPeriod, start: e.target.value }
                  })}
                  classNames={{
                    input: "text-gray-800 bg-white border-gray-300 text-sm",
                    inputWrapper: "h-12"
                  }}
                />
                <Input
                  type="date"
                  value={tempPackage.salesPeriod?.end || ''}
                  onChange={(e) => setTempPackage({
                    ...tempPackage,
                    salesPeriod: { ...tempPackage.salesPeriod, end: e.target.value }
                  })}
                  classNames={{
                    input: "text-gray-800 bg-white border-gray-300 text-sm",
                    inputWrapper: "h-12"
                  }}
                />
              </div>
            </div>
            
            {/* 투숙 적용기간 */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">{Labels.투숙_적용기간_1}</label>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  type="text"
                  placeholder={Labels["MMDD_예_0824_PH_1"]}
                  value={tempPackage.stayPeriod?.start || ''}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 4);
                    setTempPackage({
                      ...tempPackage,
                      stayPeriod: { ...tempPackage.stayPeriod, start: value }
                    });
                  }}
                  classNames={{
                    input: "text-gray-800 bg-white border-gray-300 text-sm text-center font-mono",
                    inputWrapper: "h-12"
                  }}
                />
                <Input
                  type="text"
                  placeholder={Labels["MMDD_예_0930_PH_1"]}
                  value={tempPackage.stayPeriod?.end || ''}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 4);
                    setTempPackage({
                      ...tempPackage,
                      stayPeriod: { ...tempPackage.stayPeriod, end: value }
                    });
                  }}
                  classNames={{
                    input: "text-gray-800 bg-white border-gray-300 text-sm text-center font-mono",
                    inputWrapper: "h-12"
                  }}
                />
              </div>
            </div>
            
            {/* 상품구성 */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">{Labels.상품구성_1}</label>
              <Input
                placeholder={Labels["예_객실_1박__조식_2인__스파_이용권_PH_1"]}
                value={tempPackage.productComposition || ''}
                onChange={(e) => setTempPackage({
                  ...tempPackage,
                  productComposition: e.target.value
                })}
                classNames={{
                  input: "text-gray-800 bg-white border-gray-300 text-sm",
                  inputWrapper: "h-12"
                }}
              />
            </div>
            
            <div className="flex gap-3 pt-4">
              <Button color="primary" onPress={savePackage} startContent={<FaSave />}>
                저장
              </Button>
              <Button color="default" onPress={cancelEditing} startContent={<FaTimes />}>
                취소
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* 새 패키지 추가 버튼 */}
      {editingIndex === null && (
        <Button color="primary" onPress={addPackage} startContent={<FaPlus />}>
          새 패키지 추가
        </Button>
      )}
      
      {/* 저장 모달 */}
      <Modal isOpen={isSaveModalOpen} onClose={onSaveModalClose}>
        <ModalContent>
          <ModalHeader>패키지 템플릿 저장</ModalHeader>
          <ModalBody>
            <Input
              label={Labels.TEMPLATE_NAME}
              placeholder={Labels["예_조식_패키지_워터파크_패키지_PH"]}
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              size="sm"
              classNames={{
                input: "text-gray-800 bg-white border-gray-300",
                label: "text-gray-700 font-medium"
              }}
            />
            <p className="text-sm text-gray-500 mt-2">
              현재 {packages.length}개의 패키지가 저장됩니다.
            </p>
          </ModalBody>
          <ModalFooter>
            <Button color="danger" variant="light" onPress={onSaveModalClose}>
              취소
            </Button>
            <Button color="primary" onPress={savePackageTemplate}>
              저장
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      
      {/* 불러오기 모달 */}
      <Modal isOpen={isLoadModalOpen} onClose={onLoadModalClose} size="2xl">
        <ModalContent>
          <ModalHeader>패키지 템플릿 불러오기</ModalHeader>
          <ModalBody>
            {savedTemplates.length > 0 ? (
              <div className="space-y-2">
                {savedTemplates.map((template) => (
                  <div
                    key={template.id}
                    className="border rounded-lg p-3 hover:bg-gray-50 cursor-pointer"
                    onClick={() => loadTemplate(template)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold">{template.name}</h4>
                        <p className="text-sm text-gray-500">
                          패키지 {Array.isArray(template.packages) ? template.packages.length : 0}개
                        </p>
                        <p className="text-xs text-gray-400">
                          저장일: {new Date(template.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Button
                        color="primary"
                        size="sm"
                        onPress={() => loadTemplate(template)}
                      >
                        불러오기
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">
                저장된 패키지 템플릿이 없습니다.
              </p>
            )}
          </ModalBody>
          <ModalFooter>
            <Button color="danger" variant="light" onPress={onLoadModalClose}>
              닫기
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default InlinePackageEditor; 