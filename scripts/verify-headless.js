// Headless sanity check for WSL-hosted dev server
// Tries WSL IP:3900 and localhost:3900, captures screenshots

const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

async function resolveTargets() {
  let wslIp = '';
  try {
    const out = execFileSync('wsl.exe', ['hostname', '-I'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
    wslIp = (out || '').trim().split(/\s+/)[0] || '';
  } catch {}
  const targets = [];
  if (wslIp) targets.push(`http://${wslIp}:3900`);
  targets.push('http://localhost:3900');
  return targets;
}

async function checkOne(browser, baseUrl) {
  const results = [];
  const pages = ['/', '/admin'];
  const outDir = path.join(process.cwd(), 'test-results');
  fs.mkdirSync(outDir, { recursive: true });
  for (const p of pages) {
    const url = new URL(p, baseUrl).toString();
    const page = await browser.newPage();
    try {
      const resp = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
      const ok = !!resp && resp.ok();
      const status = resp ? resp.status() : 'NO_RESPONSE';
      await page.screenshot({ path: path.join(outDir, `headless${p === '/' ? '' : p.replace(/\//g, '_')}.png`) });
      results.push({ url, ok, status });
    } catch (e) {
      results.push({ url, ok: false, status: String(e && e.message || e) });
    } finally {
      await page.close().catch(() => {});
    }
  }
  return results;
}

async function main() {
  const targets = await resolveTargets();
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  try {
    for (const base of targets) {
      const res = await checkOne(browser, base);
      const allOk = res.every(r => r.ok);
      console.log(JSON.stringify({ base, results: res, allOk }, null, 2));
      if (allOk) return;
    }
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
}

main().catch(err => { console.error(err); process.exit(1); });


