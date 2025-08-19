import { useState } from 'react';

// 공지사항 관리용 커스텀 훅
export default function useNoticeManager(initialData = [], onChange) {
  const [notices, setNotices] = useState(Array.isArray(initialData) ? initialData : []);
  const [newNotice, setNewNotice] = useState('');

  // 공지 추가
  const handleAddNotice = () => {
    if (!newNotice.trim()) return;
    const updated = [...notices, { content: newNotice }];
    setNotices(updated);
    setNewNotice('');
    if (onChange) onChange(updated);
  };

  // 공지 삭제
  const handleRemoveNotice = (idx) => {
    const updated = notices.filter((_, i) => i !== idx);
    setNotices(updated);
    if (onChange) onChange(updated);
  };

  // 공지 수정
  const handleUpdateNotice = (idx, value) => {
    const updated = notices.map((n, i) => i === idx ? { ...n, content: value } : n);
    setNotices(updated);
    if (onChange) onChange(updated);
  };

  // 엔터키로 추가
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleAddNotice();
  };

  return {
    notices,
    newNotice,
    setNewNotice,
    handleAddNotice,
    handleRemoveNotice,
    handleUpdateNotice,
    handleKeyPress,
  };
} 