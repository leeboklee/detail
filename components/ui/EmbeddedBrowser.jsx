import React, { useState, useCallback, useRef } from 'react';

import Labels from '@/src/shared/labels';
import { Button, Card, CardBody, Tabs, Tab, Input, Spinner, Chip } from "@heroui/react";

const EmbeddedBrowser = ({ html, url = 'http://localhost:3900' }) => {
  const [activeTab, setActiveTab] = useState('preview');
  const [customUrl, setCustomUrl] = useState(url);
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState('desktop'); // desktop, tablet, mobile
  const iframeRef = useRef(null);

  const handleUrlChange = useCallback((e) => {
    setCustomUrl(e.target.value);
  }, []);

  const handleNavigate = useCallback(() => {
    if (iframeRef.current) {
      setIsLoading(true);
      iframeRef.current.src = customUrl;
    }
  }, [customUrl]);

  const handleIframeLoad = useCallback(() => {
    setIsLoading(false);
  }, []);

  const handleRefresh = useCallback(() => {
    if (iframeRef.current) {
      setIsLoading(true);
      iframeRef.current.src = iframeRef.current.src;
    }
  }, []);

  const getViewportStyle = () => {
    switch (viewMode) {
      case 'mobile':
        return { width: '390px', height: '844px' }; // iPhone 14 Pro 크기로 업데이트
      case 'tablet':
        return { width: '820px', height: '1180px' }; // iPad Air 크기로 업데이트
      default:
        return { width: '100%', height: '100%' };
    }
  };

  const tabs = [
    {
      id: 'preview',
      label: '미리보기',
      content: (
        <div className="relative w-full h-full">
          {/* 뷰포트 선택기 */}
          <div className="absolute top-2 left-2 z-20 flex gap-1 bg-white/90 backdrop-blur-sm rounded-lg p-1 shadow-lg">
            <Chip
              size="sm"
              variant={viewMode === 'desktop' ? 'solid' : 'bordered'}
              color={viewMode === 'desktop' ? 'primary' : 'default'}
              onPress={() => setViewMode('desktop')}
              className="cursor-pointer text-xs"
            >
              💻
            </Chip>
            <Chip
              size="sm"
              variant={viewMode === 'tablet' ? 'solid' : 'bordered'}
              color={viewMode === 'tablet' ? 'primary' : 'default'}
              onPress={() => setViewMode('tablet')}
              className="cursor-pointer text-xs"
            >
              📱
            </Chip>
            <Chip
              size="sm"
              variant={viewMode === 'mobile' ? 'solid' : 'bordered'}
              color={viewMode === 'mobile' ? 'primary' : 'default'}
              onPress={() => setViewMode('mobile')}
              className="cursor-pointer text-xs"
            >
              📱
            </Chip>
          </div>
          
          {/* 뷰포트 컨테이너 */}
          <div className="w-full h-full flex items-center justify-center bg-gray-100 p-4">
            <div 
              className="bg-white shadow-lg rounded-lg overflow-hidden transition-all duration-300"
              style={getViewportStyle()}
            >
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-10">
                  <Spinner size="lg" />
                </div>
              )}
              <iframe
                ref={iframeRef}
                srcDoc={html}
                className="w-full h-full border-0"
                title="미리보기"
                onLoad={handleIframeLoad}
              />
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'live',
      label: '실시간',
      content: (
        <div className="flex flex-col h-full">
          <div className="flex flex-col sm:flex-row gap-2 p-2 sm:p-4 border-b">
            <Input
              value={customUrl}
              onChange={handleUrlChange}
              placeholder={Labels["URL을_입력하세요_PH_1"]}
              className="flex-1 text-xs sm:text-sm"
              onKeyPress={(e) => e.key === 'Enter' && handleNavigate()}
            />
            <div className="flex gap-1 sm:gap-2">
              <Button 
                color="primary" 
                onPress={handleNavigate}
                size="sm"
                className="text-xs sm:text-sm"
              >
                <span className="hidden sm:inline">이동</span>
                <span className="sm:hidden">→</span>
              </Button>
              <Button 
                variant="bordered" 
                onPress={handleRefresh}
                size="sm"
                className="text-xs sm:text-sm"
              >
                <span className="hidden sm:inline">새로고침</span>
                <span className="sm:hidden">🔄</span>
              </Button>
            </div>
          </div>
          <div className="relative flex-1">
            {/* 뷰포트 선택기 */}
            <div className="absolute top-2 left-2 z-20 flex gap-1 bg-white/90 backdrop-blur-sm rounded-lg p-1 shadow-lg">
              <Chip
                size="sm"
                variant={viewMode === 'desktop' ? 'solid' : 'bordered'}
                color={viewMode === 'desktop' ? 'primary' : 'default'}
                onPress={() => setViewMode('desktop')}
                className="cursor-pointer text-xs"
              >
                💻
              </Chip>
              <Chip
                size="sm"
                variant={viewMode === 'tablet' ? 'solid' : 'bordered'}
                color={viewMode === 'tablet' ? 'primary' : 'default'}
                onPress={() => setViewMode('tablet')}
                className="cursor-pointer text-xs"
              >
                📱
              </Chip>
              <Chip
                size="sm"
                variant={viewMode === 'mobile' ? 'solid' : 'bordered'}
                color={viewMode === 'mobile' ? 'primary' : 'default'}
                onPress={() => setViewMode('mobile')}
                className="cursor-pointer text-xs"
              >
                📱
              </Chip>
            </div>
            
            {/* 뷰포트 컨테이너 */}
            <div className="w-full h-full flex items-center justify-center bg-gray-100 p-4">
              <div 
                className="bg-white shadow-lg rounded-lg overflow-hidden transition-all duration-300"
                style={getViewportStyle()}
              >
                {isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-10">
                    <Spinner size="lg" />
                  </div>
                )}
                <iframe
                  ref={iframeRef}
                  src={customUrl}
                  className="w-full h-full border-0"
                  title="실시간 미리보기"
                  onLoad={handleIframeLoad}
                />
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'code',
      label: '코드',
      content: (
        <div className="h-full overflow-auto">
          <pre className="p-4 text-sm bg-gray-50 h-full overflow-auto">
            <code>{html}</code>
          </pre>
        </div>
      )
    }
  ];

  return (
    <Card className="w-full h-full">
      <CardBody className="p-0 h-full">
        <Tabs
          selectedKey={activeTab}
          onSelectionChange={setActiveTab}
          className="h-full"
          classNames={{
            tabList: "px-2 sm:px-4 pt-2 gap-1",
            tab: "text-xs sm:text-sm min-w-0 flex-1",
            panel: "flex-1 h-full"
          }}
        >
          {tabs.map((tab) => (
            <Tab key={tab.id} title={tab.label}>
              <div className="h-full">
                {tab.content}
              </div>
            </Tab>
          ))}
        </Tabs>
      </CardBody>
    </Card>
  );
};

export default EmbeddedBrowser; 