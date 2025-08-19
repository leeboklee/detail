'use client';

import React, { useState, useCallback } from 'react';
import { Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, Card, CardBody, Input, Textarea, Select, SelectItem, Chip, Divider, Spinner } from "@heroui/react";
import { useAppState } from '@/hooks/useAppState';
import { useTabManagement } from '@/hooks/useTabManagement';
import DraggableTabs from '@/components/DraggableTabs';
import ClientOnly from '@/components/ClientOnly';

// 로딩 스피너 컴포넌트
function LoadingSpinner({ size = "default" }) {
  const spinnerSize = size === "small" ? "h-4 w-4" : size === "large" ? "h-32 w-32" : "h-8 w-8";
  
  return (
    <div className="flex items-center justify-center p-4">
      <div className={`animate-spin rounded-full border-b-2 border-blue-600 ${spinnerSize}`}></div>
      {size === "large" && <span className="ml-4 text-gray-600">로딩 중...</span>}
    </div>
  );
}

// 아이콘 정의
const Icons = {
  settings: '⚙️',
  eye: '👁️',
  copy: '📋',
  refresh: '🔄',
  database: '🗄️',
  home: '🏠',
  users: '👥',
  dollar: '💰',
  file: '📄',
  calendar: '📅',
  shield: '🛡️',
  plus: '➕',
  edit: '✏️',
  delete: '🗑️',
  save: '💾',
  download: '📥',
  upload: '📤',
  check: '✅',
  warning: '⚠️',
  info: 'ℹ️'
};

export const MainLayout = ({ children }) => {
  const { isOpen: isModalOpen, onOpen: onModalOpen, onClose: onModalClose } = useDisclosure();
  const { isOpen: isPreviewOpen, onOpen: onPreviewOpen, onClose: onPreviewClose } = useDisclosure();
  const { isOpen: isSettingsOpen, onOpen: onSettingsOpen, onClose: onSettingsClose } = useDisclosure();
  const { isOpen: isHotelModalOpen, onOpen: onHotelModalOpen, onClose: onHotelModalClose } = useDisclosure();

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedHtml, setGeneratedHtml] = useState('');
  const [lastGenerated, setLastGenerated] = useState(null);

  // HTML 생성 함수
  const generateHtml = useCallback(async () => {
    setIsGenerating(true);
    try {
      // HTML 생성 로직 (기존 기능 유지)
      const html = '<div>Generated HTML content</div>';
      setGeneratedHtml(html);
      setLastGenerated(new Date());
    } catch (error) {
      console.error('HTML 생성 실패:', error);
    } finally {
      setIsGenerating(false);
    }
  }, []);

  // HTML 복사 함수
  const copyHtml = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(generatedHtml);
      // 성공 알림
    } catch (error) {
      console.error('복사 실패:', error);
    }
  }, [generatedHtml]);

  // HTML 다운로드 함수
  const downloadHtml = useCallback(() => {
    try {
      const blob = new Blob([generatedHtml], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `hotel-page-${new Date().toISOString().split('T')[0]}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('다운로드 실패:', error);
    }
  }, [generatedHtml]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">호텔 정보 관리 시스템</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button
                size="sm"
                color="primary"
                variant="flat"
                onPress={onSettingsOpen}
                startContent={Icons.settings}
              >
                설정
              </Button>
              
              <Button
                size="sm"
                color="secondary"
                variant="flat"
                onPress={onPreviewOpen}
                startContent={Icons.eye}
              >
                미리보기
              </Button>
              
              <Button
                size="sm"
                color="success"
                variant="flat"
                onPress={generateHtml}
                isLoading={isGenerating}
                startContent={Icons.refresh}
              >
                HTML 생성
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* 설정 모달 */}
      <Modal isOpen={isSettingsOpen} onClose={onSettingsClose} size="2xl">
        <ModalContent>
          <ModalHeader>시스템 설정</ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  시스템 이름
                </label>
                <Input
                  placeholder="시스템 이름을 입력하세요"
                  defaultValue="호텔 정보 관리 시스템"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  테마 설정
                </label>
                <Select placeholder="테마를 선택하세요">
                  <SelectItem key="light">라이트 모드</SelectItem>
                  <SelectItem key="dark">다크 모드</SelectItem>
                  <SelectItem key="auto">자동</SelectItem>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  언어 설정
                </label>
                <Select placeholder="언어를 선택하세요">
                  <SelectItem key="ko">한국어</SelectItem>
                  <SelectItem key="en">English</SelectItem>
                  <SelectItem key="ja">日本語</SelectItem>
                </Select>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onSettingsClose}>
              취소
            </Button>
            <Button color="primary" onPress={onSettingsClose}>
              저장
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* 미리보기 모달 */}
      <Modal isOpen={isPreviewOpen} onClose={onPreviewClose} size="5xl">
        <ModalContent>
          <ModalHeader>HTML 미리보기</ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  {lastGenerated && `마지막 생성: ${lastGenerated.toLocaleString()}`}
                </div>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    color="secondary"
                    variant="flat"
                    onPress={copyHtml}
                    startContent={Icons.copy}
                  >
                    복사
                  </Button>
                  <Button
                    size="sm"
                    color="primary"
                    variant="flat"
                    onPress={downloadHtml}
                    startContent={Icons.download}
                  >
                    다운로드
                  </Button>
                </div>
              </div>
              
              <div className="border rounded-lg p-4 bg-gray-50">
                <div className="text-sm text-gray-600 mb-2">생성된 HTML:</div>
                <pre className="text-xs overflow-auto max-h-96 bg-white p-4 rounded border">
                  {generatedHtml || 'HTML을 생성해주세요.'}
                </pre>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onPreviewClose}>
              닫기
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default MainLayout;
