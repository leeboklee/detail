'use client';

import React, { useState, useEffect, useCallback, memo } from 'react';
import { Button, Textarea, Card, CardBody, CardHeader, CardFooter, Divider } from '@heroui/react';

/**
 * HTML 에디터 컴포넌트
 * - HTML 코드 직접 편집 가능
 * - 미리보기 탭으로 결과 확인
 * - 외부 에디터 링크 제공
 */
const HtmlEditor = memo(({ initialHtml = '', onSave }) => {
  const [htmlCode, setHtmlCode] = useState(initialHtml);
  const [copySuccess, setCopySuccess] = useState(false);

  // HTML이 변경되면 상태 업데이트
  useEffect(() => {
    if (initialHtml && initialHtml !== htmlCode) {
      setHtmlCode(initialHtml);
    }
  }, [initialHtml, htmlCode]);

  // HTML 코드 변경 핸들러
  const handleCodeChange = useCallback((e) => {
    setHtmlCode(e.target.value);
  }, []);

  // 외부 에디터로 열기
  const openExternalEditor = useCallback(() => {
    // HTML 코드를 인코딩하여 URL 파라미터로 전달
    const encodedHtml = encodeURIComponent(htmlCode);
    window.open(`https://url.kr/p/html-editor/?code=${encodedHtml}`, '_blank');
  }, [htmlCode]);

  // HTML 코드 복사
  const copyHtmlCode = useCallback(() => {
    navigator.clipboard.writeText(htmlCode)
      .then(() => {
        setCopySuccess(true);
        // 2초 후 복사 성공 메시지 제거
        setTimeout(() => setCopySuccess(false), 2000);
      })
      .catch(err => {
        console.error('클립보드 복사 실패:', err);
        alert('클립보드 복사에 실패했습니다.');
      });
  }, [htmlCode]);

  // 저장 버튼 핸들러
  const handleSave = useCallback(() => {
    if (typeof onSave === 'function') {
      onSave(htmlCode);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  }, [htmlCode, onSave]);

  return (
    <Card className="w-full h-full">
      <CardHeader className="flex justify-between items-center">
        <h3 className="text-lg font-bold">HTML 에디터</h3>
        <div className="flex gap-2 items-center">
          {copySuccess && (
            <span className="text-success text-sm">✓ 복사 완료</span>
          )}
          <Button size="sm" color="primary" onClick={openExternalEditor}>
            외부 에디터로 열기
          </Button>
          <Button size="sm" onClick={copyHtmlCode}>
            HTML 복사
          </Button>
          <Button size="sm" color="success" onClick={handleSave}>
            저장
          </Button>
        </div>
      </CardHeader>
      <Divider />
      <CardBody className="flex flex-col p-0 overflow-auto h-full">
        <div className="flex flex-col w-full h-full">
          <div className="w-full flex-1">
            <div className="p-2 font-bold text-center border-b sticky top-0 bg-white z-10">코드 편집</div>
            <div className="p-2">
              <Textarea
                value={htmlCode}
                onChange={handleCodeChange}
                placeholder="HTML 코드를 입력하세요..."
                className="w-full font-mono text-sm"
                minRows={15}
                style={{ fontFamily: 'monospace', resize: 'vertical' }}
              />
            </div>
          </div>
          {/* 중복 미리보기 제거 - app/page.js의 Preview 컴포넌트 사용 */}
        </div>
      </CardBody>
      <CardFooter className="text-small justify-end">
        <span className="text-gray-500">
          외부 에디터: <a href="https://url.kr/p/html-editor/" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">https://url.kr/p/html-editor/</a>
        </span>
      </CardFooter>
    </Card>
  );
});

HtmlEditor.displayName = 'HtmlEditor';

export default HtmlEditor; 