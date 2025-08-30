'use client';

import React, { useState, useEffect } from 'react';
import { Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Input, Chip } from "@heroui/react";

import Labels from '@/src/shared/labels';
import Image from 'next/image';
import SimpleInput from '../room/SimpleInput';

const HotelInfo = React.memo(({ value, onChange, displayMode = false }) => {
  const [hotelInfo, setHotelInfo] = useState(value || {
    name: '',
    address: '',
    description: '',
    imageUrl: '',
    phone: '',
    email: '',
    website: '',
    category: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showLoadModal, setShowLoadModal] = useState(false);
  const [savedTemplates, setSavedTemplates] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // props에서 초기값 설정
  useEffect(() => {
    if (value) {
      setHotelInfo(value);
    }
  }, [value]);

  const handleSimpleInputChange = (e) => {
    const { name, value: inputValue } = e.target;
    const updatedHotel = {
      ...hotelInfo,
      [name]: inputValue
    };
    setHotelInfo(updatedHotel);
    if (onChange) {
      onChange(updatedHotel);
    }
  };

  // 이미지 URL 유효성 검사
  const isValidImageUrl = (url) => {
    if (!url) return true;
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  };

  // 저장된 템플릿 목록 불러오기
  const loadSavedTemplates = async () => {
    try {
      setIsLoading(true);
      // 로컬 스토리지에서 저장된 템플릿들 확인
      const savedTemplates = JSON.parse(localStorage.getItem('hotelTemplates') || '[]');
      
      // 기본 템플릿들도 포함
      const defaultTemplates = [
        {
          id: 'default-1',
          name: '기본 호텔 템플릿',
          description: '새로운 호텔을 위한 기본 템플릿',
          createdAt: new Date().toISOString(),
          isDefault: true
        }
      ];
      
      const allTemplates = [...defaultTemplates, ...savedTemplates];
      setSavedTemplates(allTemplates);
      setShowLoadModal(true);
    } catch (error) {
      console.error('템플릿 목록 불러오기 오류:', error);
      setMessage('템플릿 목록을 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 특정 템플릿 불러오기
  const loadSpecificTemplate = async (templateId) => {
    try {
      setIsLoading(true);
      if (templateId === 'default-1') {
        // 기본 템플릿 로드
        const defaultHotelInfo = {
          name: '',
          address: '',
          description: '',
          imageUrl: '',
          phone: '',
          email: '',
          website: '',
          category: '',
        };
        setHotelInfo(defaultHotelInfo);
        if (onChange) {
          onChange(defaultHotelInfo);
        }
        setMessage('기본 템플릿을 불러왔습니다.');
      } else {
        // 저장된 템플릿 로드
        const savedTemplates = JSON.parse(localStorage.getItem('hotelTemplates') || '[]');
        const template = savedTemplates.find(t => t.id === templateId);
        if (template) {
          setHotelInfo(template.data);
          if (onChange) {
            onChange(template.data);
          }
          setMessage(`"${template.name}" 템플릿을 불러왔습니다.`);
        }
      }
      setShowLoadModal(false);
    } catch (error) {
      console.error('템플릿 불러오기 오류:', error);
      setMessage('템플릿을 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // DB에서 호텔 정보 불러오기 (기존 함수 유지)
  const loadHotelInfo = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/hotelInfo');
      if (response.ok) {
        const data = await response.json();
        setHotelInfo(data);
        if (onChange) {
          onChange(data);
        }
        setMessage('호텔 정보를 불러왔습니다.');
      } else {
        setMessage('호텔 정보를 불러오는데 실패했습니다.');
      }
    } catch (error) {
      console.error('호텔 정보 불러오기 오류:', error);
      setMessage('호텔 정보를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 호텔 정보를 템플릿으로 저장
  const saveAsTemplate = () => {
    const templateName = prompt('템플릿 이름을 입력하세요:');
    if (templateName && templateName.trim()) {
      try {
        const savedTemplates = JSON.parse(localStorage.getItem('hotelTemplates') || '[]');
        const newTemplate = {
          id: Date.now().toString(),
          name: templateName.trim(),
          description: `호텔명: ${hotelInfo.name || '미입력'}, 주소: ${hotelInfo.address || '미입력'}`,
          data: { ...hotelInfo },
          createdAt: new Date().toISOString()
        };
        
        const updatedTemplates = [...savedTemplates, newTemplate];
        localStorage.setItem('hotelTemplates', JSON.stringify(updatedTemplates));
        setMessage(`"${templateName}" 템플릿으로 저장되었습니다.`);
      } catch (error) {
        console.error('템플릿 저장 오류:', error);
        setMessage('템플릿 저장에 실패했습니다.');
      }
    }
  };

  // DB에 호텔 정보 저장
  const saveHotelInfo = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/hotelInfo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(hotelInfo),
      });
      
      if (response.ok) {
        const result = await response.json();
        setMessage('호텔 정보가 저장되었습니다.');
      } else {
        setMessage('호텔 정보 저장에 실패했습니다.');
      }
    } catch (error) {
      console.error('호텔 정보 저장 오류:', error);
      setMessage('호텔 정보 저장 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  if (displayMode) {
    return (
      <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">호텔 이름</label>
            <div className="p-3 bg-white border border-gray-200 rounded-md">
              {hotelInfo.name || '호텔명을 입력하세요'}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">호텔 주소</label>
            <div className="p-3 bg-white border border-gray-200 rounded-md">
              {hotelInfo.address || '호텔 주소를 입력하세요'}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">호텔 설명</label>
            <div className="p-3 bg-white border border-gray-200 rounded-md min-h-[100px]">
              {hotelInfo.description || '호텔에 대한 간략한 설명을 입력하세요'}
            </div>
          </div>
          
          {hotelInfo.imageUrl && isValidImageUrl(hotelInfo.imageUrl) && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">호텔 이미지</label>
              <div className="p-2 bg-white border border-gray-200 rounded-md">
                <Image
                  src={hotelInfo.imageUrl}
                  alt="호텔 이미지"
                  width={300}
                  height={200}
                  className="max-h-48 w-full object-contain rounded"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 헤더 및 버튼들 */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">🏨 호텔 정보 관리</h2>
          <p className="text-gray-600 mt-1">호텔의 기본 정보를 관리하세요</p>
        </div>
        
        <div className="flex gap-2">
          <Button
            color="success"
            variant="bordered"
            onPress={() => {
              if (onChange) {
                onChange(hotelInfo);
              }
              alert('호텔 정보가 미리보기에 생성되었습니다.');
            }}
            startContent="✨"
          >
            생성
          </Button>
          <Button
            color="secondary"
            variant="bordered"
            onPress={loadSavedTemplates}
            isLoading={isLoading}
            startContent="📂"
          >
            불러오기
          </Button>
          <Button
            color="primary"
            variant="bordered"
            onPress={saveHotelInfo}
            isLoading={isLoading}
            startContent="💾"
          >
            저장하기
          </Button>
          <Button
            color="warning"
            variant="bordered"
            onPress={saveAsTemplate}
            startContent="📋"
          >
            템플릿 저장
          </Button>
        </div>
      </div>

      {/* 메시지 표시 */}
      {message && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">{message}</p>
        </div>
      )}

      {/* 호텔 정보 입력 폼 */}
      <div className="space-y-4 p-1">
        <SimpleInput
          label={Labels["호텔_이름"]}
          id="name"
          name="name"
          value={hotelInfo.name}
          onChange={handleSimpleInputChange}
          placeholder={Labels["호텔의_전체_이름을_입력하세요_PH"]}
        />
        <SimpleInput
          label={Labels["호텔_주소"]}
          id="address"
          name="address"
          value={hotelInfo.address}
          onChange={handleSimpleInputChange}
          placeholder={Labels["호텔의_주소를_입력하세요_PH"]}
        />
        
        <SimpleInput
          label={Labels["호텔_설명"]}
          type="textarea"
          id="description"
          name="description"
          value={hotelInfo.description}
          onChange={handleSimpleInputChange}
          rows="4"
          placeholder={Labels["호텔에_대한_간략한_설명을_입력하세요_PH"]}
          className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
        />

        <SimpleInput
          label={Labels["이미지_URL"]}
          type="url"
          id="imageUrl"
          name="imageUrl"
          value={hotelInfo.imageUrl}
          onChange={handleSimpleInputChange}
          placeholder={Labels.HTTPSEXAMPLECOMIMAGEJPG_PH}
          className={`w-full p-2 border rounded-md shadow-sm ${!isValidImageUrl(hotelInfo.imageUrl) ? 'border-red-500' : 'border-gray-300'}`}
        />
        {!isValidImageUrl(hotelInfo.imageUrl) && (
          <p className="text-red-500 text-xs mt-1">유효한 URL을 입력하세요.</p>
        )}
          
        {hotelInfo.imageUrl && isValidImageUrl(hotelInfo.imageUrl) && (
          <div className="mt-2 p-2 border rounded-md">
            <Image
              src={hotelInfo.imageUrl}
              alt="호텔 이미지 미리보기"
              width={300}
              height={200}
              className="max-h-48 w-full object-contain rounded"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
        )}
      </div>

      {/* 템플릿 불러오기 모달 */}
      <Modal 
        isOpen={showLoadModal} 
        onClose={() => setShowLoadModal(false)}
        size="lg"
        classNames={{
          base: "max-w-4xl mx-auto w-[95vw] sm:w-full",
          wrapper: "p-4 sm:p-6",
          body: "p-4 sm:p-6 overflow-y-auto max-h-[80vh]",
          header: "border-b border-gray-200 pb-4",
          footer: "border-t border-gray-200 pt-4"
        }}
        backdrop="blur"
        isDismissable={true}
        isKeyboardDismissDisabled={false}
      >
        <ModalContent className="overflow-hidden">
          <ModalHeader className="text-lg sm:text-xl font-semibold text-gray-900">
            저장된 호텔 템플릿 불러오기
          </ModalHeader>
          <ModalBody className="overflow-y-auto max-h-[70vh] px-4 sm:px-6 py-4">
            {/* 검색 필터 */}
            <div className="mb-6">
              <Input
                placeholder="템플릿 이름으로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                startContent="🔍"
                classNames={{
                  input: "text-black bg-white border-gray-400 text-sm placeholder:text-gray-500",
                  inputWrapper: "h-10 bg-white shadow-sm"
                }}
              />
            </div>

            {/* 템플릿 목록 */}
            <div className="space-y-4">
              {savedTemplates
                .filter(template => 
                  template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  template.description.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map((template) => (
                  <div
                    key={template.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                      template.isDefault 
                        ? 'border-blue-200 bg-blue-50' 
                        : 'border-gray-200 bg-white'
                    }`}
                    onClick={() => loadSpecificTemplate(template.id)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-gray-900">
                            {template.name}
                          </h3>
                          {template.isDefault && (
                            <Chip size="sm" color="primary" variant="flat">
                              기본
                            </Chip>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          {template.description}
                        </p>
                        <p className="text-xs text-gray-500">
                          생성일: {new Date(template.createdAt).toLocaleDateString('ko-KR')}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        color="primary"
                        variant="flat"
                        onPress={() => loadSpecificTemplate(template.id)}
                      >
                        불러오기
                      </Button>
                    </div>
                  </div>
                ))}
              
              {savedTemplates.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p>저장된 템플릿이 없습니다.</p>
                  <p className="text-sm mt-2">새로운 호텔 정보를 입력하고 저장해보세요.</p>
                </div>
              )}
            </div>
          </ModalBody>
          <ModalFooter className="flex justify-end gap-2">
            <Button variant="light" onPress={() => setShowLoadModal(false)}>
              닫기
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
});

export default HotelInfo;