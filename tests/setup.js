import '@testing-library/jest-dom';
import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

// Testing Library??모든 matchers�?Vitest???�장
expect.extend(matchers);

// �??�스???�후 ?�동 clean-up
afterEach(() => {
  cleanup();
}); 
