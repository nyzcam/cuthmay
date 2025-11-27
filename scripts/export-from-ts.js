#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const vm = require('vm');

function usage() {
  console.error('Usage: node scripts/export-from-ts.js [baseUrl] [outputCsv]');
  console.error('Defaults: baseUrl= (no url column) outputCsv=data/guestList.csv');
  process.exit(1);
}

const baseUrlArg = process.argv[2];
const outputArg = process.argv[3] || 'data/guestList.csv';
const baseUrl = baseUrlArg || '';

const tsPath = path.resolve(process.cwd(), 'data/guestList.ts');
if (!fs.existsSync(tsPath)) {
  console.error('TypeScript guest list not found at', tsPath);
  process.exit(1);
}

const raw = fs.readFileSync(tsPath, 'utf8');

const marker = 'export const guestList';
const idx = raw.indexOf(marker);
if (idx === -1) {
  console.error('Could not find "export const guestList" in', tsPath);
  process.exit(1);
}

const eqIdx = raw.indexOf('=', idx);
if (eqIdx === -1) {
  console.error('Could not find "=" after guestList declaration');
  process.exit(1);
}

let i = raw.indexOf('{', eqIdx);
if (i === -1) {
  console.error('Could not find opening "{" for guestList object');
  process.exit(1);
}

let depth = 0;
let start = i;
let end = -1;
for (; i < raw.length; i++) {
  const ch = raw[i];
  if (ch === '{') depth++;
  else if (ch === '}') {
    depth--;
    if (depth === 0) {
      end = i;
      break;
    }
  }
}

if (end === -1) {
  console.error('Could not find matching closing brace for guestList object');
  process.exit(1);
}

const objectLiteral = raw.slice(start, end + 1);

let guestListObj;
try {
  const scriptText = '(function(){ return ' + objectLiteral + '; })()';
  guestListObj = vm.runInNewContext(scriptText, {}, { timeout: 1000 });
} catch (err) {
  console.error('Failed to evaluate guestList object from TypeScript file:', err.message);
  process.exit(1);
}

if (!guestListObj || typeof guestListObj !== 'object') {
  console.error('Parsed guestList is not an object');
  process.exit(1);
}

function csvSafe(val) {
  if (val === undefined || val === null) return '';
  const s = String(val);
  if (s.includes(',') || s.includes('"') || s.includes('\n') || s.includes('\r')) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

const headers = ['slug', 'khmerName', 'englishName', 'title', 'relationship', 'plusOnes'];
if (baseUrl) headers.push('url');

const rows = [];
rows.push(headers.join(','));

const slugs = Object.keys(guestListObj).sort();
for (const slug of slugs) {
  const g = guestListObj[slug] || {};
  const khmerName = g.khmerName || '';
  const englishName = g.englishName || '';
  const title = g.title || '';
  const relationship = g.relationship || '';
  const plusOnes = (g.plusOnes === undefined || g.plusOnes === null) ? '' : String(g.plusOnes);
  const cols = [slug, khmerName, englishName, title, relationship, plusOnes].map(csvSafe);
  if (baseUrl) {
    const url = slug ? (baseUrl.replace(/\/$/, '') + '/invite/' + encodeURIComponent(slug)) : '';
    cols.push(csvSafe(url));
  }
  rows.push(cols.join(','));
}

const outPath = path.resolve(process.cwd(), outputArg);
fs.writeFileSync(outPath, rows.join('\n') + '\n', 'utf8');
console.log('Wrote', outPath);
