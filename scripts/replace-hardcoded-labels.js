const fs = require('fs');
const path = require('path');

const componentsDir = path.join(__dirname, '..', 'components');
const labelsPath = path.join(__dirname, '..', 'src', 'shared', 'labels.js');

function toKey(str) {
  return str
    .replace(/\s+/g, '_')
    .replace(/[^\w가-힣_]/g, '')
    .slice(0, 60)
    .toUpperCase();
}

function gatherFiles(dir) {
  const res = [];
  const items = fs.readdirSync(dir);
  for (const it of items) {
    const full = path.join(dir, it);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) res.push(...gatherFiles(full));
    else if (/\.jsx?$|\.js$/.test(it)) res.push(full);
  }
  return res;
}

if (!fs.existsSync(labelsPath)) {
  console.error('labels.js not found at', labelsPath);
  process.exit(1);
}

let labelsContent = fs.readFileSync(labelsPath, 'utf8');
const existing = {};
const m = labelsContent.match(/([A-Z0-9_]+):\s*'([^']+)'/g) || [];
m.forEach(line => {
  const parts = line.split(':');
  const key = parts[0].trim();
  const val = line.match(/'([^']+)'/)[1];
  existing[val] = key;
});

const files = gatherFiles(componentsDir);
const added = {};

for (const file of files) {
  let s = fs.readFileSync(file, 'utf8');
  let changed = false;

  // label="..."
  s = s.replace(/label=\"([^\"]+)\"/g, (m, p1) => {
    if (!existing[p1]) {
      const key = toKey(p1);
      if (!Object.values(existing).includes(key)) {
        // ensure uniqueness
        let k = key;
        let i = 1;
        while (Object.values(existing).includes(k) || Object.values(added).includes(k)) {
          k = key + '_' + i++;
        }
        added[p1] = k;
      } else {
        // find existing key
        for (const [val, kk] of Object.entries(existing)) if (val === p1) added[p1] = kk;
      }
    }
    const useKey = existing[p1] || added[p1];
    changed = true;
    return `label={Labels.${useKey}}`;
  });

  // placeholder="..."
  s = s.replace(/placeholder=\"([^\"]+)\"/g, (m, p1) => {
    if (!existing[p1]) {
      const key = toKey(p1 + '_PH');
      if (!Object.values(existing).includes(key)) {
        let k = key;
        let i = 1;
        while (Object.values(existing).includes(k) || Object.values(added).includes(k)) {
          k = key + '_' + i++;
        }
        added[p1] = k;
      } else {
        for (const [val, kk] of Object.entries(existing)) if (val === p1) added[p1] = kk;
      }
    }
    const useKey = existing[p1] || added[p1];
    changed = true;
    return `placeholder={Labels.${useKey}}`;
  });

  if (changed) {
    // ensure import Labels
    if (!/import\s+Labels\s+from\s+['\"]/.test(s)) {
      s = s.replace(/(import\s+[\s\S]*?from\s+['\"][^'\"]+['\"];?\s*)/, `$1\nimport Labels from '@/src/shared/labels';\n`);
    }
    fs.writeFileSync(file, s, 'utf8');
    console.log('Updated', file);
  }
}

if (Object.keys(added).length > 0) {
  // append to labels.js before export
  let toAppend = '\n// Auto-added labels\n';
  for (const [val, key] of Object.entries(added)) {
    toAppend += `  ${key}: '${val}',\n`;
  }
  labelsContent = labelsContent.replace(/}\s*;\s*\n\nexport default Labels;/, `\n${toAppend}};\n\nexport default Labels;`);
  fs.writeFileSync(labelsPath, labelsContent, 'utf8');
  console.log('Appended', Object.keys(added).length, 'labels to', labelsPath);
} else {
  console.log('No new labels to add');
}


