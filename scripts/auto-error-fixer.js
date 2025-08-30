#!/usr/bin/env node
const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');
const http = require('http');
const https = require('https');

const PROJECT_ROOT = process.cwd();
const LOG = path.resolve(PROJECT_ROOT, 'dev.log');
const ACTION_LOG = path.resolve(PROJECT_ROOT, 'scripts', 'auto-error-fixer.log');

function log(msg) {
  const line = `[${new Date().toISOString()}] ${msg}\n`;
  try { fs.appendFileSync(ACTION_LOG, line); } catch (e) { /* ignore */ }
  console.log(line.trim());
}

function notifyWebhook(title, message, extra) {
  try {
    const webhook = process.env.ERROR_WEBHOOK_URL;
    if (!webhook) return;
    const url = new URL(webhook);
    const payload = JSON.stringify({ title, message, extra: extra || {}, timestamp: new Date().toISOString() });
    const opts = {
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: url.pathname + (url.search || ''),
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) }
    };
    const reqFn = url.protocol === 'https:' ? https.request : http.request;
    const req = reqFn(opts, (res) => { res.on('data', () => {}); res.on('end', () => {}); });
    req.on('error', (err) => log('Webhook notify failed: ' + err.message));
    req.write(payload); req.end();
  } catch (e) {
    log('notifyWebhook error: ' + e.message);
  }
}

function getLogSnippet(bytes = 2000) {
  try {
    if (!fs.existsSync(LOG)) return '';
    const stat = fs.statSync(LOG);
    const start = Math.max(0, stat.size - bytes);
    const fd = fs.openSync(LOG, 'r');
    const buf = Buffer.alloc(Math.min(bytes, stat.size));
    fs.readSync(fd, buf, 0, buf.length, start);
    fs.closeSync(fd);
    return buf.toString('utf8');
  } catch (e) { return ''; }
}

const cooldown = {};
function shouldHandle(key, ms = 30000) {
  const last = cooldown[key] || 0;
  if (Date.now() - last < ms) return false;
  cooldown[key] = Date.now();
  return true;
}

function restartServer() {
  try {
    log('Restarting dev server: killing existing processes and starting `npm run dev`');
    try { execSync("pkill -f 'next dev' || true"); } catch(e){}
    try { execSync("pkill -f nodemon || true"); } catch(e){}
    try { execSync('rm -rf .next'); } catch(e){}
    try { execSync('npm run dev > dev.log 2>&1 & echo $! > .next_pid', { shell: '/bin/bash' }); } catch(e){ log('Failed to start dev server: '+e.message); }
    log('Dev server restart requested.');
  } catch (err) { log('Failed to restart server: ' + err.message); }
}

function handleEaddrinuse() {
  if (!shouldHandle('EADDRINUSE', 60000)) return;
  log('EADDRINUSE detected — attempting to free port 3900');
  notifyWebhook('EADDRINUSE detected', 'Attempting to free port 3900 and restart server', { snippet: getLogSnippet(1000) });
  try { execSync("ss -ltnp 2>/dev/null | grep ':3900' | sed -n \"s/.*pid=\\([0-9]*\\).*/\\1/p\" | xargs -r kill -9"); } catch(e){}
  restartServer();
}

function handleChunkLoad() {
  if (!shouldHandle('CHUNK', 30000)) return;
  log('ChunkLoadError detected — clearing .next and restarting');
  notifyWebhook('ChunkLoadError detected', 'Clearing .next and restarting server to regenerate chunks', { snippet: getLogSnippet(1000) });
  try { execSync('rm -rf .next'); } catch(e){}
  restartServer();
}

function handleNumericSeparator() {
  if (!shouldHandle('NUMSEP', 30000)) return;
  log('Numeric separator / invalid identifier error detected — trying safe fixes');
  notifyWebhook('Numeric separator error', 'Running label sanitizer and restarting server', { snippet: getLogSnippet(1000) });
  try { execSync('node scripts/replace-hardcoded-labels.js', { stdio: 'inherit' }); } catch(e) { log('replace-hardcoded-labels failed: ' + e.message); }
  restartServer();
}

function tailLogAndHandle() {
  if (!fs.existsSync(LOG)) {
    log('dev.log not found — starting server');
    restartServer();
  }
  let pos = 0;
  try { pos = fs.statSync(LOG).size; } catch(e) { pos = 0; }
  fs.watchFile(LOG, { interval: 2000 }, () => {
    try {
      const stats = fs.statSync(LOG);
      if (stats.size <= pos) return;
      const rs = fs.createReadStream(LOG, { start: Math.max(0, pos - 1024), end: stats.size });
      let buf = '';
      rs.on('data', d => buf += d.toString());
      rs.on('end', () => {
        pos = stats.size;
        if (/listen EADDRINUSE/.test(buf)) handleEaddrinuse();
        if (/ChunkLoadError/.test(buf)) handleChunkLoad();
        if (/A numeric separator is only allowed between two digits|A numeric separator is|numeric separator/.test(buf) || /Unexpected token/.test(buf)) handleNumericSeparator();
        if (/SyntaxError|Unexpected token/.test(buf) && shouldHandle('SYNTAX', 30000)) {
          log('Generic syntax error detected — will clear .next and restart');
          try { execSync('rm -rf .next'); } catch(e){}
          restartServer();
        }
      });
    } catch (err) { log('Tail watch error: ' + err.message); }
  });
  log('Started monitoring ' + LOG);
}

if (require.main === module) {
  log('auto-error-fixer starting');
  tailLogAndHandle();
} 