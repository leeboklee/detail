'use client';

import React, { useState, useEffect } from 'react';
import { useAppContext } from './AppContext.Context';

// 공통 섹션 컨트롤러 컴포넌트
export default function SectionOrderManager() {
  const { hotelData, updateHotelData } = useAppContext();
  const [sections, setSections] = useState([]);

  useEffect(() => {
    if (hotelData && hotelData.sections) {
      setSections([...hotelData.sections]);
    }
  }, [hotelData]);

  const moveSection = (fromIndex, toIndex) => {
    const newSections = [...sections];
    const [movedSection] = newSections.splice(fromIndex, 1);
    newSections.splice(toIndex, 0, movedSection);
    
    setSections(newSections);
    
    if (updateHotelData) {
      updateHotelData({
        ...hotelData,
        sections: newSections
      });
    }
  };

  const toggleSection = (index) => {
    const newSections = [...sections];
    newSections[index] = {
      ...newSections[index],
      enabled: !newSections[index].enabled
    };
    
    setSections(newSections);
    
    if (updateHotelData) {
      updateHotelData({
        ...hotelData,
        sections: newSections
      });
    }
  };

  if (!sections.length) {
    return (
      <div className="card p-4">
        <h3 className="text-lg font-semibold mb-2">섹션 순서 관리</h3>
        <p className="text-gray-500">섹션이 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="card p-4">
      <h3 className="text-lg font-semibold mb-4">섹션 순서 관리</h3>
      <div className="space-y-2">
        {sections.map((section, index) => (
          <div key={section.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
            <button
              onClick={() => toggleSection(index)}
              className={`w-4 h-4 rounded border ${
                section.enabled ? 'bg-blue-500 border-blue-500' : 'bg-gray-300 border-gray-300'
              }`}
            >
              {section.enabled && <span className="text-white text-xs">✓</span>}
            </button>
            
            <span className="flex-1 text-sm">{section.name}</span>
            
            <div className="flex gap-1">
              {index > 0 && (
                <button
                  onClick={() => moveSection(index, index - 1)}
                  className="btn btn-sm btn-ghost"
                >
                  ↑
                </button>
              )}
              {index < sections.length - 1 && (
                <button
                  onClick={() => moveSection(index, index + 1)}
                  className="btn btn-sm btn-ghost"
                >
                  ↓
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}