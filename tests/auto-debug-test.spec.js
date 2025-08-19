import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LOG_FILE = path.join(__dirname, '../auto-debug-logs.json');

test.describe('Automated Debugger', () => {
  let consoleLogs = [];

  test.beforeEach(async ({ page }) => {
    // Collect console logs
    page.on('console', msg => {
      if (msg.type() === 'error' || msg.type() === 'warn') {
        consoleLogs.push({
          type: msg.type(),
          text: msg.text(),
          location: msg.location(),
        });
      }
    });
  });

  test('Capture logs and screenshot', async ({ page }) => {
    await page.goto('http://localhost:3900', { waitUntil: 'networkidle' });
    
    // Give it a second for async operations to complete
    await page.waitForTimeout(2000);

    const screenshotPath = path.join(__dirname, '../auto-debug-screenshot.png');
    await page.screenshot({ path: screenshotPath, fullPage: true });

    const debugInfo = {
      timestamp: new Date().toISOString(),
      url: page.url(),
      consoleLogs,
      screenshotPath,
    };

    fs.writeFileSync(LOG_FILE, JSON.stringify(debugInfo, null, 2));

    // Optional: Check if there are any console errors
    // expect(consoleLogs.filter(log => log.type === 'error')).toHaveLength(0);
  });
}); 
