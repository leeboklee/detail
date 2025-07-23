'use client'

import React, { useState, useEffect, useRef, useCallback, useMemo, memo, lazy, Suspense } from 'react'
import SplitPane, { Pane } from 'split-pane-react'
import styles from './AppContainer.module.css'
import 'split-pane-react/esm/themes/default.css';
import SectionOrderManager from './SectionOrderManager';
import Preview from './Preview'
import { useAppContext } from '@/context/AppContext';
import { TEMPLATES } from '@shared/utils/constants';

const DynamicEditor = lazy(() => import('./DynamicEditor'));

const Spinner = () => <div className={styles.spinner} />;

const BASE_STYLE = `
  <style>
    body { font-family: 'Noto Sans KR', sans-serif; margin:0; padding:0; scroll-behavior: smooth; }
    .hotel-title { font-size:2rem; font-weight:bold; color:#222; margin:24px 0 16px 0; }
    html, body { height:100%; }
  </style>
`;

const AppContainer = memo(({ children, className = '', ...props }) => {
  const {
    hotelInfo,
    templates,
    selectedTemplate,
    setSelectedTemplate,
    saveTemplate,
    deleteTemplate,
    loadTemplate,
    isHydrated,
  } = useAppContext();

  const [htmlContent, setHtmlContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [editorContent, setEditorContent] = useState('');
  const [error, setError] = useState(null);
  const [rightActiveTab, setRightActiveTab] = useState('editor');
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [currentViewMode, setCurrentViewMode] = useState('desktop');

  const previewRef = useRef(null);
  const editorRef = useRef(null);

  const [splitSize, setSplitSize] = useState('40%');
  
  // URL 파라미터에서 탭 상태 읽기
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const tabParam = urlParams.get('tab');
      if (tabParam && ['editor', 'preview'].includes(tabParam)) {
        setRightActiveTab(tabParam);
      }
    }
  }, []);

  // 탭 변경 시 URL 업데이트
  const handleTabChange = useCallback((tabId) => {
    setRightActiveTab(tabId);
    
    if (typeof window !== 'undefined') {
      const url = new URL(window.location);
      url.searchParams.set('tab', tabId);
      window.history.replaceState({}, '', url);
    }
  }, []);

  // 탭 링크 복사 기능
  const copyTabLink = useCallback((tabId) => {
    if (typeof window !== 'undefined') {
      const url = new URL(window.location);
      url.searchParams.set('tab', tabId);
      navigator.clipboard.writeText(url.toString());
    }
  }, []);
  
  useEffect(() => {
    if (selectedTemplate && isHydrated) {
      loadTemplate(selectedTemplate);
    }
  }, [selectedTemplate, loadTemplate, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;
    
    const templateData = templates && templates[selectedTemplate];
    const initialHtml = templateData?.html || TEMPLATES.default || '<!-- 기본 템플릿 로드 오류 -->';
    setEditorContent(initialHtml);
  }, [selectedTemplate, templates, isHydrated]);

  const processTemplate = useCallback((template, data) => {
    let html = template;
    for (const key in data) {
      if (typeof data[key] === 'object' && data[key] !== null) {
         for (const subKey in data[key]) {
            const regex = new RegExp(`\\{\\{${key}\\.${subKey}\\}\\}`, 'g');
            html = html.replace(regex, data[key][subKey] || '');
         }
      } else {
          const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
          html = html.replace(regex, data[key] || '');
      }
    }
    if (/<head[\\s>]/i.test(html)) {
      if (!html.includes('<style id="base-style">')) {
         html = html.replace(/<head([\\s>])/, `<head$1<style id="base-style">${BASE_STYLE}</style>`);
      }
    } else {
      if (!html.includes('<style id="base-style">')) {
         html = `<style id="base-style">${BASE_STYLE}</style>` + html;
      }
    }
    return html;
  }, []);

  const generateHTML = useCallback(async () => {
    try {
      if (!hotelInfo) {
        return;
      }

      const htmlContent = await generateHotelHTML(selectedTemplate, hotelInfo);
      setHtmlContent(htmlContent);
    } catch (err) {
      console.error('HTML 생성 오류:', err);
    }
  }, [selectedTemplate, hotelInfo]);

  const handleEditorChange = useCallback((value) => {
    setEditorContent(value || '');
  }, []);

  const handleTemplateSelect = useCallback((templateId) => {
    setSelectedTemplate(templateId);
  }, [setSelectedTemplate]);

  const handleSaveTemplate = useCallback(async (newTemplateName) => {
    if (!hotelInfo) return;
    
    try {
      if (saveTemplate) {
        const newTemplate = {
          ...hotelInfo,
          metadata: {
            name: newTemplateName,
            createdAt: new Date().toISOString(),
            version: '1.0'
          }
        };
        
        await saveTemplate(newTemplateName, newTemplate);
        setSelectedTemplate(newTemplateName);
      }
    } catch (error) {
      console.error('템플릿 저장 오류:', error);
    }
  }, [hotelInfo, saveTemplate]);

  const handleDeleteTemplate = useCallback(async (templateKey) => {
    try {
      if (deleteTemplate) {
        await deleteTemplate(templateKey);
        if (selectedTemplate === templateKey) {
          setSelectedTemplate('');
        }
      }
    } catch (error) {
      console.error('템플릿 삭제 오류:', error);
    }
  }, [selectedTemplate, deleteTemplate]);

  const copyHtmlToClipboard = useCallback(async () => {
    if (htmlContent) {
      try {
        await navigator.clipboard.writeText(htmlContent);
      } catch (err) {
        console.error('클립보드 복사 실패:', err);
      }
    }
  }, [htmlContent]);

  const viewModeClasses = useMemo(() => {
    const baseClass = styles.previewContainer;
    if (currentViewMode === 'desktop') return baseClass;
    if (currentViewMode === 'tablet') return `${baseClass} ${styles.tabletView}`;
    if (currentViewMode === 'mobile') return `${baseClass} ${styles.mobileView}`;
    return baseClass;
  }, [currentViewMode]);

  const containerClass = useMemo(() => {
    return `${styles.container} ${className}`.trim()
  }, [className])

  return (
    <div className={containerClass} {...props} data-hydrated={isHydrated}>
      {children}
      {!isHydrated ? (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          fontSize: '1.2em',
          color: '#666'
        }}>
          <Spinner />
          <span style={{ marginLeft: '10px' }}>로딩 중...</span>
        </div>
      ) : (
        <SplitPane 
          split="vertical"
          sizes={[splitSize, 'auto']}
          onChange={(sizes) => setSplitSize(sizes[0])}
        >
        <Pane 
          minSize={300}
          maxSize={800}
          className={styles.hotelInfoSection} 
          style={{ 
            height: '100%',
            overflow: 'auto', 
            padding: '1rem', 
            borderRight: 'none'
          }}
        >
          <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">호텔 상세페이지 관리자</h1>
            <SectionOrderManager />
          </div>
        </Pane>
        <Pane 
          className={styles.rightSection} 
          style={{ 
            flex: 1,
            display: 'flex', 
            flexDirection: 'column', 
            overflow: 'hidden', 
            height: '100%'
          }}
        >
          <div className={styles.toolbar} style={{ flexShrink: 0 }}>
            <div className={styles.tabButtons}>
              <button 
                className={`${styles.tabButton} ${rightActiveTab === 'editor' ? styles.active : ''}`}
                onClick={() => handleTabChange('editor')}
                title="에디터 탭 (링크 복사: 우클릭)"
                onContextMenu={(e) => {
                  e.preventDefault();
                  copyTabLink('editor');
                }}
              >
                에디터
              </button>
              <button 
                className={`${styles.tabButton} ${rightActiveTab === 'preview' ? styles.active : ''}`}
                onClick={() => handleTabChange('preview')}
                title="미리보기 탭 (링크 복사: 우클릭)"
                onContextMenu={(e) => {
                  e.preventDefault();
                  copyTabLink('preview');
                }}
              >
                미리보기
              </button>
            </div>
            <div className={styles.toolbarButtons}>
              <button 
                className={styles.toolbarButton}
                onClick={generateHTML}
                disabled={loading || !editorContent || !hotelInfo || Object.keys(hotelInfo).length === 0}
              >
                {loading ? <Spinner /> : 'HTML 생성'}
              </button>
              <button 
                className={styles.toolbarButton}
                onClick={copyHtmlToClipboard}
                disabled={!htmlContent}
              >
                HTML 복사
              </button>
              <button
                className={styles.toolbarButton}
                onClick={() => setIsSaveModalOpen(true)}
                disabled={!editorContent}
              >
                템플릿 저장
              </button>
            </div>
          </div>
          <div className={styles.tabContent} style={{ flex: 1, overflow: 'hidden' }}>
            {rightActiveTab === 'editor' && (
              <div className={styles.editorContent} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <div className={styles.templateSelector}>
                  {templates.map(template => {
                    const isDefault = ['default', 'modern', 'classic', 'minimal'].includes(template.id);
                    return (
                      <div 
                        key={template.id}
                        className={`${styles.templateItem} ${selectedTemplate === template.id ? styles.active : ''}`}
                        onClick={() => handleTemplateSelect(template.id)}
                        title={template.name}
                      >
                        <span className={styles.templateName}>{template.name}</span>
                        {!isDefault && (
                          <button 
                            className={styles.deleteTemplateButton}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteTemplate(template.id);
                            }}
                            title="템플릿 삭제"
                          >
                            &times;
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
                <Suspense fallback={<Spinner />}>
                  <DynamicEditor
                    height="calc(100% - 40px)"
                    value={editorContent}
                    onChange={handleEditorChange}
                    onMount={(editor) => editorRef.current = editor}
                  />
                </Suspense>
                {error && <div className={styles.errorMessage} style={{color: 'red', padding: '5px'}}>{error}</div>}
              </div>
            )}
            {rightActiveTab === 'preview' && (
              <div className={styles.previewContent} style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
                 <div className={styles.viewModesContainer} style={{ background:'#f0f0f0', padding:'5px', textAlign:'center', flexShrink: 0 }}>
                    <button 
                      className={`${styles.viewModeButton} ${currentViewMode === 'desktop' ? styles.active : ''}`}
                      onClick={() => setCurrentViewMode('desktop')}
                      title="데스크탑 보기"
                    >
                      🖥
                    </button>
                    <button 
                      className={`${styles.viewModeButton} ${currentViewMode === 'tablet' ? styles.active : ''}`}
                      onClick={() => setCurrentViewMode('tablet')}
                      title="태블릿 보기"
                    >
                      📱(T)
                    </button>
                    <button 
                      className={`${styles.viewModeButton} ${currentViewMode === 'mobile' ? styles.active : ''}`}
                      onClick={() => setCurrentViewMode('mobile')}
                      title="모바일 보기"
                    >
                      📱(M)
                    </button>
                  </div>
                <div className={viewModeClasses} ref={previewRef} style={{ flex: 1, overflow: 'auto', position: 'relative', margin: 'auto', width: '100%' }}>
                  <Preview 
                    htmlContent={htmlContent}
                    viewMode={currentViewMode}
                    loading={loading}
                    error={error}
                    onError={(err) => {
                      console.error('미리보기 오류:', err);
                      setError(`미리보기 오류: ${err.message || '알 수 없는 오류'}`);
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </Pane>
      </SplitPane>
      )}
      {isSaveModalOpen && (
        <div className={styles.saveTemplateModal}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <div className={styles.modalTitle}>템플릿 저장</div>
              <button 
                className={styles.closeButton}
                onClick={() => setIsSaveModalOpen(false)}
              >
                &times;
              </button>
            </div>
            <div className={styles.inputGroup}>
              <label className={styles.label} htmlFor="templateName">템플릿 이름</label>
              <input
                id="templateName"
                className={styles.input}
                type="text"
                value={newTemplateName}
                onChange={(e) => setNewTemplateName(e.target.value)}
                placeholder="템플릿 이름을 입력하세요"
              />
            </div>
            <div className={styles.buttonGroup}>
              <button 
                className={styles.cancelButton}
                onClick={() => setIsSaveModalOpen(false)}
              >
                취소
              </button>
              <button 
                className={styles.saveButton}
                onClick={() => handleSaveTemplate(newTemplateName)}
                disabled={!newTemplateName.trim() || !editorContent}
              >
                저장
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

export default AppContainer;