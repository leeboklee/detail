'use client';

import { useEffect, useState } from 'react';
import { eventEmitter } from './ui-event.js';

const FormManager = () => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    const formManager = {
      init() {
        try {
          this.applyFormStyles();
          this.setupFormValidation();
        } catch (error) {
          console.error('폼 초기화 오류:', error);
        }
      },

      applyFormStyles() {
        try {
          // 입력 필드 최적화
          document.querySelectorAll('.form-control').forEach(input => {
            input.classList.add('form-control-compact');
          });

          // 텍스트영역 자동 크기 조절
          document.querySelectorAll('textarea').forEach(textarea => {
            textarea.style.height = 'auto';
            textarea.style.height = textarea.scrollHeight + 'px';

            textarea.addEventListener('input', () => {
              textarea.style.height = 'auto';
              textarea.style.height = textarea.scrollHeight + 'px';
            });
          });

          // URL 입력 그룹 최적화
          document.querySelectorAll('.url-input-group').forEach(group => {
            this.setupUrlInputGroup(group);
          });
        } catch (error) {
          console.error('폼 스타일 적용 오류:', error);
        }
      },

      setupUrlInputGroup(group) {
        try {
          const input = group.querySelector('input[type="url"]');
          const removeBtn = group.querySelector('.remove-url');

          if (input) {
            // URL 입력 시 자동 검증
            input.addEventListener('input', () => {
              const isValid = input.checkValidity();
              input.classList.toggle('is-valid', isValid && input.value.trim());
              input.classList.toggle('is-invalid', !isValid && input.value.trim());
            });

            // 붙여넣기 시 자동 정리
            input.addEventListener('paste', (e) => {
              e.preventDefault();
              const text = e.clipboardData.getData('text');
              input.value = text.trim();
              input.dispatchEvent(new Event('input'));
            });
          }

          if (removeBtn) {
            removeBtn.addEventListener('click', () => {
              group.classList.add('fade-out');
              setTimeout(() => group.remove(), 300);
            });
          }
        } catch (error) {
          console.error('URL 입력 그룹 설정 오류:', error);
        }
      },

      setupFormValidation() {
        try {
          document.querySelectorAll('form').forEach(form => {
            // 실시간 유효성 검사
            form.querySelectorAll('input, textarea, select').forEach(field => {
              field.addEventListener('input', () => {
                this.validateField(field);
              });

              field.addEventListener('blur', () => {
                this.validateField(field);
              });
            });

            // 폼 제출 처리
            form.addEventListener('submit', (e) => {
              e.preventDefault();
              if (this.validateForm(form)) {
                eventEmitter.emit('formSubmit', {
                  formId: form.id,
                  data: new FormData(form)
                });
              }
            });
          });
        } catch (error) {
          console.error('폼 검증 설정 오류:', error);
        }
      },

      validateField(field) {
        try {
          const isValid = field.checkValidity();
          const isEmpty = !field.value.trim();

          field.classList.toggle('is-valid', isValid && !isEmpty);
          field.classList.toggle('is-invalid', !isValid || isEmpty);

          // 에러 메시지 표시
          let errorDiv = field.nextElementSibling;
          if (!errorDiv || !errorDiv.classList.contains('invalid-feedback')) {
            errorDiv = document.createElement('div');
            errorDiv.className = 'invalid-feedback';
            field.parentNode.insertBefore(errorDiv, field.nextSibling);
          }
          errorDiv.textContent = field.validationMessage || '이 필드는 필수입니다';

          return isValid && !isEmpty;
        } catch (error) {
          console.error('필드 검증 오류:', error);
          return false;
        }
      },

      validateForm(form) {
        try {
          let isValid = true;
          form.querySelectorAll('input, textarea, select').forEach(field => {
            if (!this.validateField(field)) {
              isValid = false;
            }
          });
          return isValid;
        } catch (error) {
          console.error('폼 검증 오류:', error);
          return false;
        }
      }
    };

    formManager.init();
  }, [isClient]);

  return null; // 이 컴포넌트는 UI를 렌더링하지 않습니다.
};

export default FormManager;
