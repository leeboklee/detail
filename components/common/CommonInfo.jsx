'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button, Input, Textarea, Card, CardBody, CardHeader, Divider, Badge, Tooltip } from "@heroui/react";
import Labels from '@/src/shared/labels';

// 공통안내 컴포넌트
const CommonInfo = ({ value = {}, onChange, displayMode = false }) => {
  const [commonInfo, setCommonInfo] = useState({
    title: '공통안내',
    notices: [
      '베드타입은 접수 페이지에서 선택 가능합니다',
      '객실 구조는 타입, 호수에 따라 사진과 상이할 수 있습니다'
    ],
    additionalInfo: '인원추가 현장결제',
    createdAt: null,
    updatedAt: null
  });

  const [editingIndex, setEditingIndex] = useState(-1);
  const [newNotice, setNewNotice] = useState('');
  const [savedList, setSavedList] = useState([]);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveName, setSaveName] = useState('');

  // 초기값 설정
  useEffect(() => {
    if (value && Object.keys(value).length > 0) {
      setCommonInfo(value);
    } else {
      // 기본값으로 설정
      loadDefaultData();
    }
  }, [value]);

  // 저장된 목록 불러오기
  useEffect(() => {
    loadSavedList();
  }, []);

  // 기본 데이터 로드
  const loadDefaultData = useCallback(() => {
    const defaultData = {
      title: '공통안내',
      notices: [
        '베드타입은 접수 페이지에서 선택 가능합니다',
        '객실 구조는 타입, 호수에 따라 사진과 상이할 수 있습니다'
      ],
      additionalInfo: '인원추가 현장결제',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setCommonInfo(defaultData);
    if (onChange) {
      onChange(defaultData);
    }
  }, [onChange]);

  // 저장된 목록 불러오기
  const loadSavedList = useCallback(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('commonInfoList') || '[]');
      setSavedList(saved);
    } catch (error) {
      console.error('저장된 목록 불러오기 오류:', error);
      setSavedList([]);
    }
  }, []);

  // 공지사항 추가
  const addNotice = useCallback(() => {
    if (!newNotice.trim()) return;
    
    const updatedNotices = [...commonInfo.notices, newNotice.trim()];
    const updatedInfo = {
      ...commonInfo,
      notices: updatedNotices,
      updatedAt: new Date().toISOString()
    };
    
    setCommonInfo(updatedInfo);
    setNewNotice('');
    
    if (onChange) {
      onChange(updatedInfo);
    }
  }, [commonInfo, newNotice, onChange]);

  // 공지사항 삭제
  const removeNotice = useCallback((index) => {
    const updatedNotices = commonInfo.notices.filter((_, i) => i !== index);
    const updatedInfo = {
      ...commonInfo,
      notices: updatedNotices,
      updatedAt: new Date().toISOString()
    };
    
    setCommonInfo(updatedInfo);
    
    if (onChange) {
      onChange(updatedInfo);
    }
  }, [commonInfo, onChange]);

  // 공지사항 편집
  const startEditNotice = useCallback((index) => {
    setEditingIndex(index);
  }, []);

  const saveEditNotice = useCallback((index, newText) => {
    if (!newText.trim()) return;
    
    const updatedNotices = [...commonInfo.notices];
    updatedNotices[index] = newText.trim();
    
    const updatedInfo = {
      ...commonInfo,
      notices: updatedNotices,
      updatedAt: new Date().toISOString()
    };
    
    setCommonInfo(updatedInfo);
    setEditingIndex(-1);
    
    if (onChange) {
      onChange(updatedInfo);
    }
  }, [commonInfo, onChange]);

  // 현재 데이터 저장
  const saveCurrentData = useCallback(() => {
    if (!saveName.trim()) {
      alert('저장할 이름을 입력해주세요.');
      return;
    }

    try {
      const newSave = {
        id: Date.now(),
        name: saveName.trim(),
        data: commonInfo,
        createdAt: new Date().toISOString()
      };

      const updatedList = [...savedList, newSave];
      localStorage.setItem('commonInfoList', JSON.stringify(updatedList));
      setSavedList(updatedList);
      setSaveName('');
      setShowSaveModal(false);
      
      alert('공통안내가 저장되었습니다.');
    } catch (error) {
      console.error('저장 오류:', error);
      alert('저장에 실패했습니다.');
    }
  }, [saveName, commonInfo, savedList]);

  // 저장된 데이터 불러오기
  const loadSavedData = useCallback((savedData) => {
    if (confirm(`"${savedData.name}"을 불러오시겠습니까?`)) {
      setCommonInfo(savedData.data);
      if (onChange) {
        onChange(savedData.data);
      }
      alert('공통안내가 불러와졌습니다.');
    }
  }, [onChange]);

  // 저장된 데이터 삭제
  const deleteSavedData = useCallback((id) => {
    if (confirm('정말로 삭제하시겠습니까?')) {
      const updatedList = savedList.filter(item => item.id !== id);
      localStorage.setItem('commonInfoList', JSON.stringify(updatedList));
      setSavedList(updatedList);
      alert('삭제되었습니다.');
    }
  }, [savedList]);

  // 미리보기 모드
  if (displayMode) {
    return (
      <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
        <h2 className="text-xl font-bold text-gray-900 mb-4">{commonInfo.title}</h2>
        
        {commonInfo.notices && commonInfo.notices.length > 0 ? (
          <div className="space-y-3">
            {commonInfo.notices.map((notice, index) => (
              <div key={index} className="flex items-start space-x-2">
                <span className="text-gray-600 mt-1">•</span>
                <p className="text-sm text-gray-700 flex-1">{notice}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">등록된 안내사항이 없습니다.</p>
        )}
        
        {commonInfo.additionalInfo && (
          <div className="mt-4 pt-3 border-t border-gray-200">
            <p className="text-sm font-medium text-gray-800">{commonInfo.additionalInfo}</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 헤더 및 생성 버튼 */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">📋 공통 안내 관리</h2>
          <p className="text-gray-600 mt-1">호텔의 공통 안내사항을 관리하세요</p>
        </div>
        
        <Button
          color="success"
          variant="bordered"
          onPress={() => {
            if (onChange) {
              onChange(commonInfo);
            }
            alert('공통 안내가 미리보기에 생성되었습니다.');
          }}
          startContent="✨"
        >
          생성
        </Button>
      </div>

      {/* 저장된 목록 */}
      {savedList.length > 0 && (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">저장된 공통안내 목록</h3>
          </CardHeader>
          <CardBody>
            <div className="space-y-2">
              {savedList.map((item) => (
                <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">{item.name}</div>
                    <div className="text-sm text-gray-600">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      color="primary"
                      variant="bordered"
                      onPress={() => loadSavedData(item)}
                    >
                      불러오기
                    </Button>
                    <Button
                      size="sm"
                      color="danger"
                      variant="light"
                      onPress={() => deleteSavedData(item.id)}
                    >
                      삭제
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}

      {/* 공통안내 편집 */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">공통안내 편집</h3>
        </CardHeader>
        <CardBody className="space-y-6">
          {/* 제목 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">제목</label>
            <Input
              value={commonInfo.title}
              onChange={(e) => {
                const updated = { ...commonInfo, title: e.target.value };
                setCommonInfo(updated);
                if (onChange) onChange(updated);
              }}
              placeholder="공통안내"
              className="w-full"
            />
          </div>

          {/* 안내사항 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">안내사항</label>
            <div className="space-y-3">
              {commonInfo.notices.map((notice, index) => (
                <div key={index} className="flex items-center space-x-2">
                  {editingIndex === index ? (
                    <>
                      <Input
                        value={notice}
                        onChange={(e) => {
                          const updatedNotices = [...commonInfo.notices];
                          updatedNotices[index] = e.target.value;
                          setCommonInfo({ ...commonInfo, notices: updatedNotices });
                        }}
                        className="flex-1"
                        placeholder="안내사항을 입력하세요"
                      />
                      <Button
                        size="sm"
                        color="primary"
                        onPress={() => saveEditNotice(index, notice)}
                      >
                        저장
                      </Button>
                      <Button
                        size="sm"
                        variant="light"
                        onPress={() => setEditingIndex(-1)}
                      >
                        취소
                      </Button>
                    </>
                  ) : (
                    <>
                      <span className="text-gray-600 w-4">•</span>
                      <p className="flex-1 text-gray-700">{notice}</p>
                      <Button
                        size="sm"
                        variant="light"
                        onPress={() => startEditNotice(index)}
                      >
                        편집
                      </Button>
                      <Button
                        size="sm"
                        color="danger"
                        variant="light"
                        onPress={() => removeNotice(index)}
                      >
                        삭제
                      </Button>
                    </>
                  )}
                </div>
              ))}
            </div>
            
            {/* 새 안내사항 추가 */}
            <div className="flex space-x-2 mt-3">
              <Input
                value={newNotice}
                onChange={(e) => setNewNotice(e.target.value)}
                placeholder="새 안내사항을 입력하세요"
                className="flex-1"
                onKeyPress={(e) => e.key === 'Enter' && addNotice()}
              />
              <Button
                color="primary"
                onPress={addNotice}
                disabled={!newNotice.trim()}
              >
                추가
              </Button>
            </div>
          </div>

          {/* 추가 정보 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">추가 정보</label>
            <Input
              value={commonInfo.additionalInfo}
              onChange={(e) => {
                const updated = { ...commonInfo, additionalInfo: e.target.value };
                setCommonInfo(updated);
                if (onChange) onChange(updated);
              }}
              placeholder="인원추가 현장결제"
              className="w-full"
            />
          </div>
        </CardBody>
      </Card>

      {/* 저장 모달 */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">공통안내 저장</h3>
            <Input
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              placeholder="저장할 이름을 입력하세요"
              className="w-full mb-4"
            />
            <div className="flex justify-end space-x-2">
              <Button
                variant="light"
                onPress={() => setShowSaveModal(false)}
              >
                취소
              </Button>
              <Button
                color="primary"
                onPress={saveCurrentData}
                disabled={!saveName.trim()}
              >
                저장
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommonInfo;
