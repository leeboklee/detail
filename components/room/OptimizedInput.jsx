import React, { memo, useCallback, useMemo } from 'react';

// 성능 최적화된 입력 필드 컴포넌트
const OptimizedInput = memo(({
  type = 'text',
  value,
  onChange,
  onBlur,
  placeholder,
  className = 'w-full p-2 border border-gray-300 rounded',
  name,
  min,
  max,
  step,
  rows,
  ...props
}) => {
  // 값이 실제로 변경되었을 때만 onChange 호출
  const handleChange = useCallback((e) => {
    const newValue = e.target.value;
    if (newValue !== value) {
      onChange?.(e);
    }
  }, [value, onChange]);

  // blur 핸들러 최적화
  const handleBlur = useCallback((e) => {
    onBlur?.(e);
  }, [onBlur]);

  // 컴포넌트 props 메모이제이션
  const inputProps = useMemo(() => ({
    type,
    value: value || '',
    onChange: handleChange,
    onBlur: handleBlur,
    placeholder,
    className,
    name,
    min,
    max,
    step,
    ...props
  }), [type, value, handleChange, handleBlur, placeholder, className, name, min, max, step, props]);

  // textarea와 input 구분
  if (type === 'textarea') {
    return <textarea rows={rows} {...inputProps} />;
  }

  return <input {...inputProps} />;
});

OptimizedInput.displayName = 'OptimizedInput';

export default OptimizedInput; 