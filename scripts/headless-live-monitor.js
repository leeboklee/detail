/*
 Headless live monitor for Next.js dev server on WSL
 - Opens http://localhost:3900 and /admin in headless Chromium
 - Captures console logs, page errors, failed requests, and 4xx/5xx responses
 - Writes newline-delimited JSON logs to logs/headless-live.jsonl and a human-readable log file
 - Saves screenshots to test-results/headless-live-*.png
*/

const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

function ensureDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function createLoggers() {
  const projectRoot = process.cwd();
  const logsDir = path.join(projectRoot, 'logs');
  const resultsDir = path.join(projectRoot, 'test-results');
  ensureDirectory(logsDir);
  ensureDirectory(resultsDir);

  const jsonlPath = path.join(logsDir, 'headless-live.jsonl');
  const textLogPath = path.join(logsDir, 'headless-live.log');

  const appendJson = (obj) => {
    try {
      fs.appendFileSync(jsonlPath, JSON.stringify(obj) + '\n');
    } catch (_) {}
  };

  const appendText = (line) => {
    try {
      fs.appendFileSync(textLogPath, line + '\n');
    } catch (_) {}
  };

  return { appendJson, appendText, resultsDir };
}

async function attachPageMonitors(page, logger, pageLabel) {
  page.on('console', (msg) => {
    const entry = {
      ts: new Date().toISOString(),
      type: 'console',
      level: msg.type(),
      text: msg.text(),
      location: msg.location?.() || undefined,
      page: pageLabel,
    };
    logger.appendJson(entry);
    logger.appendText(`[console:${entry.level}] ${entry.text}`);
  });

  page.on('pageerror', (error) => {
    const entry = {
      ts: new Date().toISOString(),
      type: 'pageerror',
      message: error.message,
      stack: error.stack,
      page: pageLabel,
    };
    logger.appendJson(entry);
    logger.appendText(`[pageerror] ${entry.message}`);
  });

  page.on('requestfailed', (req) => {
    const entry = {
      ts: new Date().toISOString(),
      type: 'requestfailed',
      url: req.url(),
      method: req.method(),
      failure: req.failure()?.errorText,
      page: pageLabel,
    };
    logger.appendJson(entry);
    logger.appendText(`[requestfailed] ${entry.method} ${entry.url} :: ${entry.failure}`);
  });

  page.on('response', (res) => {
    const status = res.status();
    if (status >= 400) {
      const entry = {
        ts: new Date().toISOString(),
        type: 'response',
        url: res.url(),
        status,
        statusText: res.statusText(),
        page: pageLabel,
      };
      logger.appendJson(entry);
      logger.appendText(`[response ${status}] ${entry.url}`);
    }
  });
}

async function visitAndCapture(browser, url, label, logger) {
  const page = await browser.newPage();
  await attachPageMonitors(page, logger, label);
  const started = Date.now();
  let statusCode = 'NO_RESPONSE';
  try {
    const resp = await page.goto(url, {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });
    statusCode = resp ? resp.status() : 'NO_RESPONSE';
  } catch (e) {
    logger.appendText(`[navigate error] ${label} :: ${e.message}`);
    logger.appendJson({ ts: new Date().toISOString(), type: 'navigate-error', label, message: e.message });
  }

  const elapsedMs = Date.now() - started;
  logger.appendText(`[navigate] ${label} -> ${url} :: status=${statusCode} timeMs=${elapsedMs}`);
  logger.appendJson({ ts: new Date().toISOString(), type: 'navigate', label, url, status: statusCode, timeMs: elapsedMs });

  // Screenshot after DOMContentLoaded or on error
  try {
    const outPath = path.join(logger.resultsDir, `headless-live-${label.replace(/[^a-z0-9_-]/gi, '_')}.png`);
    await page.screenshot({ path: outPath, fullPage: true });
    logger.appendText(`[screenshot] ${label} -> ${outPath}`);
  } catch (_) {}

  // Observe for a short period to collect runtime errors
  await page.waitForTimeout(5000);
  await page.close().catch(() => {});
  return statusCode;
}

async function main() {
  const logger = createLoggers();
  const base = 'http://localhost:3900';

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    defaultViewport: { width: 1366, height: 768 },
  });

  let exitCode = 0;
  try {
    const rootStatus = await visitAndCapture(browser, base + '/', 'root', logger);
    const adminStatus = await visitAndCapture(browser, base + '/admin', 'admin', logger);
    const ok = Number(rootStatus) === 200 && Number(adminStatus) === 200;
    logger.appendText(`[summary] root=${rootStatus} admin=${adminStatus}`);
    if (!ok) exitCode = 1;
    console.log(JSON.stringify({ base, root: rootStatus, admin: adminStatus, ok }, null, 2));
  } finally {
    await browser.close().catch(() => {});
    process.exit(exitCode);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});


