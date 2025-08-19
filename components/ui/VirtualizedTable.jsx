'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { Input, Button, Chip } from "@heroui/react";

// 가상화된 테이블 컴포넌트
export const VirtualizedTable = ({ 
  data = [], 
  columns = [], 
  rowHeight = 60,
  visibleRows = 10,
  onRowUpdate,
  onRowDelete,
  onRowAdd
}) => {
  const [scrollTop, setScrollTop] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  // 검색 및 정렬된 데이터
  const filteredAndSortedData = useMemo(() => {
    let filtered = data;
    
    // 검색 필터링
    if (searchTerm) {
      filtered = data.filter(row => 
        Object.values(row).some(value => 
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
    
    // 정렬
    if (sortConfig.key) {
      filtered = [...filtered].sort((a, b) => {
        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];
        
        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    
    return filtered;
  }, [data, searchTerm, sortConfig]);

  // 가상화 계산
  const totalHeight = filteredAndSortedData.length * rowHeight;
  const startIndex = Math.floor(scrollTop / rowHeight);
  const endIndex = Math.min(startIndex + visibleRows, filteredAndSortedData.length);
  
  const visibleData = filteredAndSortedData.slice(startIndex, endIndex);
  const offsetY = startIndex * rowHeight;

  // 정렬 핸들러
  const handleSort = useCallback((key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  }, []);

  // 스크롤 핸들러
  const handleScroll = useCallback((e) => {
    setScrollTop(e.target.scrollTop);
  }, []);

  // 행 업데이트 핸들러
  const handleRowUpdate = useCallback((index, field, value) => {
    if (onRowUpdate) {
      const actualIndex = startIndex + index;
      onRowUpdate(actualIndex, field, value);
    }
  }, [startIndex, onRowUpdate]);

  // 행 삭제 핸들러
  const handleRowDelete = useCallback((index) => {
    if (onRowDelete) {
      const actualIndex = startIndex + index;
      onRowDelete(actualIndex);
    }
  }, [startIndex, onRowUpdate]);

  return (
    <div className="space-y-4">
      {/* 검색 및 정렬 컨트롤 */}
      <div className="flex gap-4 items-center">
        <Input
          placeholder="검색..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-xs"
          size="sm"
        />
        <div className="flex gap-2">
          {columns.map(column => (
            <Button
              key={column.key}
              size="sm"
              variant={sortConfig.key === column.key ? "solid" : "bordered"}
              color={sortConfig.key === column.key ? "primary" : "default"}
              onPress={() => handleSort(column.key)}
            >
              {column.label}
              {sortConfig.key === column.key && (
                <span className="ml-1">
                  {sortConfig.direction === 'asc' ? '↑' : '↓'}
                </span>
              )}
            </Button>
          ))}
        </div>
        {onRowAdd && (
          <Button
            size="sm"
            color="primary"
            onPress={onRowAdd}
          >
            + 추가
          </Button>
        )}
      </div>

      {/* 테이블 컨테이너 */}
      <div 
        className="border border-gray-300 rounded-lg overflow-hidden"
        style={{ height: `${visibleRows * rowHeight}px` }}
      >
        <div
          className="overflow-auto h-full"
          onScroll={handleScroll}
        >
          {/* 테이블 헤더 */}
          <div className="sticky top-0 bg-gray-100 border-b border-gray-300 z-10">
            <div className="flex">
              {columns.map(column => (
                <div
                  key={column.key}
                  className="px-4 py-3 font-medium text-gray-700 text-sm"
                  style={{ width: column.width || 'auto', minWidth: column.minWidth || '120px' }}
                >
                  {column.label}
                </div>
              ))}
              {(onRowUpdate || onRowDelete) && (
                <div className="px-4 py-3 font-medium text-gray-700 text-sm w-24">
                  작업
                </div>
              )}
            </div>
          </div>

          {/* 가상화된 테이블 바디 */}
          <div style={{ height: totalHeight, position: 'relative' }}>
            <div style={{ transform: `translateY(${offsetY}px)` }}>
              {visibleData.map((row, index) => (
                <div
                  key={row.id || index}
                  className="flex border-b border-gray-200 hover:bg-gray-50 transition-colors"
                  style={{ height: rowHeight }}
                >
                  {columns.map(column => (
                    <div
                      key={column.key}
                      className="px-4 py-3 text-sm text-gray-900 flex items-center"
                      style={{ width: column.width || 'auto', minWidth: column.minWidth || '120px' }}
                    >
                      {column.render ? (
                        column.render(row[column.key], row, index, (field, value) => 
                          handleRowUpdate(index, field, value)
                        )
                      ) : (
                        <span>{row[column.key]}</span>
                      )}
                    </div>
                  ))}
                  
                  {/* 작업 버튼 */}
                  {(onRowUpdate || onRowDelete) && (
                    <div className="px-4 py-3 flex items-center gap-2 w-24">
                      {onRowUpdate && (
                        <Button
                          size="sm"
                          color="primary"
                          variant="flat"
                          onPress={() => {
                            // 편집 모드 활성화 로직
                            console.log('편집:', row);
                          }}
                        >
                          편집
                        </Button>
                      )}
                      {onRowDelete && (
                        <Button
                          size="sm"
                          color="danger"
                          variant="flat"
                          onPress={() => handleRowDelete(index)}
                        >
                          삭제
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 페이지네이션 정보 */}
      <div className="text-sm text-gray-600 text-center">
        {filteredAndSortedData.length}개 중 {startIndex + 1}-{endIndex}개 표시
      </div>
    </div>
  );
};

// 편집 가능한 셀 컴포넌트
export const EditableCell = ({ 
  value, 
  onUpdate, 
  type = 'text',
  placeholder = '',
  className = ''
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);

  const handleSave = () => {
    if (onUpdate && editValue !== value) {
      onUpdate(editValue);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="flex gap-1">
        <Input
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          size="sm"
          className={className}
          onKeyPress={(e) => {
            if (e.key === 'Enter') handleSave();
            if (e.key === 'Escape') handleCancel();
          }}
          autoFocus
        />
        <Button size="sm" color="primary" onPress={handleSave}>
          ✓
        </Button>
        <Button size="sm" color="danger" variant="flat" onPress={handleCancel}>
          ✕
        </Button>
      </div>
    );
  }

  return (
    <div 
      className={`cursor-pointer hover:bg-blue-50 p-1 rounded ${className}`}
      onDoubleClick={() => setIsEditing(true)}
    >
      {value || placeholder}
    </div>
  );
};

// 숫자 입력 셀 컴포넌트
export const NumberCell = ({ 
  value, 
  onUpdate, 
  placeholder = '0',
  suffix = '',
  className = ''
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);

  const handleSave = () => {
    if (onUpdate && editValue !== value) {
      onUpdate(parseInt(editValue) || 0);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="flex gap-1">
        <Input
          type="number"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          size="sm"
          className={className}
          endContent={suffix && <span className="text-xs text-gray-600">{suffix}</span>}
          onKeyPress={(e) => {
            if (e.key === 'Enter') handleSave();
            if (e.key === 'Escape') handleCancel();
          }}
          autoFocus
        />
        <Button size="sm" color="primary" onPress={handleSave}>
          ✓
        </Button>
        <Button size="sm" color="danger" variant="flat" onPress={handleCancel}>
          ✕
        </Button>
      </div>
    );
  }

  return (
    <div 
      className={`cursor-pointer hover:bg-blue-50 p-1 rounded text-right ${className}`}
      onDoubleClick={() => setIsEditing(true)}
    >
      {value ? `${value.toLocaleString()}${suffix}` : placeholder}
    </div>
  );
};

export default VirtualizedTable;
