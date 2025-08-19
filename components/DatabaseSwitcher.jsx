import React, { useState, useEffect } from 'react';
import { useAppContext } from './AppContext.Context.jsx';

const DatabaseSwitcher = () => {
  const { setDatabaseType, databaseType } = useAppContext();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const switchDatabase = async (type) => {
    setIsLoading(true);
    setMessage('');
    
    try {
      const response = await fetch('/api/switch-database', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ databaseType: type }),
      });

      const result = await response.json();
      
      if (result.success) {
        setDatabaseType(type);
        setMessage(`✅ ${type === 'postgresql' ? 'PostgreSQL' : 'SQLite'}로 전환 완료`);
        
        // 페이지 새로고침으로 변경사항 적용
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        setMessage(`❌ 전환 실패: ${result.error}`);
      }
    } catch (error) {
      setMessage(`❌ 오류 발생: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">데이터베이스 전환</h3>
      
      <div className="flex gap-4 mb-4">
        <button
          onClick={() => switchDatabase('sqlite')}
          disabled={isLoading || databaseType === 'sqlite'}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            databaseType === 'sqlite'
              ? 'bg-green-100 text-green-800 border-2 border-green-300'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 border-gray-300'
          } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isLoading && databaseType !== 'sqlite' ? '전환 중...' : 'SQLite'}
        </button>
        
        <button
          onClick={() => switchDatabase('postgresql')}
          disabled={isLoading || databaseType === 'postgresql'}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            databaseType === 'postgresql'
              ? 'bg-blue-100 text-blue-800 border-2 border-blue-300'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 border-gray-300'
          } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isLoading && databaseType !== 'postgresql' ? '전환 중...' : 'PostgreSQL'}
        </button>
      </div>
      
      {message && (
        <div className={`p-3 rounded-lg text-sm ${
          message.includes('✅') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
        }`}>
          {message}
        </div>
      )}
      
      <div className="text-sm text-gray-600">
        <p>현재 데이터베이스: <span className="font-medium">{databaseType === 'postgresql' ? 'PostgreSQL' : 'SQLite'}</span></p>
        <p className="mt-1">전환 시 데이터베이스 스키마가 자동으로 업데이트됩니다.</p>
      </div>
    </div>
  );
};

export default DatabaseSwitcher; 