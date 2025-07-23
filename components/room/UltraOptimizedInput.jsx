import React, { memo, useRef, useCallback, useLayoutEffect } from 'react';

// 극한 성능 최적화된 입력 컴포넌트
const UltraOptimizedInput = memo((props) => {
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

  const inputRef = useRef(null);
  const lastValueRef = useRef(value);
  const isDirtyRef = useRef(false);

  // DOM 값과 prop 값 동기화 (렌더링 없이)
  useLayoutEffect(() => {
    if (inputRef.current && lastValueRef.current !== value) {
      inputRef.current.value = value || '';
      lastValueRef.current = value;
      isDirtyRef.current = false;
    }
  }, [value]);

  // 극한 최적화된 change 핸들러
  const handleChange = useCallback((e) => {
    const newValue = e.target.value;
    
    // 값이 실제로 변경되었을 때만 처리
    if (newValue !== lastValueRef.current) {
      lastValueRef.current = newValue;
      isDirtyRef.current = true;
      
      // onChange는 즉시 호출하지 않고 requestAnimationFrame으로 지연
      requestAnimationFrame(() => {
        if (isDirtyRef.current && onChange) {
          onChange(e);
          isDirtyRef.current = false;
        }
      });
    }
  }, [onChange]);

  // blur 핸들러
  const handleBlur = useCallback((e) => {
    // blur 시에는 즉시 처리
    if (isDirtyRef.current && onChange) {
      onChange(e);
      isDirtyRef.current = false;
    }
    onBlur?.(e);
  }, [onChange, onBlur]);

  // 컴포넌트 타입에 따른 렌더링
  if (type === 'textarea') {
    return (
      <textarea
        ref={inputRef}
        defaultValue={value || ''}
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

  return (
    <input
      ref={inputRef}
      type={type}
      defaultValue={value || ''}
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
}, (prevProps, nextProps) => {
  // 매우 엄격한 비교로 불필요한 리렌더링 완전 차단
  return (
    prevProps.value === nextProps.value &&
    prevProps.placeholder === nextProps.placeholder &&
    prevProps.className === nextProps.className &&
    prevProps.name === nextProps.name &&
    prevProps.type === nextProps.type
  );
});

UltraOptimizedInput.displayName = 'UltraOptimizedInput';

export default UltraOptimizedInput; 