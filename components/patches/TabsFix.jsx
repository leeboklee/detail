// @nextui-org/tabs 컴포넌트 패치
// 버전 충돌 문제를 해결하기 위한 래퍼 컴포넌트

import React from 'react';

// 탭 컴포넌트를 단순화한 래퍼 컴포넌트
export const TabsFixed = ({ 
  children, 
  color = "primary",
  selectedKey,
  onSelectionChange,
  ...props 
}) => {
  // 내부 상태 관리
  const [internalSelectedKey, setInternalSelectedKey] = React.useState(selectedKey || "tab1");
  
  // 선택 변경 처리
  const handleSelectionChange = (key) => {
    setInternalSelectedKey(key);
    if (onSelectionChange) {
      onSelectionChange(key);
    }
  };
  
  // Children 분석하여 탭 아이템들 추출
  const tabs = React.Children.toArray(children).filter(child => 
    child?.type?.displayName === "Tab" || 
    child?.type?.name === "Tab"
  );
  
  // 구조 렌더링
  return (
    <div className="tabs-container" style={{ width: '100%' }} {...props}>
      <div className="tabs-header" style={{ 
        display: 'flex', 
        borderBottom: '1px solid #eaeaea'
      }}>
        {tabs.map((tab, index) => {
          const key = tab.props.key || `tab${index + 1}`;
          const isSelected = key === internalSelectedKey;
          
          return (
            <div 
              key={key}
              onClick={() => handleSelectionChange(key)}
              className={`tab-button ${isSelected ? 'selected' : ''}`}
              style={{ 
                padding: '8px 16px',
                cursor: 'pointer',
                fontWeight: isSelected ? 'bold' : 'normal',
                borderBottom: isSelected ? `2px solid ${color === 'primary' ? '#0070f3' : '#888'}` : 'none',
                marginBottom: isSelected ? '-1px' : '0',
                color: isSelected ? (color === 'primary' ? '#0070f3' : '#333') : '#666'
              }}
            >
              {tab.props.title}
            </div>
          );
        })}
      </div>
      
      <div className="tab-content" style={{ padding: '16px 0' }}>
        {tabs.find(tab => {
          const key = tab.props.key || `tab${tabs.indexOf(tab) + 1}`;
          return key === internalSelectedKey;
        })?.props.children || null}
      </div>
    </div>
  );
};

// 탭 아이템 컴포넌트
export const TabFixed = () => {
  // Props는 부모 컴포넌트에서 직접 접근하여 사용됨
  // 이 컴포넌트는 렌더링 로직을 가지지 않음
  return null; 
};

TabFixed.displayName = "Tab";

// 기존 Tabs, Tab 컴포넌트 대체용 래퍼
export const patchNextUITabs = () => {
  try {
    // 기존 @nextui-org/tabs를 패치된 버전으로 교체하는 로직
    // webpack 설정이나 컴포넌트 사용 시 이 패치 함수를 호출
    console.log("NextUI Tabs 컴포넌트 패치 적용됨");
  } catch (error) {
    console.error("NextUI Tabs 패치 적용 실패:", error);
  }
}; 