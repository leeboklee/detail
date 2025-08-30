'use client';

import { createContext } from 'react';

// Provides preview controls to children
// value: { setGeneratedHtml(html:string), registerGenerator(fn:()=>Promise<string>|string), generatedHtml:string }
const PreviewContext = createContext({
  setGeneratedHtml: () => {},
  registerGenerator: () => {},
  generatedHtml: ''
});

export default PreviewContext;


