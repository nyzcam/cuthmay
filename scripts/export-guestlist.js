#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

/**
 * Enhanced Guest List CSV Processor
 * Features:
 * - Proper CSV parsing with quoted fields
 * - Data validation and cleaning
 * - URL generation for invitations
 * - Backup creation
 * - Progress indicators
 * - Multiple output options
 */

function generateSlug(englishName) {
  if (!englishName || englishName.trim() === '') {
    throw new Error('English name is required for slug generation');
  }
  return englishName
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
}

function parseCsvLine(line) {
  const cols = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i++;
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

function validateAndCleanData(rows, headers) {
  const cleanedRows = [];
  const warnings = [];
  const errors = [];

  const englishNameIndex = headers.findIndex(h => h.toLowerCase() === 'englishname');
  if (englishNameIndex === -1) {
    errors.push('Input CSV must have an `englishName` header for slug generation');
    return { cleanedRows, warnings, errors };
  }

  console.log(`🔍 Processing ${rows.length} rows...`);

  rows.forEach((row, index) => {
    const lineNumber = index + 2; // +2 because of 0-indexing and header row
    const cleanedRow = [...row];

    // Generate slug from English name
    const englishName = row[englishNameIndex]?.trim();
    if (!englishName) {
      errors.push(`Line ${lineNumber}: Missing englishName (required for slug generation)`);
      return;
    }

    try {
      const slug = generateSlug(englishName);
      // Insert slug at the beginning
      cleanedRow.unshift(slug);
    } catch (error) {
      errors.push(`Line ${lineNumber}: ${error.message}`);
      return;
    }

    // Validate status if present
    const statusIndex = headers.findIndex(h => h.toLowerCase() === 'status');
    if (statusIndex !== -1 && row[statusIndex]) {
      const status = row[statusIndex].trim();
      if (status && !['pending', 'sent', 'confirmed', 'declined'].includes(status)) {
        warnings.push(`Line ${lineNumber}: Unknown status '${status}', valid values: pending, sent, confirmed, declined`);
      }
    }

    cleanedRows.push(cleanedRow);
  });

  return { cleanedRows, warnings, errors };
}

function createBackup(filePath) {
  if (!fs.existsSync(filePath)) return null;

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = `${filePath}.backup-${timestamp}`;

  fs.copyFileSync(filePath, backupPath);
  console.log(`📦 Created backup: ${path.basename(backupPath)}`);
  return backupPath;
}

function generateUrls(rows, headers, baseUrl, slugIndex) {
  const urlHeader = 'url';
  const urlIndex = headers.length;

  // Add URL header
  headers.push(urlHeader);

  // Add URLs to each row
  rows.forEach(row => {
    const slug = row[slugIndex]?.trim();
    const url = slug ? `${baseUrl.replace(/\/$/, '')}/invite/${encodeURIComponent(slug)}` : '';
    row.push(url);
  });

  return { headers, rows };
}

function usage() {
  console.error('Usage: node scripts/export-guestlist.js [options]');
  console.error('');
  console.error('Options:');
  console.error('  --input <file>        Input CSV file (default: data/guestList.csv)');
  console.error('  --output <file>       Output CSV file (default: data/guestList_with_urls.csv)');
  console.error('  --base-url <url>      Base URL for invitation links (required for URL generation)');
  console.error('  --no-urls             Skip URL generation');
  console.error('  --no-backup           Skip creating backup of output file');
  console.error('  --validate-only       Only validate data, don\'t export');
  console.error('');
  console.error('Examples:');
  console.error('  node scripts/export-guestlist.js --base-url https://example.com');
  console.error('  node scripts/export-guestlist.js --input guests.csv --output processed.csv --base-url https://example.com');
  process.exit(1);
}

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    input: 'data/guestList.csv',
    output: 'data/guestList_with_urls.csv',
    baseUrl: '',
    noUrls: false,
    noBackup: false,
    validateOnly: false
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--input':
        options.input = args[++i];
        break;
      case '--output':
        options.output = args[++i];
        break;
      case '--base-url':
        options.baseUrl = args[++i];
        break;
      case '--no-urls':
        options.noUrls = true;
        break;
      case '--no-backup':
        options.noBackup = true;
        break;
      case '--validate-only':
        options.validateOnly = true;
        break;
      case '--help':
      case '-h':
        usage();
        break;
      default:
        console.error(`❌ Unknown option: ${args[i]}`);
        usage();
    }
  }

  return options;
}

