/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./jest.setup.js'],
    globals: true,
    css: true,
    reporters: ['verbose'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        '.next/',
        'dist/',
        'coverage/',
        'test-results/',
        'playwright-report/',
        'backup/',
        'debug/',
        'data/',
        'logs/',
        'generated/',
        '**/*.config.{js,ts}',
        '**/*.d.ts'
      ]
    },
    include: [
      'app/**/*.{test,spec}.{js,jsx,ts,tsx}',
      'lib/**/*.{test,spec}.{js,jsx,ts,tsx}',
      'tests/unit/**/*.{test,spec}.{js,jsx,ts,tsx}'
    ],
    exclude: [
      'node_modules',
      '.next',
      'dist',
      'coverage',
      'test-results',
      'playwright-report',
      'backup',
      'debug',
      'data',
      'logs',
      'generated',
      'tests/e2e/**'
    ]
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
      '@/components': path.resolve(__dirname, './app/components'),
      '@/lib': path.resolve(__dirname, './lib'),
      '@/utils': path.resolve(__dirname, './app/utils'),
      '@/hooks': path.resolve(__dirname, './app/hooks'),
      '@/styles': path.resolve(__dirname, './app/styles'),
      '@/context': path.resolve(__dirname, './app/context')
    }
  }
}); 