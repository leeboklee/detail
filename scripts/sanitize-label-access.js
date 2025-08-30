const fs = require('fs');
const path = require('path');

const root = path.join(process.cwd(), 'components');

function gatherFiles(dir) {
  const out = [];
  for (const f of fs.readdirSync(dir)) {
    const full = path.join(dir, f);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) out.push(...gatherFiles(full));
    else if (/\.(jsx|js|tsx|ts)$/.test(f)) out.push(full);
  }
  return out;
}

function isValidIdent(key) {
  // JS identifier: doesn't start with digit, no invalid chars
  return /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(key);
}

const files = gatherFiles(root);
let changedFiles = 0;
for (const file of files) {
  let s = fs.readFileSync(file, 'utf8');
  const orig = s;
  // match Labels.<key>
  s = s.replace(/Labels\.([A-Za-z0-9_가-힣\u00C0-\u017F\-\u2011\u2010]+)/g, (m, key) => {
    // if key is valid ident, keep
    if (isValidIdent(key)) return m;
    // otherwise replace with bracket access
    return `Labels["${key}"]`;
  });
  if (s !== orig) {
    fs.writeFileSync(file, s, 'utf8');
    changedFiles++;
    console.log('Patched', file);
  }
}
console.log('Done. Files changed:', changedFiles);


