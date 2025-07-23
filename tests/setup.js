import '@testing-library/jest-dom';
import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

// Testing Library??ëª¨ë“  matchersë¥?Vitest???•ìž¥
expect.extend(matchers);

// ê°??ŒìŠ¤???´í›„ ?ë™ clean-up
afterEach(() => {
  cleanup();
}); 
