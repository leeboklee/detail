import '@testing-library/jest-dom';
import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

// Testing Library??紐⑤뱺 matchers瑜?Vitest???뺤옣
expect.extend(matchers);

// 媛??뚯뒪???댄썑 ?먮룞 clean-up
afterEach(() => {
  cleanup();
}); 
