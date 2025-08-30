'use client';

import React, { useState, useEffect } from 'react';

import Labels from '@/src/shared/labels';
import { Button, Input, Textarea, Select, SelectItem, Chip } from "@heroui/react";

const Notice = ({ value = { notices: [] }, onChange }) => {
  const [notices, setNotices] = useState(value.notices || []);
  const [editingIndex, setEditingIndex] = useState(-1);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newNotice, setNewNotice] = useState({
    title: '',
    content: '',
    type: 'info',
    priority: 'normal',
    isActive: true
  });

  useEffect(() => {
    if (value.notices) {
      setNotices(value.notices);
    }
  }, [value.notices]);

  const addNotice = () => {
    if (newNotice.title.trim() && newNotice.content.trim()) {
      const notice = {
        ...newNotice,
        id: Date.now(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const updatedNotices = [...notices, notice];
      setNotices(updatedNotices);
      onChange({ ...value, notices: updatedNotices });
      
      // 폼 초기화
      setNewNotice({
        title: '',
        content: '',
        type: 'info',
        priority: 'normal',
        isActive: true
      });
      setShowAddForm(false);
    }
  };

  const updateNotice = (index, field, value) => {
    const updatedNotices = [...notices];
    updatedNotices[index] = { 
      ...updatedNotices[index], 
      [field]: value,
      updatedAt: new Date().toISOString()
    };
    setNotices(updatedNotices);
    onChange({ ...value, notices: updatedNotices });
  };

  const deleteNotice = (index) => {
    if (confirm('정말로 이 공지사항을 삭제하시겠습니까?')) {
      const updatedNotices = notices.filter((_, i) => i !== index);
      setNotices(updatedNotices);
      onChange({ ...value, notices: updatedNotices });
      if (editingIndex === index) {
        setEditingIndex(-1);
      }
    }
  };

  const startEdit = (index) => {
    setEditingIndex(index);
  };

  const saveEdit = (index) => {
    setEditingIndex(-1);
  };

  const toggleActive = (index) => {
    updateNotice(index, 'isActive', !notices[index].isActive);
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'important': return '⚠️';
      case 'info': return 'ℹ️';
      case 'success': return '✅';
      case 'warning': return '🚨';
      default: return '📢';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'danger';
      case 'normal': return 'primary';
      case 'low': return 'secondary';
      default: return 'default';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'important': return 'danger';
      case 'info': return 'primary';
      case 'success': return 'success';
      case 'warning': return 'warning';
      default: return 'default';
    }
  };

  return (
    <div className="space-y-6">
      {/* 헤더 및 생성 버튼 */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">📢 공지사항 관리</h2>
          <p className="text-gray-600 mt-1">호텔의 공지사항을 관리하세요</p>
        </div>
        
        <Button
          color="success"
          variant="bordered"
          onPress={() => {
            if (onChange) {
              onChange({ notices });
            }
            alert('공지사항이 미리보기에 생성되었습니다.');
          }}
          startContent="✨"
        >
          생성
        </Button>
      </div>

      {/* 공지사항 추가 폼 */}
      {showAddForm && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">새 공지사항 추가</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label={Labels["제목"]}
                placeholder={Labels["공지사항_제목을_입력하세요_PH"]}
                value={newNotice.title}
                onChange={(e) => setNewNotice({ ...newNotice, title: e.target.value })}
                isRequired
              />
              <Select 
                label={Labels["공지_유형"]} 
                selectedKeys={[newNotice.type]}
                onSelectionChange={(keys) => setNewNotice({ ...newNotice, type: Array.from(keys)[0] })}
              >
                <SelectItem key="info">일반 정보</SelectItem>
                <SelectItem key="important">중요 안내</SelectItem>
                <SelectItem key="success">성공/완료</SelectItem>
                <SelectItem key="warning">주의사항</SelectItem>
              </Select>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select 
                label={Labels["우선순위"]} 
                selectedKeys={[newNotice.priority]}
                onSelectionChange={(keys) => setNewNotice({ ...newNotice, priority: Array.from(keys)[0] })}
              >
                <SelectItem key="low">낮음</SelectItem>
                <SelectItem key="normal">보통</SelectItem>
                <SelectItem key="high">높음</SelectItem>
              </Select>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={newNotice.isActive}
                  onChange={(e) => setNewNotice({ ...newNotice, isActive: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-700">{Labels.활성화}</label>
              </div>
            </div>
            
            <Textarea
              label={Labels["내용"]}
              placeholder={Labels["공지사항_내용을_입력하세요_PH"]}
              value={newNotice.content}
              onChange={(e) => setNewNotice({ ...newNotice, content: e.target.value })}
              minRows={3}
              isRequired
            />
          </div>
          
          <div className="flex gap-2 mt-4">
            <Button 
              color="primary" 
              onPress={addNotice}
              disabled={!newNotice.title.trim() || !newNotice.content.trim()}
            >
              추가
            </Button>
            <Button variant="light" onPress={() => setShowAddForm(false)}>
              취소
            </Button>
          </div>
        </div>
      )}

      {/* 공지사항 목록 */}
      <div className="space-y-4">
        {notices.length > 0 ? (
          notices.map((notice, index) => (
            <div key={notice.id || index} className="border border-gray-200 rounded-lg bg-white overflow-hidden">
              {editingIndex === index ? (
                // 편집 모드
                <div className="p-4">
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label={Labels["제목_1"]}
                        value={notice.title}
                        onChange={(e) => updateNotice(index, 'title', e.target.value)}
                      />
                      <Select 
                        label={Labels["공지_유형_1"]} 
                        selectedKeys={[notice.type]}
                        onSelectionChange={(keys) => updateNotice(index, 'type', Array.from(keys)[0])}
                      >
                        <SelectItem key="info">일반 정보</SelectItem>
                        <SelectItem key="important">중요 안내</SelectItem>
                        <SelectItem key="success">성공/완료</SelectItem>
                        <SelectItem key="warning">주의사항</SelectItem>
                      </Select>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Select 
                        label={Labels["우선순위_1"]} 
                        selectedKeys={[notice.priority]}
                        onSelectionChange={(keys) => updateNotice(index, 'priority', Array.from(keys)[0])}
                      >
                        <SelectItem key="low">낮음</SelectItem>
                        <SelectItem key="normal">보통</SelectItem>
                        <SelectItem key="high">높음</SelectItem>
                      </Select>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`isActive-${index}`}
                          checked={notice.isActive}
                          onChange={(e) => updateNotice(index, 'isActive', e.target.checked)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor={`isActive-${index}`} className="text-sm font-medium text-gray-700">{Labels.활성화_1}</label>
                      </div>
                    </div>
                    
                    <Textarea
                      label={Labels["내용_1"]}
                      value={notice.content}
                      onChange={(e) => updateNotice(index, 'content', e.target.value)}
                      minRows={3}
                    />
                  </div>
                  
                  <div className="flex gap-2 mt-4">
                    <Button color="primary" onPress={() => saveEdit(index)}>
                      저장
                    </Button>
                    <Button variant="light" onPress={() => setEditingIndex(-1)}>
                      취소
                    </Button>
                  </div>
                </div>
              ) : (
                // 보기 모드
                <div className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xl">{getTypeIcon(notice.type)}</span>
                        <h3 className="text-lg font-semibold text-gray-900">{notice.title}</h3>
                        <Chip
                          color={getTypeColor(notice.type)}
                          variant="flat"
                          size="sm"
                        >
                          {notice.type === 'info' ? '일반' : 
                           notice.type === 'important' ? '중요' : 
                           notice.type === 'success' ? '성공' : 
                           notice.type === 'warning' ? '주의' : notice.type}
                        </Chip>
                        <Chip
                          color={getPriorityColor(notice.priority)}
                          variant="flat"
                          size="sm"
                        >
                          {notice.priority === 'high' ? '높음' : 
                           notice.priority === 'normal' ? '보통' : '낮음'}
                        </Chip>
                        {!notice.isActive && (
                          <Chip color="default" variant="flat" size="sm">
                            비활성
                          </Chip>
                        )}
                      </div>
                      <p className="text-gray-600">{notice.content}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span>생성: {new Date(notice.createdAt).toLocaleDateString()}</span>
                        {notice.updatedAt !== notice.createdAt && (
                          <span>수정: {new Date(notice.updatedAt).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button
                        size="sm"
                        variant="light"
                        onPress={() => startEdit(index)}
                      >
                        편집
                      </Button>
                      <Button
                        size="sm"
                        variant="light"
                        onPress={() => toggleActive(index)}
                      >
                        {notice.isActive ? '비활성화' : '활성화'}
                      </Button>
                      <Button
                        size="sm"
                        color="danger"
                        variant="light"
                        onPress={() => deleteNotice(index)}
                      >
                        삭제
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>등록된 공지사항이 없습니다.</p>
            <p className="text-sm mt-1">공지사항 추가 버튼을 클릭하여 첫 번째 공지사항을 등록하세요.</p>
          </div>
        )}
      </div>

      {/* 공지사항 요약 */}
      {notices.length > 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">공지사항 요약</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl mb-1">📢</div>
              <div className="text-sm font-medium text-gray-700">전체</div>
              <div className="text-lg font-bold text-blue-600">{notices.length}개</div>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-1">✅</div>
              <div className="text-sm font-medium text-gray-700">활성</div>
              <div className="text-lg font-bold text-green-600">{notices.filter(n => n.isActive).length}개</div>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-1">⚠️</div>
              <div className="text-sm font-medium text-gray-700">중요</div>
              <div className="text-lg font-bold text-red-600">{notices.filter(n => n.type === 'important').length}개</div>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-1">📅</div>
              <div className="text-sm font-medium text-gray-700">이번 달</div>
              <div className="text-lg font-bold text-purple-600">
                {notices.filter(n => {
                  const created = new Date(n.createdAt);
                  const now = new Date();
                  return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
                }).length}개
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notice; 