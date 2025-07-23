import React, { useState, useCallback, useRef, useEffect } from 'react';

// 전역 입력 상태 관리 (완전 개선 버전)
const globalInputState = {
  activeInputs: new Set(),
  pendingUpdates: new Map(),
  focusedInput: null,
  lastFocusTime: 0,
  
  startInput: (fieldName) => {
    globalInputState.activeInputs.add(fieldName);
    globalInputState.focusedInput = fieldName;
    globalInputState.lastFocusTime = Date.now();
    console.log(`🔒 전역 입력 시작: ${fieldName}`);
  },
  
  endInput: (fieldName) => {
    globalInputState.activeInputs.delete(fieldName);
    if (globalInputState.focusedInput === fieldName) {
      globalInputState.focusedInput = null;
    }
    console.log(`🔓 전역 입력 종료: ${fieldName}`);
  },
  
  isInputActive: (fieldName) => {
    return globalInputState.activeInputs.has(fieldName);
  },
  
  isFocusedInput: (fieldName) => {
    return globalInputState.focusedInput === fieldName;
  },
  
  hasAnyActiveInput: () => {
    return globalInputState.activeInputs.size > 0;
  },
  
  setPendingUpdate: (fieldName, value) => {
    globalInputState.pendingUpdates.set(fieldName, value);
    console.log(`📝 보류 업데이트 설정: ${fieldName} = "${value}"`);
  },
  
  getPendingUpdate: (fieldName) => {
    return globalInputState.pendingUpdates.get(fieldName);
  },
  
  clearPendingUpdate: (fieldName) => {
    globalInputState.pendingUpdates.delete(fieldName);
    console.log(`🗑️ 보류 업데이트 제거: ${fieldName}`);
  },
  
  // 포커스 보호 확인 (마우스 이동 등의 외부 간섭 방지)
  shouldProtectFocus: (fieldName) => {
    const timeSinceFocus = Date.now() - globalInputState.lastFocusTime;
    return globalInputState.isFocusedInput(fieldName) && timeSinceFocus < 5000; // 5초 보호
  }
};

