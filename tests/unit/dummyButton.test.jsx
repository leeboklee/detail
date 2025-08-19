// tests/dummyButton.test.jsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import DummyButton from '../../app/components/DummyButton.jsx';

describe('DummyButton', () => {
  it('renders the button with default text', () => {
    render(<DummyButton />);
    const buttonElement = screen.getByRole('button', { name: /dummy button/i });
    expect(buttonElement).toBeInTheDocument();
  });

  it('renders the button with children as text', () => {
    render(<DummyButton>Click Me</DummyButton>);
    const buttonElement = screen.getByRole('button', { name: /click me/i });
    expect(buttonElement).toBeInTheDocument();
  });

  it('calls onClick handler when clicked', () => {
    const handleClick = vi.fn(); // Vitest의 mock 함수 생성
    render(<DummyButton onClick={handleClick}>Click Test</DummyButton>);
    const buttonElement = screen.getByRole('button', { name: /click test/i });
    fireEvent.click(buttonElement);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
}); 