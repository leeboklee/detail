'use client';

import React, { useState } from 'react';

const Tabs = ({ tabs = [] }) => {
  // tabs가 비어있는 경우 기본값 설정
  const [activeTab, setActiveTab] = useState(tabs && tabs.length > 0 ? tabs[0].id : null);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
  };

  // tabs가 없거나 빈 배열인 경우 처리
  if (!tabs || tabs.length === 0) {
    return <div className="w-full p-4 text-center text-gray-500">탭 데이터가 없습니다.</div>;
  }

  return (
    <div className="w-full">
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-4" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`
                px-4 py-2 text-sm font-medium transition-all duration-300
                ${activeTab === tab.id 
                  ? 'border-b-2 border-indigo-500 text-indigo-600' 
                  : 'border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
              `}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
      
      <div className="mt-4">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={`
              ${activeTab === tab.id ? 'block' : 'hidden'}
              transition-opacity duration-300 ease-in-out
            `}
          >
            {tab.content}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Tabs;
