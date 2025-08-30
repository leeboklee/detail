'use client'

import React, { useState, useRef } from 'react';
import { Button } from "@heroui/react";

const DraggableTabs = ({ tabs, activeTab, onTabClick, onOrderChange, mounted = false }) => {
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const dragRef = useRef(null);

  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.target.outerHTML);
    
    // 드래그 이미지 설정
    if (dragRef.current) {
      e.dataTransfer.setDragImage(dragRef.current, 0, 0);
    }
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    
    if (draggedIndex !== null && draggedIndex !== dropIndex) {
      onOrderChange(draggedIndex, dropIndex);
    }
    
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleTabClick = (tab) => {
    if (onTabClick && typeof onTabClick === 'function') {
      onTabClick(tab.key);
    }
  };

  return (
    <div className="flex gap-1 overflow-x-auto">
      {tabs.map((tab, index) => (
        <div
          key={tab.key}
          ref={index === draggedIndex ? dragRef : null}
          draggable
          onDragStart={(e) => handleDragStart(e, index)}
          onDragOver={(e) => handleDragOver(e, index)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, index)}
          onDragEnd={handleDragEnd}
          className={`flex items-center cursor-move transition-all duration-200 ${
            draggedIndex === index ? 'opacity-50 scale-95' : ''
          } ${
            dragOverIndex === index && draggedIndex !== index 
              ? 'border-l-2 border-blue-500 bg-blue-50' 
              : ''
          }`}
        >
          <button
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.key
                ? 'border-blue-500 text-blue-600 bg-blue-50'
                : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
            onClick={() => handleTabClick(tab)}
          >
            <span className="text-lg">📋</span> {/* 드래그 핸들 아이콘 */}
            <span className="text-lg">{mounted ? tab.icon : '⏳'}</span>
            {tab.label}
          </button>
        </div>
      ))}
    </div>
  );
};

export default DraggableTabs; 