'use client';

import React from 'react';
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Button, Chip, Tooltip } from "@heroui/react";

// Joe Natoli UX 가이드 적용된 테이블 컴포넌트
export default function EnhancedTable({ 
  data = [], 
  columns = [], 
  onEdit, 
  onDelete, 
  onAdd,
  emptyMessage = "데이터가 없습니다.",
  className = ""
}) {
  return (
    <div className={`enhanced-table ${className}`}>
      {/* 테이블 헤더 - 시각적으로 후퇴하도록 스타일링 */}
      <div className="mb-4 flex justify-between items-center">
        <div className="flex gap-2">
          {onAdd && (
            <Button 
              size="sm" 
              color="primary" 
              variant="flat"
              onPress={onAdd}
              className="text-xs font-medium"
            >
              ➕ 추가
            </Button>
          )}
        </div>
      </div>

      {/* 향상된 테이블 디자인 */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <Table 
          aria-label="Enhanced data table"
          classNames={{
            wrapper: "shadow-none",
            th: "bg-gray-50 text-gray-600 text-xs font-medium uppercase tracking-wider border-b border-gray-200",
            td: "border-b border-gray-100 py-3",
            tr: "hover:bg-gray-50 transition-colors"
          }}
          selectionMode="none"
        >
          <TableHeader>
            {(columns || []).map((column, index) => (
              <TableColumn 
                key={column?.key || index}
                className="text-left"
              >
                {column?.label || ''}
              </TableColumn>
            ))}
            {(onEdit || onDelete) && (
              <TableColumn className="text-center w-20">
                관리
              </TableColumn>
            )}
          </TableHeader>
          <TableBody 
            items={data || []} 
            emptyContent={
              <div className="py-8 text-center text-gray-500">
                <div className="text-4xl mb-2">📋</div>
                <div className="text-sm">{emptyMessage}</div>
              </div>
            }
          >
            {(item, index) => (
              <TableRow key={item?.id || `row-${index}`}>
                {(columns || []).map((column, colIndex) => (
                  <TableCell key={column?.key || `col-${colIndex}`}>
                    {column?.render ? column.render(item || {}, index) : (item?.[column?.key] || '')}
                  </TableCell>
                ))}
                {(onEdit || onDelete) && (
                  <TableCell>
                    <div className="flex justify-center gap-1">
                      {onEdit && (
                        <Tooltip content="편집">
                          <Button
                            isIconOnly
                            size="sm"
                            variant="light"
                            onPress={() => onEdit(item || {}, index)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            ✏️
                          </Button>
                        </Tooltip>
                      )}
                      {onDelete && (
                        <Tooltip content="삭제" color="danger">
                          <Button
                            isIconOnly
                            size="sm"
                            variant="light"
                            onPress={() => onDelete(item || {}, index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            🗑️
                          </Button>
                        </Tooltip>
                      )}
                    </div>
                  </TableCell>
                )}
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// 특화된 테이블 컴포넌트들
export function RoomTable({ rooms = [], onEdit, onDelete, onAdd }) {
  const columns = [
    {
      key: 'name',
      label: '객실명',
      render: (item) => (
        <div className="font-medium text-gray-900">{item.name}</div>
      )
    },
    {
      key: 'type',
      label: '유형',
      render: (item) => (
        <Chip size="sm" variant="flat" color="primary">
          {item.type}
        </Chip>
      )
    },
    {
      key: 'capacity',
      label: '수용인원',
      render: (item) => (
        <div className="text-sm text-gray-600">
          {item.standardCapacity}명 (최대 {item.maxCapacity}명)
        </div>
      )
    },
    {
      key: 'bedType',
      label: '베드',
      render: (item) => (
        <div className="text-sm text-gray-600">{item.bedType}</div>
      )
    },
    {
      key: 'amenities',
      label: '편의시설',
      render: (item) => (
        <div className="flex flex-wrap gap-1">
          {(item.amenities || []).slice(0, 3).map((amenity, idx) => (
            <Chip key={idx} size="sm" variant="bordered" className="text-xs">
              {amenity}
            </Chip>
          ))}
          {(item.amenities || []).length > 3 && (
            <Chip size="sm" variant="bordered" className="text-xs">
              +{(item.amenities || []).length - 3}
            </Chip>
          )}
        </div>
      )
    }
  ];

  return (
    <EnhancedTable
      data={rooms || []}
      columns={columns}
      onEdit={onEdit}
      onDelete={onDelete}
      onAdd={onAdd}
      emptyMessage="등록된 객실이 없습니다."
    />
  );
}

export function PackageTable({ packages = [], onEdit, onDelete, onAdd }) {
  const columns = [
    {
      key: 'name',
      label: '패키지명',
      render: (item) => (
        <div className="font-medium text-gray-900">{item.name}</div>
      )
    },
    {
      key: 'description',
      label: '설명',
      render: (item) => (
        <div className="text-sm text-gray-600 max-w-xs truncate">
          {item.description}
        </div>
      )
    },
    {
      key: 'price',
      label: '가격',
      render: (item) => (
        <div className="font-semibold text-green-600">
          ₩{item.price?.toLocaleString()}
        </div>
      )
    },
    {
      key: 'includes',
      label: '포함사항',
      render: (item) => (
        <div className="flex flex-wrap gap-1">
          {(item.includes || []).slice(0, 2).map((include, idx) => (
            <Chip key={idx} size="sm" variant="bordered" className="text-xs">
              {include}
            </Chip>
          ))}
          {(item.includes || []).length > 2 && (
            <Chip size="sm" variant="bordered" className="text-xs">
              +{(item.includes || []).length - 2}
            </Chip>
          )}
        </div>
      )
    }
  ];

  return (
    <EnhancedTable
      data={packages || []}
      columns={columns}
      onEdit={onEdit}
      onDelete={onDelete}
      onAdd={onAdd}
      emptyMessage="등록된 패키지가 없습니다."
    />
  );
}

export function NoticeTable({ notices = [], onEdit, onDelete, onAdd }) {
  const columns = [
    {
      key: 'title',
      label: '제목',
      render: (item) => (
        <div className="font-medium text-gray-900">{item.title}</div>
      )
    },
    {
      key: 'category',
      label: '카테고리',
      render: (item) => (
        <Chip 
          size="sm" 
          variant="flat" 
          color={item.category === 'important' ? 'danger' : 'default'}
        >
          {item.category === 'important' ? '중요' : '일반'}
        </Chip>
      )
    },
    {
      key: 'content',
      label: '내용',
      render: (item) => (
        <div className="text-sm text-gray-600 max-w-xs truncate">
          {item.content}
        </div>
      )
    },
    {
      key: 'date',
      label: '등록일',
      render: (item) => (
        <div className="text-sm text-gray-500">
          {new Date(item.date || Date.now()).toLocaleDateString()}
        </div>
      )
    }
  ];

  return (
    <EnhancedTable
      data={notices || []}
      columns={columns}
      onEdit={onEdit}
      onDelete={onDelete}
      onAdd={onAdd}
      emptyMessage="등록된 공지사항이 없습니다."
    />
  );
} 