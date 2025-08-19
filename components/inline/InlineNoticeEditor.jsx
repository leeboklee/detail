'use client';

import React, { useState } from 'react';
import { Button, Input, Textarea, Chip, Divider, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from "@heroui/react";
import { FaPlus, FaTrash, FaSave, FaTimes, FaDownload, FaUpload } from 'react-icons/fa';

const InlineNoticeEditor = ({ notices = [], onNoticesChange }) => {
  const [editingIndex, setEditingIndex] = useState(null);
  const [tempNotice, setTempNotice] = useState({});
  const [savedTemplates, setSavedTemplates] = useState([]);
  const [templateName, setTemplateName] = useState('');
  const { isOpen: isSaveModalOpen, onOpen: onSaveModalOpen, onClose: onSaveModalClose } = useDisclosure();
  const { isOpen: isLoadModalOpen, onOpen: onLoadModalOpen, onClose: onLoadModalClose } = useDisclosure();

  const startEditing = (index) => {
    setEditingIndex(index);
    setTempNotice(notices[index] || {
      title: '',
      content: '',
      priority: 'normal',
      isActive: true
    });
  };

  const saveNotice = () => {
    const updatedNotices = [...notices];
    if (editingIndex !== null) {
      updatedNotices[editingIndex] = tempNotice;
    } else {
      updatedNotices.push(tempNotice);
    }
    onNoticesChange(updatedNotices);
    setEditingIndex(null);
    setTempNotice({});
  };

  const cancelEditing = () => {
    setEditingIndex(null);
    setTempNotice({});
  };

  const deleteNotice = (index) => {
    const updatedNotices = notices.filter((_, i) => i !== index);
    onNoticesChange(updatedNotices);
  };

  const addNotice = () => {
    setEditingIndex(notices.length);
    setTempNotice({
      title: '',
      content: '',
      priority: 'normal',
      isActive: true
    });
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'danger';
      case 'normal': return 'primary';
      case 'low': return 'default';
      default: return 'primary';
    }
  };

  const getPriorityText = (priority) => {
    switch (priority) {
      case 'high': return '높음';
      case 'normal': return '보통';
      case 'low': return '낮음';
      default: return '보통';
    }
  };

  // 공지사항 템플릿 저장
  const saveNoticeTemplate = async () => {
    if (!templateName.trim()) {
      alert('템플릿 이름을 입력해주세요.');
      return;
    }

    try {
      const response = await fetch('/api/notices/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: templateName,
          notices: notices
        })
      });

      const result = await response.json();
      
      if (result.success) {
        alert('공지사항 템플릿이 저장되었습니다.');
        setTemplateName('');
        onSaveModalClose();
        loadSavedTemplates();
      } else {
        alert('저장 실패: ' + result.message);
      }
    } catch (error) {
      console.error('공지사항 저장 오류:', error);
      alert('공지사항 저장 중 오류가 발생했습니다.');
    }
  };

  // 저장된 템플릿 목록 로드
  const loadSavedTemplates = async () => {
    try {
      const response = await fetch('/api/notices/save');
      const result = await response.json();
      
      if (result.success) {
        setSavedTemplates(result.data);
      }
    } catch (error) {
      console.error('템플릿 목록 로드 오류:', error);
    }
  };

  // 템플릿 불러오기
  const loadTemplate = (template) => {
    if (template.notices && Array.isArray(template.notices)) {
      onNoticesChange(template.notices);
      onLoadModalClose();
      alert('공지사항 템플릿을 불러왔습니다.');
    } else {
      alert('템플릿 데이터가 올바르지 않습니다.');
    }
  };

  // 모달 열 때 템플릿 목록 로드
  const handleLoadModalOpen = () => {
    loadSavedTemplates();
    onLoadModalOpen();
  };

  return (
    <div className="space-y-6">
      {/* 저장/불러오기 버튼 */}
      <div className="flex gap-2 mb-4">
        <Button
          color="primary"
          variant="bordered"
          onPress={onSaveModalOpen}
          startContent={<FaDownload />}
          size="sm"
        >
          공지사항 저장
        </Button>
        <Button
          color="secondary"
          variant="bordered"
          onPress={handleLoadModalOpen}
          startContent={<FaUpload />}
          size="sm"
        >
          공지사항 불러오기
        </Button>
      </div>
      {/* 기존 공지사항 목록 */}
      {notices.map((notice, index) => (
        <div key={index} className="border rounded-lg p-4 bg-gray-50">
          {editingIndex === index ? (
            // 편집 모드
            (<div className="space-y-4">
              <Input
                label="제목"
                value={tempNotice.title}
                onChange={(e) => setTempNotice({ ...tempNotice, title: e.target.value })}
                placeholder="공지사항 제목을 입력하세요"
                size="sm"
                classNames={{
                  input: "text-gray-800 bg-white border-gray-300",
                  label: "text-gray-700 font-medium"
                }}
              />
              <Textarea
                label="내용"
                value={tempNotice.content}
                onChange={(e) => setTempNotice({ ...tempNotice, content: e.target.value })}
                placeholder="공지사항 내용을 입력하세요"
                rows={4}
                classNames={{
                  input: "text-gray-800 bg-white border-gray-300",
                  label: "text-gray-700 font-medium"
                }}
              />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">우선순위</label>
                  <select
                    value={tempNotice.priority}
                    onChange={(e) => setTempNotice({ ...tempNotice, priority: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="low">낮음</option>
                    <option value="normal">보통</option>
                    <option value="high">높음</option>
                  </select>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id={`active-${index}`}
                    checked={tempNotice.isActive}
                    onChange={(e) => setTempNotice({ ...tempNotice, isActive: e.target.checked })}
                    className="mr-2"
                  />
                  <label htmlFor={`active-${index}`} className="text-sm">
                    활성화
                  </label>
                </div>
              </div>
              <div className="flex gap-2">
                <Button color="primary" onPress={saveNotice} startContent={<FaSave />}>
                  저장
                </Button>
                <Button color="default" onPress={cancelEditing} startContent={<FaTimes />}>
                  취소
                </Button>
              </div>
            </div>)
          ) : (
            // 보기 모드
            (<div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold text-lg">{notice.title}</h3>
                  <Chip
                    size="sm"
                    color={getPriorityColor(notice.priority)}
                    variant="flat"
                  >
                    {getPriorityText(notice.priority)}
                  </Chip>
                  {!notice.isActive && (
                    <Chip size="sm" color="default" variant="flat">
                      비활성
                    </Chip>
                  )}
                </div>
                {notice.content && (
                  <p className="text-gray-700 whitespace-pre-wrap">{notice.content}</p>
                )}
              </div>
              <div className="flex gap-2">
                <Button size="sm" color="primary" onPress={() => startEditing(index)}>
                  편집
                </Button>
                <Button size="sm" color="danger" onPress={() => deleteNotice(index)} startContent={<FaTrash />}>
                  삭제
                </Button>
              </div>
            </div>)
          )}
        </div>
      ))}
      {/* 새 공지사항 추가 */}
      {editingIndex === notices.length && (
        <div className="border rounded-lg p-4 bg-blue-50">
          <h3 className="font-semibold text-lg mb-4">새 공지사항 추가</h3>
          <div className="space-y-4">
            <Input
              label="제목"
              value={tempNotice.title}
              onChange={(e) => setTempNotice({ ...tempNotice, title: e.target.value })}
              placeholder="공지사항 제목을 입력하세요"
              size="sm"
              classNames={{
                input: "text-gray-800 bg-white border-gray-300",
                label: "text-gray-700 font-medium"
              }}
            />
            
            <Textarea
              label="내용"
              value={tempNotice.content}
              onChange={(e) => setTempNotice({ ...tempNotice, content: e.target.value })}
              placeholder="공지사항 내용을 입력하세요"
              rows={4}
              classNames={{
                input: "text-gray-800 bg-white border-gray-300",
                label: "text-gray-700 font-medium"
              }}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">우선순위</label>
                <select
                  value={tempNotice.priority}
                  onChange={(e) => setTempNotice({ ...tempNotice, priority: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="low">낮음</option>
                  <option value="normal">보통</option>
                  <option value="high">높음</option>
                </select>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="active-new"
                  checked={tempNotice.isActive}
                  onChange={(e) => setTempNotice({ ...tempNotice, isActive: e.target.checked })}
                  className="mr-2"
                />
                <label htmlFor="active-new" className="text-sm">
                  활성화
                </label>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button color="primary" onPress={saveNotice} startContent={<FaSave />}>
                저장
              </Button>
              <Button color="default" onPress={cancelEditing} startContent={<FaTimes />}>
                취소
              </Button>
            </div>
          </div>
        </div>
      )}
      {/* 새 공지사항 추가 버튼 */}
      {editingIndex === null && (
        <Button color="primary" onPress={addNotice} startContent={<FaPlus />}>
          새 공지사항 추가
        </Button>
      )}
      {/* 저장 모달 */}
      <Modal isOpen={isSaveModalOpen} onClose={onSaveModalClose}>
        <ModalContent>
          <ModalHeader>공지사항 템플릿 저장</ModalHeader>
          <ModalBody>
            <Input
              label="템플릿 이름"
              placeholder="예: 시즌 공지사항, 이벤트 공지사항"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              size="sm"
              classNames={{
                input: "text-gray-800 bg-white border-gray-300",
                label: "text-gray-700 font-medium"
              }}
            />
            <p className="text-sm text-gray-500 mt-2">
              현재 {notices.length}개의 공지사항이 저장됩니다.
            </p>
          </ModalBody>
          <ModalFooter>
            <Button color="danger" variant="light" onPress={onSaveModalClose}>
              취소
            </Button>
            <Button color="primary" onPress={saveNoticeTemplate}>
              저장
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      {/* 불러오기 모달 */}
      <Modal isOpen={isLoadModalOpen} onClose={onLoadModalClose} size="2xl">
        <ModalContent>
          <ModalHeader>공지사항 템플릿 불러오기</ModalHeader>
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
                          공지사항 {Array.isArray(template.notices) ? template.notices.length : 0}개
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
                저장된 공지사항 템플릿이 없습니다.
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

export default InlineNoticeEditor; 