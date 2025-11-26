#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

function usage() {
  console.error('Usage: node scripts/export-guestlist.js [inputCsv] [baseUrl] [outputCsv]');
  console.error('Defaults: inputCsv=data/guestList.csv baseUrl=http://localhost:3000 outputCsv=data/guestList_with_urls.csv');
  process.exit(1);
}

const input = process.argv[2] || 'data/guestList.csv';
const baseUrl = process.argv[3] || 'http://localhost:3000';
const output = process.argv[4] || 'data/guestList_with_urls.csv';

const inPath = path.resolve(process.cwd(), input);
if (!fs.existsSync(inPath)) {
  console.error('Input CSV not found:', inPath);
  usage();
}

const raw = fs.readFileSync(inPath, 'utf8');
const lines = raw.split(/\r?\n/).filter((l) => l.trim() !== '');
if (lines.length === 0) {
  console.error('Empty input CSV');
  process.exit(1);
}

// Robust CSV line parse (handles quoted fields with commas)
function parseCsvLine(line) {
  const cols = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i+1] === '"') {
        cur += '"';
        i++; // skip escaped quote
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }
    if (ch === ',' && !inQuotes) {
      cols.push(cur);
      cur = '';
      continue;
    }
    cur += ch;
  }
  cols.push(cur);
  return cols.map(c => c.trim());
}

function csvSafe(val) {
  if (val === undefined || val === null) return '';
  const s = String(val);
  if (s.includes(',') || s.includes('"') || s.includes('\n') || s.includes('\r')) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

const headers = parseCsvLine(lines[0]);
const slugIndex = headers.findIndex(h => h.toLowerCase() === 'slug');
if (slugIndex === -1) {
  console.error('Input CSV must have a `slug` header');
  process.exit(1);
}

const outHeaders = headers.concat(['url']);
const outRows = [outHeaders.map(csvSafe).join(',')];

for (let i = 1; i < lines.length; i++) {
  const cols = parseCsvLine(lines[i]);
  const slug = (cols[slugIndex] || '').trim();
  const url = slug ? `${baseUrl.replace(/\/$/, '')}/invite/${encodeURIComponent(slug)}` : '';
  const row = cols.concat([url]);
  outRows.push(row.map(csvSafe).join(','));
}

const outPath = path.resolve(process.cwd(), output);
fs.writeFileSync(outPath, outRows.join('\n') + '\n', 'utf8');
console.log('Wrote', outPath);
