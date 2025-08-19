'use client'

import React, { useState, useEffect } from 'react';
import { AppContextProvider } from './AppContext.Context.jsx';
import ErrorBoundary from './ErrorBoundary.jsx';
import Spinner from './Spinner.jsx';
import LazyComponents from './LazyComponents.jsx';
import DatabaseManager from './DatabaseManager.jsx';
import SectionOrderManager from './SectionOrderManager.jsx';
import Tabs from './Tabs.jsx';
import Preview from './Preview.jsx';
import DatabaseSwitcher from './DatabaseSwitcher.jsx';
import LayoutToolbar from './layout/LayoutToolbar.jsx';

export default function AppContainer() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <Spinner />
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">오류가 발생했습니다</h2>
          <p className="text-red-500">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <AppContextProvider>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
          <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
            <div className="container mx-auto px-4 py-4">
              <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">호텔 상세페이지 관리자</h1>
                <div className="flex gap-2">
                  <DatabaseManager />
                  <SectionOrderManager />
                </div>
              </div>
            </div>
          </header>

          <main className="flex-1">
            <div className="p-6">
              <DatabaseSwitcher />
            </div>
            
            {/* 레이아웃 툴바 */}
            <LayoutToolbar />
            
            <div className="flex min-h-[calc(100vh-140px)]">
              <div className="w-2/5 bg-white/80 backdrop-blur-md overflow-visible border-r border-gray-200">
                <LazyComponents />
              </div>
              <div className="w-3/5 bg-white/80 backdrop-blur-md overflow-y-auto">
                <div className="h-full flex flex-col">
                  <div className="flex-shrink-0">
                    <Tabs />
                  </div>
                  <div className="flex-1 min-h-0">
                    <Preview />
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </AppContextProvider>
    </ErrorBoundary>
  );
}