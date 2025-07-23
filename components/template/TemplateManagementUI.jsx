'use client';

import React, { useState, memo } from 'react'; // memo 추가
import TemplateManager from './TemplateManager';
import DatabaseManager from '../DatabaseManager';

// React.memo를 사용하여 불필요한 리렌더링 방지
const TemplateManagementUI = memo(({ roomTypes, setRoomTypes, cancelRules, setCancelRules }) => {
  const [advancedMode, setAdvancedMode] = useState(false);

  console.log("TemplateManagementUI 렌더링. 고급 모드:", advancedMode); // 렌더링 확인용

  return (
    <div className="templatesManagement">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold">템플릿 관리</h3>
        <button 
          onClick={() => setAdvancedMode(!advancedMode)}
          className="text-sm px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded"
        >
          {advancedMode ? '기본 모드로' : 'DB 연동 모드로'}
        </button>
      </div>
      
      {advancedMode ? (
        <DatabaseManager />
      ) : (
        <>
          <TemplateManager
            type="price"
            currentData={roomTypes} 
            onLoad={setRoomTypes}
          />
          <TemplateManager
            type="cancel"
            currentData={cancelRules} 
            onLoad={setCancelRules}
          />
        </>
      )}
    </div>
  );
});

export default TemplateManagementUI; 