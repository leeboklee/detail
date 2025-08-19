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
          this.setupAutoSave();
        } catch (error) {
          console.error('폼 초기화 오류:', error);
        }
      },

      applyFormStyles() {
        try {
          // 입력 필드 최적화
          document.querySelectorAll('.form-control, .form-input').forEach(input => {
            input.classList.add('form-input');
            input.classList.add('animate-fade-in');
          });

          // 텍스트영역 자동 크기 조절
          document.querySelectorAll('textarea').forEach(textarea => {
            this.setupTextareaAutoResize(textarea);
          });

          // URL 입력 그룹 최적화
          document.querySelectorAll('.url-input-group').forEach(group => {
            this.setupUrlInputGroup(group);
          });

          // 폼 그룹 스타일링
          document.querySelectorAll('.form-group').forEach(group => {
            group.classList.add('space-y-2');
          });

          // 라벨 스타일링
          document.querySelectorAll('label').forEach(label => {
            label.classList.add('form-label');
          });
        } catch (error) {
          console.error('폼 스타일 적용 오류:', error);
        }
      },

      setupTextareaAutoResize(textarea) {
        const resizeTextarea = () => {
          textarea.style.height = 'auto';
          textarea.style.height = textarea.scrollHeight + 'px';
        };

        textarea.addEventListener('input', resizeTextarea);
        textarea.addEventListener('focus', resizeTextarea);
        
        // 초기 크기 설정
        setTimeout(resizeTextarea, 100);
      },

      setupUrlInputGroup(group) {
        try {
          const inputs = group.querySelectorAll('input[type="url"], input[type="text"]');
          const addButton = group.querySelector('.add-url-btn');
          const removeButtons = group.querySelectorAll('.remove-url-btn');

          if (addButton) {
            addButton.addEventListener('click', () => {
              this.addUrlInput(group);
            });
          }

          removeButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
              this.removeUrlInput(e.target.closest('.url-input-item'));
            });
          });

          // URL 입력 필드 유효성 검사
          inputs.forEach(input => {
            input.addEventListener('blur', () => {
              this.validateUrl(input);
            });
          });
        } catch (error) {
          console.error('URL 입력 그룹 설정 오류:', error);
        }
      },

      addUrlInput(group) {
        const urlInputs = group.querySelector('.url-inputs');
        const newInput = document.createElement('div');
        newInput.className = 'url-input-item flex gap-2 mb-2';
        newInput.innerHTML = `
          <input type="url" class="form-input flex-1" placeholder="URL을 입력하세요">
          <button type="button" class="btn btn-error btn-sm remove-url-btn">
            <span>🗑️</span>
          </button>
        `;

        urlInputs.appendChild(newInput);

        // 새 입력 필드에 이벤트 리스너 추가
        const input = newInput.querySelector('input');
        const removeBtn = newInput.querySelector('.remove-url-btn');

        input.addEventListener('blur', () => this.validateUrl(input));
        removeBtn.addEventListener('click', () => this.removeUrlInput(newInput));
      },

      removeUrlInput(item) {
        if (item && item.parentNode) {
          item.parentNode.removeChild(item);
        }
      },

      validateUrl(input) {
        const url = input.value.trim();
        if (url && !this.isValidUrl(url)) {
          input.classList.add('is-invalid');
          this.showFieldError(input, '올바른 URL 형식을 입력해주세요');
        } else {
          input.classList.remove('is-invalid');
          input.classList.add('is-valid');
          this.clearFieldError(input);
        }
      },

      isValidUrl(string) {
        try {
          new URL(string);
          return true;
        } catch (_) {
          return false;
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

              // 포커스 시 스타일 적용
              field.addEventListener('focus', () => {
                field.classList.add('focused');
              });

              field.addEventListener('blur', () => {
                field.classList.remove('focused');
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

      setupAutoSave() {
        try {
          const autoSaveFields = document.querySelectorAll('[data-autosave]');
          
          autoSaveFields.forEach(field => {
            let timeout;
            
            field.addEventListener('input', () => {
              clearTimeout(timeout);
              timeout = setTimeout(() => {
                this.saveFieldData(field);
              }, 1000);
            });
          });
        } catch (error) {
          console.error('자동 저장 설정 오류:', error);
        }
      },

      saveFieldData(field) {
        try {
          const key = field.dataset.autosave || field.name || field.id;
          const value = field.value;
          
          if (key && value !== undefined) {
            localStorage.setItem(`autosave_${key}`, value);
            this.showAutoSaveIndicator(field);
          }
        } catch (error) {
          console.error('필드 데이터 저장 오류:', error);
        }
      },

      showAutoSaveIndicator(field) {
        const indicator = document.createElement('div');
        indicator.className = 'autosave-indicator';
        indicator.textContent = '💾 저장됨';
        indicator.style.cssText = `
          position: absolute;
          right: 8px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 12px;
          color: var(--success-500);
          opacity: 0;
          transition: opacity 0.3s;
        `;

        const container = field.parentNode;
        if (container.style.position !== 'relative') {
          container.style.position = 'relative';
        }

        container.appendChild(indicator);

        // 애니메이션 표시
        setTimeout(() => {
          indicator.style.opacity = '1';
        }, 100);

        // 2초 후 제거
        setTimeout(() => {
          indicator.style.opacity = '0';
          setTimeout(() => {
            if (indicator.parentNode) {
              indicator.parentNode.removeChild(indicator);
            }
          }, 300);
        }, 2000);
      },

      validateField(field) {
        try {
          const isValid = field.checkValidity();
          const isEmpty = !field.value.trim();
          const isRequired = field.hasAttribute('required');

          // 필수 필드가 비어있으면 유효하지 않음
          const fieldIsValid = isRequired ? (isValid && !isEmpty) : (isEmpty || isValid);

          field.classList.toggle('is-valid', fieldIsValid && !isEmpty);
          field.classList.toggle('is-invalid', !fieldIsValid);

          // 에러 메시지 표시
          this.updateFieldError(field, fieldIsValid);

          return fieldIsValid;
        } catch (error) {
          console.error('필드 검증 오류:', error);
          return false;
        }
      },

      updateFieldError(field, isValid) {
        let errorDiv = field.nextElementSibling;
        
        if (!errorDiv || !errorDiv.classList.contains('invalid-feedback')) {
          errorDiv = document.createElement('div');
          errorDiv.className = 'invalid-feedback';
          field.parentNode.insertBefore(errorDiv, field.nextSibling);
        }

        if (!isValid) {
          const errorMessage = field.validationMessage || this.getCustomErrorMessage(field);
          errorDiv.textContent = errorMessage;
          errorDiv.style.display = 'block';
        } else {
          errorDiv.style.display = 'none';
        }
      },

      getCustomErrorMessage(field) {
        const type = field.type;
        const isRequired = field.hasAttribute('required');
        
        if (isRequired && !field.value.trim()) {
          return '이 필드는 필수입니다';
        }
        
        switch (type) {
          case 'email':
            return '올바른 이메일 형식을 입력해주세요';
          case 'url':
            return '올바른 URL 형식을 입력해주세요';
          case 'number':
            return '숫자를 입력해주세요';
          case 'tel':
            return '올바른 전화번호 형식을 입력해주세요';
          default:
            return '올바른 값을 입력해주세요';
        }
      },

      showFieldError(field, message) {
        let errorDiv = field.nextElementSibling;
        
        if (!errorDiv || !errorDiv.classList.contains('invalid-feedback')) {
          errorDiv = document.createElement('div');
          errorDiv.className = 'invalid-feedback';
          field.parentNode.insertBefore(errorDiv, field.nextSibling);
        }

        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
      },

      clearFieldError(field) {
        const errorDiv = field.nextElementSibling;
        if (errorDiv && errorDiv.classList.contains('invalid-feedback')) {
          errorDiv.style.display = 'none';
        }
      },

      validateForm(form) {
        try {
          const fields = form.querySelectorAll('input, textarea, select');
          let isValid = true;

          fields.forEach(field => {
            if (!this.validateField(field)) {
              isValid = false;
            }
          });

          if (!isValid) {
            this.showFormError(form, '폼에 오류가 있습니다. 확인해주세요.');
          } else {
            this.clearFormError(form);
          }

          return isValid;
        } catch (error) {
          console.error('폼 검증 오류:', error);
          return false;
        }
      },

      showFormError(form, message) {
        let errorDiv = form.querySelector('.form-error');
        
        if (!errorDiv) {
          errorDiv = document.createElement('div');
          errorDiv.className = 'form-error alert alert-error';
          form.insertBefore(errorDiv, form.firstChild);
        }

        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
      },

      clearFormError(form) {
        const errorDiv = form.querySelector('.form-error');
        if (errorDiv) {
          errorDiv.style.display = 'none';
        }
      }
    };

    // 폼 매니저 초기화
    formManager.init();

    // DOM 변경 감지
    const observer = new MutationObserver(() => {
      formManager.init();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    return () => {
      observer.disconnect();
    };
  }, [isClient]);

  return null;
};

export default FormManager;
