#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

function escapeString(s) {
  if (s === undefined || s === null) return '';
  return s.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$/g, '\\$').replace(/"/g, '\\"');
}

function usage() {
  console.error('Usage: node scripts/import-csv.js path/to/guests.csv');
  process.exit(1);
}

if (process.argv.length < 3) usage();

const filePath = path.resolve(process.cwd(), process.argv[2]);
if (!fs.existsSync(filePath)) {
  console.error('File not found:', filePath);
  process.exit(1);
}

const raw = fs.readFileSync(filePath, 'utf8');
const lines = raw.split(/\r?\n/).filter(Boolean);
if (lines.length === 0) {
  console.error('Empty CSV');
  process.exit(1);
}

const headers = lines[0].split(',').map(h => h.trim());
// expected headers: slug,khmerName,englishName,title,relationship,plusOnes

const rows = lines.slice(1).map(line => {
  // naive CSV split on commas; this script expects no embedded commas in fields.
  const cols = line.split(',').map(c => c.trim());
  const obj = {};
  headers.forEach((h, i) => obj[h] = cols[i] === undefined ? '' : cols[i]);
  return obj;
});

console.log('export const guestList: { [key: string]: any } = {\n');
rows.forEach(r => {
  const slug = (r.slug || '').trim();
  if (!slug) return;
  console.log(`  "${escapeString(slug)}": {`);
  if (r.khmerName) console.log(`    khmerName: "${escapeString(r.khmerName)}",`);
  if (r.englishName) console.log(`    englishName: "${escapeString(r.englishName)}",`);
  if (r.title) console.log(`    title: "${escapeString(r.title)}",`);
  if (r.relationship) console.log(`    relationship: "${escapeString(r.relationship)}",`);
  if (r.plusOnes !== undefined && r.plusOnes !== '') {
    const num = Number(r.plusOnes);
    if (!Number.isNaN(num)) console.log(`    plusOnes: ${num},`);
  }
  console.log('  },\n');
});

console.log('};');
