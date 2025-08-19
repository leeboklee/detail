import React, { memo, useState, useCallback, useEffect } from 'react';

// 안정적인 입력 컴포넌트 (버벅거림 없음)
const StableInput = memo((props) => {
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

  // 로컬 상태로 입력값 관리 (즉시 반응성)
  const [localValue, setLocalValue] = useState(value || '');
  const [isFocused, setIsFocused] = useState(false);

  // props의 value가 변경되면 로컬 상태도 업데이트 (단, 포커스 중이 아닐 때만)
  useEffect(() => {
    if (!isFocused && value !== localValue) {
      setLocalValue(value || '');
    }
  }, [value, isFocused, localValue]);

  // 입력 변경 핸들러
  const handleChange = useCallback((e) => {
    const newValue = e.target.value;
    setLocalValue(newValue); // 즉시 로컬 상태 업데이트
    
    // 부모 컴포넌트에 변경사항 전달 (debounce 없이 즉시)
    if (onChange) {
      onChange(e);
    }
  }, [onChange]);

  // 포커스 핸들러
  const handleFocus = useCallback(() => {
    setIsFocused(true);
  }, []);

  // blur 핸들러
  const handleBlur = useCallback((e) => {
    setIsFocused(false);
    if (onBlur) {
      onBlur(e);
    }
  }, [onBlur]);

  // 컴포넌트 타입에 따른 렌더링
  if (type === 'textarea') {
    return (
      <textarea
        value={localValue}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        className={className}
        name={name}
        rows={rows}
        {...restProps}
      />
    );
  }

  return (
    <input
      type={type}
      value={localValue}
      onChange={handleChange}
      onFocus={handleFocus}
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
}, (prevProps, nextProps) => {
  // 필요한 props만 비교
  return (
    prevProps.value === nextProps.value &&
    prevProps.placeholder === nextProps.placeholder &&
    prevProps.name === nextProps.name &&
    prevProps.type === nextProps.type
  );
});

StableInput.displayName = 'StableInput';

export default StableInput; 