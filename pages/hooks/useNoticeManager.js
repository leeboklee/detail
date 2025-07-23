import { useState, useEffect } from 'react';

export default function useNoticeManager(initialData = [], onChange) {
  const [notices, setNotices] = useState(Array.isArray(initialData) ? initialData : []);
  const [newNotice, setNewNotice] = useState('');

  useEffect(() => {
    if (Array.isArray(initialData)) {
      const prevStr = JSON.stringify(notices);
      const nextStr = JSON.stringify(initialData);
      if (prevStr !== nextStr) {
        setNotices(initialData);
      }
    }
  }, [initialData, notices]);

  const handleAddNotice = () => {
    if (!newNotice.trim()) return;
    const updatedNotices = [...notices, { content: newNotice.trim() }];
    setNotices(updatedNotices);
    setNewNotice('');
    if (typeof onChange === 'function') onChange(updatedNotices);
  };

  const handleRemoveNotice = (index) => {
    const updatedNotices = notices.filter((_, i) => i !== index);
    setNotices(updatedNotices);
    if (typeof onChange === 'function') onChange(updatedNotices);
  };

  const handleUpdateNotice = (index, content) => {
    const updatedNotices = [...notices];
    updatedNotices[index] = typeof updatedNotices[index] === 'string'
      ? content
      : { ...updatedNotices[index], content };
    setNotices(updatedNotices);
    if (typeof onChange === 'function') onChange(updatedNotices);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAddNotice();
    }
  };

  return {
    notices,
    newNotice,
    setNewNotice,
    handleAddNotice,
    handleRemoveNotice,
    handleUpdateNotice,
    handleKeyPress
  };
} 