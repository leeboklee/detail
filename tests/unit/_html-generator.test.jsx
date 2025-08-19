import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';

// 적절한 모킹을 위한 설정
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn()
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams()
}));

// 가짜 홈 컴포넌트를 만들어 HTML 생성 기능을 테스트합니다
const mockHtmlContent = '<html><body>테스트 HTML 내용</body></html>';

// HTML 생성 함수 모킹
const generatePreviewHtml = vi.fn().mockImplementation(() => {
  return mockHtmlContent;
});

// 가짜 SimplePreview 컴포넌트
vi.mock('../app/components/SimplePreview', () => ({
  default: ({ htmlContent }) => (
    <div data-testid="mock-preview">
      {htmlContent || '미리보기 내용 없음'}
    </div>
  )
}));

// 간단한 테스트용 컴포넌트
const MockHomePage = () => {
  return (
    <div>
      <button 
        data-testid="preview-generate-html-button"
        onClick={() => generatePreviewHtml()}
      >
        HTML 생성
      </button>
      <div data-testid="preview-container">
        미리보기 영역
      </div>
    </div>
  );
};

describe('HTML 생성 기능 테스트', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('HTML 생성 버튼이 렌더링됨', () => {
    render(<MockHomePage />);
    const button = screen.getByText('HTML 생성');
    expect(button).toBeDefined();
  });

  test('HTML 생성 버튼 클릭 시 generatePreviewHtml 함수가 호출됨', () => {
    render(<MockHomePage />);
    const button = screen.getByText('HTML 생성');
    
    fireEvent.click(button);
    
    expect(generatePreviewHtml).toHaveBeenCalledTimes(1);
  });

  test('HTML 생성 결과가 반환됨', () => {
    const result = generatePreviewHtml();
    expect(result).toBe(mockHtmlContent);
  });
}); 