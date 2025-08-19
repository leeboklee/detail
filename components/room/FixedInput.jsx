import React, { memo, useCallback } from 'react';

// 간단하고 안정적인 입력 컴포넌트
const FixedInput = memo((props) => {
  const {
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
    ...restProps
  } = props;

  // 단순한 change 핸들러 (복잡한 로직 제거)
  const handleChange = useCallback((e) => {
    if (onChange) {
      onChange(e);
    }
  }, [onChange]);

  // 단순한 blur 핸들러
  const handleBlur = useCallback((e) => {
    if (onBlur) {
      onBlur(e);
    }
  }, [onBlur]);

  // textarea 렌더링
  if (type === 'textarea') {
    return (
      <textarea
        value={value || ''}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        className={className}
        name={name}
        rows={rows}
        {...restProps}
      />
    );
  }

  // input 렌더링
  return (
    <input
      type={type}
      value={value || ''}
      onChange={handleChange}
      onBlur={handleBlur}
      placeholder={placeholder}
      className={className}
      name={name}
      min={min}
      max={max}
      step={step}
      {...restProps}
    />
  );
});

FixedInput.displayName = 'FixedInput';

export default FixedInput; 