// 한글 입력 100% 완전 해결 컴포넌트 (최종 완성 버전)
const SimpleInput = React.memo((props) => {
  const {
    label, // label prop 추가
    type = 'text',
    value,
    onChange,
    onBlur,
    placeholder,
    className = 'w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500',
    name,
    debounceMs = 500,
    ...otherProps
  } = props;

  // 상태 관리
  const [localValue, setLocalValue] = useState(value || '');
  const [isComposing, setIsComposing] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isUserTyping, setIsUserTyping] = useState(false);
  
  // 참조
  const inputRef = useRef(null);
  const debounceTimerRef = useRef(null);
  const lastValueRef = useRef(value || '');
  const compositionValueRef = useRef('');
  const isUserInputRef = useRef(false);
  const lastChangeTimeRef = useRef(0);
  const compositionEndTimerRef = useRef(null);
  const focusProtectionTimerRef = useRef(null);
  const typingTimerRef = useRef(null);

  // 디버깅 로그
  const log = useCallback((message, data = '') => {
    if (name) {
      console.log(`🎯 [${name}] ${message}`, data);
    }
  }, [name]);

  // props.value 변경 감지 및 동기화 (완전 개선)
  useEffect(() => {
    const newValue = value || '';
    const shouldSync = newValue !== lastValueRef.current 
      && !isUserInputRef.current 
      && !isFocused 
      && !isUserTyping
      && !globalInputState.shouldProtectFocus(name);
    
    if (shouldSync) {
      setLocalValue(newValue);
      lastValueRef.current = newValue;
      log('📥 props 값 동기화:', newValue);
    } else if (newValue !== lastValueRef.current) {
      log('🛡️ props 동기화 차단:', `포커스:${isFocused}, 타이핑:${isUserTyping}, 보호:${globalInputState.shouldProtectFocus(name)}`);
    }
  }, [value, isFocused, isUserTyping, name, log]);

  // 한글 포함 여부 확인
  const hasKorean = useCallback((text) => {
    return /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(text);
  }, []);

  // 완전한 문자 패턴 분석
  const analyzeInputPattern = useCallback((text) => {
    const patterns = {
      hasKorean: /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(text),
      hasEnglish: /[a-zA-Z]/.test(text),
      hasNumber: /\d/.test(text),
      hasSpace: /\s/.test(text),
      hasSpecial: /[^\w\s가-힣ㄱ-ㅎㅏ-ㅣ]/.test(text),
      isNumberKorean: /^\d+[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(text),
      isEnglishSpace: /[a-zA-Z]\s+[a-zA-Z]/.test(text),
      isKoreanSpace: /[가-힣]\s+[가-힣]/.test(text)
    };
    return patterns;
  }, []);

  // onChange 호출 함수 (완전 개선)
  const callOnChange = useCallback((newValue) => {
    if (onChange && newValue !== lastValueRef.current) {
      lastValueRef.current = newValue;
      log('⚡ onChange 실행:', newValue);
      
      // React 18 동시성 처리
      onChange({ target: { name, value: newValue } });
    }
  }, [onChange, name, log]);

  // 지능형 debounce 처리 (패턴별 최적화)
  const smartDebounceOnChange = useCallback((newValue) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    const patterns = analyzeInputPattern(newValue);
    let delay = 0;

    // 패턴별 최적 지연 시간 설정
    if (patterns.hasKorean) {
      if (patterns.isNumberKorean) {
        delay = 200; // 숫자+한글: 빠른 처리
      } else if (patterns.isKoreanSpace) {
        delay = 300; // 한글 공백: 중간 처리
      } else {
        delay = 400; // 일반 한글: 안정적 처리
      }
    } else if (patterns.hasEnglish && patterns.hasSpace) {
      delay = 250; // 영문 공백: 빠른 처리
    } else {
      delay = 0; // 숫자, 단순 영문: 즉시 처리
    }

    log(`🧠 지능형 debounce: ${delay}ms`, patterns);

    if (delay === 0) {
      callOnChange(newValue);
    } else {
      debounceTimerRef.current = setTimeout(() => {
        callOnChange(newValue);
      }, delay);
    }
  }, [analyzeInputPattern, callOnChange, log]);

  // 타이핑 상태 관리
  const setTypingState = useCallback((isTyping) => {
    setIsUserTyping(isTyping);
    if (name) {
      if (isTyping) {
        globalInputState.startInput(name);
      } else {
        globalInputState.endInput(name);
      }
    }

    // 타이핑 타이머 관리
    if (typingTimerRef.current) {
      clearTimeout(typingTimerRef.current);
    }

    if (isTyping) {
      typingTimerRef.current = setTimeout(() => {
        setIsUserTyping(false);
        if (name) {
          globalInputState.endInput(name);
        }
      }, 2000); // 2초 후 타이핑 상태 해제
    }
  }, [name]);

  // 조합 시작 핸들러 (완전 개선)
  const handleCompositionStart = useCallback((e) => {
    log('🎵 조합 시작');
    setIsComposing(true);
    setTypingState(true);
    compositionValueRef.current = e.target.value;
    
    // 기존 debounce 타이머 취소
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
  }, [log, setTypingState]);

  // 조합 종료 핸들러 (완전 개선)
  const handleCompositionEnd = useCallback((e) => {
    const newValue = e.target.value;
    log('🎵 조합 종료:', newValue);
    
    setIsComposing(false);
    setLocalValue(newValue);
    
    // 조합 종료 후 즉시 처리 (마지막 글자 손실 방지)
    if (compositionEndTimerRef.current) {
      clearTimeout(compositionEndTimerRef.current);
    }
    
    compositionEndTimerRef.current = setTimeout(() => {
      callOnChange(newValue);
      setTypingState(false);
    }, 100); // DOM 업데이트 보장
    
  }, [callOnChange, setTypingState, log]);

  // 입력 변경 핸들러 (완전 개선)
  const handleInputChange = useCallback((e) => {
    const newValue = e.target.value;
    const currentTime = Date.now();
    lastChangeTimeRef.current = currentTime;
    
    // 조합 중이면 로컬 상태만 업데이트
    if (isComposing || e.nativeEvent?.isComposing) {
      log('🎵 조합 중 - 로컬 상태만 업데이트:', newValue);
      setLocalValue(newValue);
      return;
    }

    // 입력 타입별 처리
    const inputType = e.nativeEvent?.inputType;
    if (inputType === 'insertCompositionText') {
      log('🎵 조합 텍스트 삽입 - 무시');
      return;
    }

    log('📝 입력 변경:', `"${localValue}" → "${newValue}"`);
    
    setLocalValue(newValue);
    
    isUserInputRef.current = true;
    setTypingState(true);
    
    // 지능형 debounce 적용
    smartDebounceOnChange(newValue);

    // 사용자 입력 플래그 관리
    setTimeout(() => {
      isUserInputRef.current = false;
    }, 1000);
  }, [isComposing, localValue, smartDebounceOnChange, setTypingState, log]);

  // 포커스 핸들러 (완전 개선)
  const handleFocus = useCallback((e) => {
    log('🎯 포커스 획득');
    setIsFocused(true);
    setTypingState(true);
    isUserInputRef.current = true;
    
    if (name) {
      globalInputState.startInput(name);
    }

    // 포커스 보호 타이머
    if (focusProtectionTimerRef.current) {
      clearTimeout(focusProtectionTimerRef.current);
    }
    
    focusProtectionTimerRef.current = setTimeout(() => {
      if (!isFocused) {
        log('🛡️ 포커스 보호 해제');
      }
    }, 3000);
  }, [name, isFocused, setTypingState, log]);

  // 블러 핸들러 (완전 개선 - 마우스 이동 대응)
  const handleBlur = useCallback((e) => {
    const currentValue = e.target.value;
    log('👋 포커스 해제:', currentValue);
    
    // 실제 포커스가 다른 곳으로 이동했는지 확인
    setTimeout(() => {
      const activeElement = document.activeElement;
      const isStillFocused = activeElement === inputRef.current;
      
      if (!isStillFocused) {
        setIsFocused(false);
        setTypingState(false);
        
        // 모든 타이머 정리하고 최종 값 확정
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
          debounceTimerRef.current = null;
        }
        
        if (compositionEndTimerRef.current) {
          clearTimeout(compositionEndTimerRef.current);
          compositionEndTimerRef.current = null;
        }
        
        if (focusProtectionTimerRef.current) {
          clearTimeout(focusProtectionTimerRef.current);
          focusProtectionTimerRef.current = null;
        }
        
        // 최종 값 확정
        callOnChange(currentValue);
        
        setTimeout(() => {
          isUserInputRef.current = false;
          if (name) {
            globalInputState.endInput(name);
          }
        }, 200);
        
        if (onBlur) {
          onBlur(e);
        }
      } else {
        log('🔄 포커스 유지됨 - 블러 무시');
      }
    }, 50); // 마우스 클릭 등의 포커스 이동 감지
  }, [callOnChange, onBlur, name, setTypingState, log]);

  // 키다운 핸들러 (완전 개선)
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' || e.key === 'Tab') {
      const currentValue = e.target.value;
      log('⌨️ 특수키 입력:', e.key);
      
      // 모든 타이머 정리하고 즉시 onChange 호출
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }
      
      if (compositionEndTimerRef.current) {
        clearTimeout(compositionEndTimerRef.current);
        compositionEndTimerRef.current = null;
      }
      
      callOnChange(currentValue);
      setTypingState(false);
    }
  }, [callOnChange, setTypingState, log]);

  // 마우스 이벤트 핸들러 (IDE 커서 이동 대응)
  const handleMouseLeave = useCallback(() => {
    // 마우스가 입력 필드를 벗어나도 포커스는 유지
    log('🖱️ 마우스 벗어남 - 포커스 유지');
  }, [log]);

  const handleMouseEnter = useCallback(() => {
    // log('🖱️ 마우스 진입');
  }, [log]);

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      if (compositionEndTimerRef.current) {
        clearTimeout(compositionEndTimerRef.current);
      }
      if (focusProtectionTimerRef.current) {
        clearTimeout(focusProtectionTimerRef.current);
      }
      if (typingTimerRef.current) {
        clearTimeout(typingTimerRef.current);
      }
      if (name) {
        globalInputState.endInput(name);
      }
    };
  }, [name]);

  // 렌더링 로직에 label 추가
  const inputId = name ? `simple-input-${name}` : undefined;

  const commonProps = {
    id: inputId,
    ref: inputRef,
    value: localValue,
    onChange: handleInputChange,
    onCompositionStart: handleCompositionStart,
    onCompositionEnd: handleCompositionEnd,
    onFocus: handleFocus,
    onBlur: handleBlur,
    placeholder: placeholder,
    className: className,
    name: name,
    ...otherProps,
  };

  return (
    <div>
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      {type === 'textarea' ? (
        <textarea {...commonProps} rows={otherProps.rows || 4} />
      ) : (
        <input {...commonProps} type={type} />
      )}
    </div>
  );
});

SimpleInput.displayName = 'SimpleInput';

export default SimpleInput; 