const fs = require('fs');
const path = require('path');

const LABELS_PATH = path.join(process.cwd(), 'src', 'shared', 'labels.js');
const COMPONENTS_DIR = path.join(process.cwd(), 'components');

function toKey(str) {
  return str
    .replace(/\s+/g, '_')
    .replace(/[^A-Za-z0-9_가-힣]/g, '')
    .slice(0, 60)
    .toUpperCase();
}

let labels = {};
if (fs.existsSync(LABELS_PATH)) {
  const content = fs.readFileSync(LABELS_PATH, 'utf8');
  const m = content.match(/([A-Z0-9_]+):\s*'([^']+)'/g) || [];
  m.forEach(line => {
    const parts = line.split(':');
    const key = parts[0].trim();
    const val = line.match(/'([^']+)'/)[1];
    labels[val] = key;
  });
} else {
  console.error('labels.js not found');
  process.exit(1);
}

function gatherFiles(dir) {
  let out = [];
  for (const f of fs.readdirSync(dir)) {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) out = out.concat(gatherFiles(full));
    else if (/\.(jsx|js|tsx|ts)$/.test(f)) out.push(full);
  }
  return out;
}

const files = gatherFiles(COMPONENTS_DIR);
let added = {};

files.forEach(file => {
  let s = fs.readFileSync(file, 'utf8');
  let orig = s;
  // find label tags with plain text (not React expression)
  s = s.replace(/<label([^>]*)>([^<{][^<]*)<\/label>/g, (m, attrs, text) => {
    const txt = text.trim();
    if (!txt) return m;
    if (txt.startsWith('{') || txt.includes('Labels[') || txt.includes('{Labels')) return m;
    // get or create key
    let key = labels[txt];
    if (!key) {
      key = toKey(txt);
      // ensure uniqueness
      let i = 1;
      while (Object.values(labels).includes(key) || Object.values(added).includes(key)) {
        key = key + '_' + i++;
      }
      added[txt] = key;
    }
    return `<label${attrs}>{Labels.${labels[txt] || added[txt]}}</label>`;
  });

  if (s !== orig) {
    // ensure import Labels exists
    if (!/import\s+Labels\s+from\s+['\"]/.test(s)) {
      s = s.replace(/(import\s+[\s\S]*?from\s+['\"][^'\"]+['\"];?\s*)/, `$1\nimport Labels from '@/src/shared/labels';\n`);
    }
    fs.writeFileSync(file, s, 'utf8');
    console.log('Updated', file);
  }
});

if (Object.keys(added).length > 0) {
  // append to labels.js
  let content = fs.readFileSync(LABELS_PATH, 'utf8');
  let insert = '\n  // Auto-added labels for <label> texts\n';
  for (const [txt, key] of Object.entries(added)) insert += `  ${key}: '${txt}',\n`;
  content = content.replace(/\}\s*;\s*\n\s*export default Labels;/, `\n${insert}};\n\nexport default Labels;`);
  fs.writeFileSync(LABELS_PATH, content, 'utf8');
  console.log('Added', Object.keys(added).length, 'labels to', LABELS_PATH);
} else console.log('No label texts added');


