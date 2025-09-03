'use client';



import React, { useState, useCallback } from 'react';



import Labels from '@/src/shared/labels';

import { Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, Input, Select, SelectItem } from "@heroui/react";

import { useEffect } from 'react';



// socket listener to show agent notifications in UI

import io from 'socket.io-client';



let socket;



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



export const MainLayout = ({ children, onGenerateHtml, isGenerating, generatedHtml, lastGenerated, onExportData, onImportData, data, activeTab }) => {

  const { isOpen: isPreviewOpen, onOpen: onPreviewOpen, onClose: onPreviewClose } = useDisclosure();

  const { isOpen: isSettingsOpen, onOpen: onSettingsOpen, onClose: onSettingsClose } = useDisclosure();

  const { isOpen: isLoadOpen, onOpen: onLoadOpen, onClose: onLoadClose } = useDisclosure();



  const [device, setDevice] = useState('desktop'); // desktop | galaxy | iphone



  // HTML 복사 함수

  const copyHtml = useCallback(async () => {

    try {

      await navigator.clipboard.writeText(generatedHtml || '');

      // 성공 알림

    } catch (error) {

      console.error('복사 실패:', error);

    }

  }, [generatedHtml]);



  // HTML 다운로드 함수

  const downloadHtml = useCallback(() => {

    try {

      const blob = new Blob([generatedHtml || ''], { type: 'text/html' });

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



  useEffect(() => {

    try {

      socket = io(process.env.SOCKET_SERVER_URL || 'http://localhost:4001');

      socket.on('agent-notify', ({ title, message, extra, timestamp }) => {

        // 간단히 alert로 표시 (추후 채팅창에 자동 삽입 로직으로 대체)

        alert(`${title}: ${message}\n${timestamp}`);

        console.log('Agent notify', title, message, extra);

      });

    } catch (e) {

      console.error('Socket client failed to connect', e);

    }



    return () => {

      try { socket && socket.disconnect(); } catch(e) {}

    }

  }, []);



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

                color="default"

                variant="flat"

                onPress={onExportData}

                startContent={Icons.download}

              >

                백업/내보내기

              </Button>

              <div>
                <Button
                  size="sm"
                  color="default"
                  variant="flat"
                  startContent={Icons.upload}
                  onPress={onLoadOpen}
                >
                  불러오기
                </Button>
              </div>

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

              



            </div>

          </div>

        </div>

      </header>



      {/* 메인 콘텐츠 */}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {children}

      </main>



      {/* 설정 모달 */}

      <Modal isOpen={isSettingsOpen} onClose={onSettingsClose} size="2xl" backdrop="opaque">

        <ModalContent className="bg-white">

          <ModalHeader>시스템 설정</ModalHeader>

          <ModalBody>

            <div className="space-y-4">

              <div>

                <label className="block text-sm font-medium text-gray-700 mb-2">{Labels.시스템_이름}</label>

                <Input

                  placeholder={Labels["시스템_이름을_입력하세요_PH"]}

                  defaultValue="호텔 정보 관리 시스템"

                />

              </div>

              

              <div>

                <label className="block text-sm font-medium text-gray-700 mb-2">{Labels.테마_설정}</label>

                <Select placeholder={Labels["테마를_선택하세요_PH"]}>

                  <SelectItem key="light">라이트 모드</SelectItem>

                  <SelectItem key="dark">다크 모드</SelectItem>

                  <SelectItem key="auto">자동</SelectItem>

                </Select>

              </div>

              

              <div>

                <label className="block text-sm font-medium text-gray-700 mb-2">{Labels.언어_설정}</label>

                <Select placeholder={Labels["언어를_선택하세요_PH"]}>

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

      <Modal isOpen={isPreviewOpen} onClose={onPreviewClose} size="4xl">
        <ModalContent className="max-w-6xl mx-auto">
          <ModalHeader>HTML 미리보기</ModalHeader>
          <ModalBody>
            <div className="space-y-4">

              <div className="flex justify-between items-center">

                <div className="text-sm text-gray-600">

                  {lastGenerated ? `마지막 생성: ${lastGenerated.toLocaleString()}` : 'HTML이 자동으로 생성되었습니다.'}
                </div>

                <div className="flex space-x-2">

                  <Button

                    size="sm"

                    color="secondary"

                    variant="flat"

                    onPress={copyHtml}
                    isDisabled={!generatedHtml || isGenerating}
                  >

                    복사

                  </Button>

                  <Button
                    size="sm"
                    color="primary"
                    variant="flat"
                    onPress={downloadHtml}
                    isDisabled={!generatedHtml || isGenerating}
                  >
                    다운로드
                  </Button>
                </div>

              </div>

              

              {/* 디바이스 선택 */}
              <div className="flex justify-center space-x-4">
                <Button
                  size="sm"
                  variant={device === 'desktop' ? 'solid' : 'flat'}
                  color={device === 'desktop' ? 'primary' : 'default'}
                  onPress={() => setDevice('desktop')}
                >
                  🖥️ Desktop (1200px)
                </Button>
                <Button
                  size="sm"
                  variant={device === 'tablet' ? 'solid' : 'flat'}
                  color={device === 'tablet' ? 'primary' : 'default'}
                  onPress={() => setDevice('tablet')}
                >
                  📱 Tablet (768px)
                </Button>
                <Button
                  size="sm"
                  variant={device === 'mobile' ? 'solid' : 'flat'}
                  color={device === 'mobile' ? 'primary' : 'default'}
                  onPress={() => setDevice('mobile')}
                >
                  📱 Mobile (375px)
                </Button>
                          </div>

                          

              {/* HTML 생성 중 로딩 상태 */}
              {isGenerating && (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">HTML을 생성하고 있습니다...</p>
                              </div>

                            )}

              
              {/* 전체 페이지 미리보기 */}
              {generatedHtml && !isGenerating ? (
                <div className="border rounded-lg overflow-hidden bg-white">
                  <div className="bg-gray-100 px-4 py-2 border-b text-sm text-gray-600">
                    <span className="font-medium">디바이스:</span> {
                      device === 'desktop' ? 'Desktop (1200px)' :
                      device === 'tablet' ? 'Tablet (768px)' :
                      'Mobile (375px)'
                    }
                              </div>

                  <div className="flex justify-center bg-gray-200 p-4">
                    <div 
                      className="bg-white shadow-lg overflow-hidden"
                      style={{
                        width: device === 'desktop' ? '100%' : 
                               device === 'tablet' ? '768px' : '375px',
                        maxWidth: '100%'
                      }}
                    >
                      <iframe
                        title="html-preview"
                        srcDoc={generatedHtml}
                        sandbox="allow-same-origin allow-popups allow-forms allow-scripts"
                        className="w-full"
                        style={{ 
                          height: device === 'desktop' ? '70vh' : 
                                   device === 'tablet' ? '80vh' : '90vh',
                          border: 'none'
                        }}
                      />
                    </div>

                  </div>

                </div>

              ) : !isGenerating ? (
                <div className="text-center text-gray-500 py-16">
                  <p className="mb-2">HTML 생성에 실패했습니다.</p>
                  <p className="text-sm">다시 시도해주세요.</p>
              </div>

              ) : null}
            </div>

          </ModalBody>

          <ModalFooter>

            <Button variant="light" onPress={onPreviewClose}>

              닫기

            </Button>

          </ModalFooter>

        </ModalContent>

      </Modal>



      {/* 불러오기 모달 */}
      <Modal isOpen={isLoadOpen} onClose={onLoadClose} size="2xl" backdrop="opaque">
        <ModalContent className="bg-white">
          <ModalHeader>HTML 파일 불러오기</ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <Input
                label="HTML 파일"
                type="file"
                accept="text/html"
                onChange={(e) => {
                  const f = e.target.files && e.target.files[0];
                  if (f && onImportData) {
                    onImportData(f);
                    e.target.value = ''; // Clear the input value after selection
                  }
                }}
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onLoadClose}>
              취소
            </Button>
            <Button color="primary" onPress={onLoadClose}>
              불러오기
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

    </div>

  );

};



export default MainLayout;