function main() {
  const options = parseArgs();

  console.log('🚀 Starting guest list processing...');
  console.log(`📂 Input: ${options.input}`);
  console.log(`📝 Output: ${options.output}`);
  if (options.baseUrl) console.log(`🌐 Base URL: ${options.baseUrl}`);

  // Check input file
  const inPath = path.resolve(process.cwd(), options.input);
  if (!fs.existsSync(inPath)) {
    console.error('❌ Input CSV not found:', inPath);
    process.exit(1);
  }

  // Read and parse input CSV
  console.log('\n📄 Reading input CSV...');
  const raw = fs.readFileSync(inPath, 'utf8');
  const lines = raw.split(/\r?\n/).filter((l) => l.trim() !== '');

  if (lines.length === 0) {
    console.error('❌ Empty input CSV');
    process.exit(1);
  }

  const headers = parseCsvLine(lines[0]);
  console.log(`📋 Found headers: ${headers.join(', ')}`);

  const rawRows = lines.slice(1).map(line => parseCsvLine(line));

  // Validate and clean data
  console.log('\n🔍 Validating and cleaning data...');
  const { cleanedRows, warnings, errors } = validateAndCleanData(rawRows, headers);

  if (errors.length > 0) {
    console.error('\n❌ Validation Errors:');
    errors.forEach(error => console.error(`  ${error}`));
    console.error('\n❌ Processing aborted due to validation errors');
    process.exit(1);
  }

  if (warnings.length > 0) {
    console.warn('\n⚠️  Warnings:');
    warnings.forEach(warning => console.warn(`  ${warning}`));
  }

  console.log(`✅ Validated ${cleanedRows.length} guest records`);

  if (options.validateOnly) {
    console.log('\n✅ Validation completed (no export requested)');
    return;
  }

  // Add slug header at the beginning
  let finalHeaders = ['slug', ...headers];
  let finalRows = cleanedRows;

  // Generate URLs if requested (slugs are at index 0)
  if (!options.noUrls && options.baseUrl) {
    console.log('\n🔗 Generating invitation URLs...');
    const result = generateUrls(finalRows, finalHeaders, options.baseUrl, 0); // slug is at index 0
    finalHeaders = result.headers;
    finalRows = result.rows;
  } else if (!options.noUrls && !options.baseUrl) {
    console.warn('⚠️  No base URL provided, skipping URL generation');
  }

  // Remove slug column from final output (keep only for URL generation)
  finalHeaders = finalHeaders.slice(1); // Remove 'slug' from headers
  finalRows = finalRows.map(row => row.slice(1)); // Remove slug from each row

  // Create backup
  if (!options.noBackup) {
    console.log('\n📦 Creating backups...');
    const outPath = path.resolve(process.cwd(), options.output);
    createBackup(outPath);
  }

  // Write output
  console.log('\n📤 Writing output file...');
  const outputLines = [
    finalHeaders.map(csvSafe).join(','),
    ...finalRows.map(row => row.map(csvSafe).join(','))
  ];

  const outPath = path.resolve(process.cwd(), options.output);
  // Add UTF-8 BOM for proper Unicode support in CSV viewers
  const csvContent = '\ufeff' + outputLines.join('\n') + '\n';
  fs.writeFileSync(outPath, csvContent, 'utf8');

  console.log(`✅ Successfully wrote ${outputLines.length - 1} records to ${outPath}`);
  console.log('\n🎉 Processing completed successfully!');
}

if (require.main === module) {
  main();
}
