import React, { useState } from 'react';

interface TabItem {
  title: string;
  content: React.ReactNode;
}

interface TabsComponentProps {
  tabs: TabItem[];
}

const TabsComponent: React.FC<TabsComponentProps> = ({ tabs }) => {
  const [activeTabIndex, setActiveTabIndex] = useState(0);

  if (!tabs || tabs.length === 0) {
    return null; // Return null or some placeholder if no tabs are provided
  }

  return (
    <div>
      <div style={{ display: 'flex', borderBottom: '1px solid #ccc', marginBottom: '10px' }}>
        {tabs.map((tab, index) => (
          <button
            key={index}
            onClick={() => setActiveTabIndex(index)}
            style={{
              padding: '10px 15px',
              cursor: 'pointer',
              border: 'none',
              borderBottom: index === activeTabIndex ? '2px solid blue' : 'none',
              backgroundColor: 'transparent',
              fontWeight: index === activeTabIndex ? 'bold' : 'normal',
            }}
          >
            {tab.title}
          </button>
        ))}
      </div>
      <div>
        {tabs[activeTabIndex].content}
      </div>
    </div>
  );
};

export default TabsComponent; 