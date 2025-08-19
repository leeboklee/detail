'use client';

import React, { useState, useEffect, useCallback } from 'react';
// Context 제거 - props 사용
import { Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Input, Textarea, Select, SelectItem } from "@heroui/react";
import { NoticeTable } from '../ui/EnhancedTable';

// 공지사항 편집 모달 컴포넌트
function NoticeEditModal({ isOpen, onClose, notice, onSave, isNew = false }) {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'general',
    priority: 'normal',
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    if (notice) {
      setFormData(notice);
    }
  }, [notice]);

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl" scrollBehavior="inside">
      <ModalContent>
        <ModalHeader>
          {isNew ? '새 공지사항 추가' : '공지사항 편집'}
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <Input
              label="제목"
              value={formData.title}
              onValueChange={(value) => setFormData(prev => ({ ...prev, title: value }))}
              placeholder="공지사항 제목을 입력하세요"
              size="sm"
              classNames={{
                input: "text-gray-800 bg-white border-gray-300",
                label: "text-gray-700 font-medium"
              }}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <Select
                label="카테고리"
                selectedKeys={[formData.category]}
                onSelectionChange={(keys) => setFormData(prev => ({ ...prev, category: Array.from(keys)[0] }))}
                size="sm"
                classNames={{
                  trigger: "text-gray-800 bg-white border-gray-300",
                  label: "text-gray-700 font-medium"
                }}
              >
                <SelectItem key="general">일반</SelectItem>
                <SelectItem key="important">중요</SelectItem>
                <SelectItem key="maintenance">점검</SelectItem>
                <SelectItem key="event">이벤트</SelectItem>
              </Select>
              
              <Select
                label="우선순위"
                selectedKeys={[formData.priority]}
                onSelectionChange={(keys) => setFormData(prev => ({ ...prev, priority: Array.from(keys)[0] }))}
                size="sm"
                classNames={{
                  trigger: "text-gray-800 bg-white border-gray-300",
                  label: "text-gray-700 font-medium"
                }}
              >
                <SelectItem key="low">낮음</SelectItem>
                <SelectItem key="normal">보통</SelectItem>
                <SelectItem key="high">높음</SelectItem>
                <SelectItem key="urgent">긴급</SelectItem>
              </Select>
            </div>
            
            <Input
              type="date"
              label="등록일"
              value={formData.date}
              onValueChange={(value) => setFormData(prev => ({ ...prev, date: value }))}
              size="sm"
              classNames={{
                input: "text-gray-800 bg-white border-gray-300",
                label: "text-gray-700 font-medium"
              }}
            />
            
            <Textarea
              label="내용"
              value={formData.content}
              onValueChange={(value) => setFormData(prev => ({ ...prev, content: value }))}
              placeholder="공지사항 내용을 입력하세요"
              rows={6}
              classNames={{
                input: "text-gray-800 bg-white border-gray-300",
                label: "text-gray-700 font-medium"
              }}
            />
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="danger" variant="light" onPress={onClose}>
            취소
          </Button>
          <Button color="primary" onPress={handleSave}>
            저장
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default function Notice({ value = [], onChange }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNotice, setEditingNotice] = useState(null);
  const [isNewNotice, setIsNewNotice] = useState(false);

  const notices = value || [];

  const handleAddNotice = () => {
    setEditingNotice(null);
    setIsNewNotice(true);
    setIsModalOpen(true);
  };

  const handleEditNotice = (notice, index) => {
    setEditingNotice({ ...notice, index });
    setIsNewNotice(false);
    setIsModalOpen(true);
  };

  const handleDeleteNotice = (notice, index) => {
    const updatedNotices = notices.filter((_, i) => i !== index);
    onChange('notices', updatedNotices);
  };

  const handleSaveNotice = (noticeData) => {
    let updatedNotices;
    
    if (isNewNotice) {
      updatedNotices = [...notices, { ...noticeData, id: Date.now().toString() }];
    } else {
      updatedNotices = notices.map((notice, index) => 
        index === editingNotice.index ? { ...noticeData, id: notice.id } : notice
      );
    }
    
    onChange('notices', updatedNotices);
  };

  return (
    <div className="notice-manager">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">공지사항 관리</h3>
        <p className="text-sm text-gray-600">
          호텔의 공지사항을 관리하고 편집할 수 있습니다.
        </p>
      </div>

      <NoticeTable
        notices={notices}
        onEdit={handleEditNotice}
        onDelete={handleDeleteNotice}
        onAdd={handleAddNotice}
      />

      <NoticeEditModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        notice={editingNotice}
        onSave={handleSaveNotice}
        isNew={isNewNotice}
      />
    </div>
  );
} 