#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const vm = require('vm');

/**
 * Improved Export Script for Guest List
 * Features:
 * - Better error handling
 * - Data validation
 * - Backup creation
 * - Progress indicators
 * - Multiple output formats
 * - Statistics reporting
 */

function validateGuestData(guests) {
  const errors = [];
  const warnings = [];
  const stats = {
    total: Object.keys(guests).length,
    withEnglishName: 0,
    withTitle: 0,
    withRelationship: 0,
    withStatus: 0,
    statusCounts: { pending: 0, sent: 0, confirmed: 0, declined: 0 }
  };

  Object.entries(guests).forEach(([slug, guest]) => {
    // Required fields
    if (!guest.khmerName || guest.khmerName.trim() === '') {
      errors.push(`Guest '${slug}': Missing required field 'khmerName'`);
    }

    // Optional field checks
    if (guest.englishName && guest.englishName.trim() !== '') {
      stats.withEnglishName++;
    }

    if (guest.title && guest.title.trim() !== '') {
      stats.withTitle++;
    }

    if (guest.relationship && guest.relationship.trim() !== '') {
      stats.withRelationship++;
    }

    if (guest.status) {
      stats.withStatus++;
      if (stats.statusCounts[guest.status] !== undefined) {
        stats.statusCounts[guest.status]++;
      } else {
        warnings.push(`Guest '${slug}': Unknown status '${guest.status}'`);
      }
    }
  });

  return { errors, warnings, stats };
}

function csvSafe(val) {
  if (val === undefined || val === null) return '';
  const s = String(val);
  if (s.includes(',') || s.includes('"') || s.includes('\n') || s.includes('\r')) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

function createBackup(filePath) {
  if (!fs.existsSync(filePath)) return null;

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = `${filePath}.backup-${timestamp}`;

  fs.copyFileSync(filePath, backupPath);
  console.log(`📦 Created backup: ${path.basename(backupPath)}`);
  return backupPath;
}

function exportToCsv(guests, outputPath, baseUrl = '') {
  const headers = ['khmerName', 'englishName', 'title', 'relationship', 'status'];
  if (baseUrl) headers.push('url');

  const rows = [];
  rows.push(headers.join(','));

  const slugs = Object.keys(guests).sort();
  for (const slug of slugs) {
    const g = guests[slug] || {};
    const khmerName = g.khmerName || '';
    const englishName = g.englishName || '';
    const title = g.title || '';
    const relationship = g.relationship || '';
    const status = g.status || '';
    const cols = [khmerName, englishName, title, relationship, status].map(csvSafe);

    if (baseUrl) {
      const url = slug ? (baseUrl.replace(/\/$/, '') + '/invite/' + encodeURIComponent(slug)) : '';
      cols.push(csvSafe(url));
    }
    rows.push(cols.join(','));
  }

  // Add UTF-8 BOM for proper Unicode support in CSV viewers
  const csvContent = '\ufeff' + rows.join('\n') + '\n';
  fs.writeFileSync(outputPath, csvContent, 'utf8');
  console.log(`✅ Exported CSV: ${outputPath} (${rows.length - 1} records)`);
}

function exportToJson(guests, outputPath) {
  const data = {
    exportedAt: new Date().toISOString(),
    totalGuests: Object.keys(guests).length,
    guests: guests
  };

  fs.writeFileSync(outputPath, JSON.stringify(data, null, 2), 'utf8');
  console.log(`✅ Exported JSON: ${outputPath}`);
}

function usage() {
  console.error('Usage: node scripts/export-from-ts.js [options]');
  console.error('');
  console.error('Options:');
  console.error('  --input <file>        Input TypeScript file (default: data/guestList.ts)');
  console.error('  --output <file>       Output CSV file (default: data/guestList_exported.csv)');
  console.error('  --base-url <url>      Base URL for invitation links');
  console.error('  --format <format>     Output format: csv, json, or both (default: csv)');
  console.error('  --no-backup           Skip creating backup of existing files');
  console.error('  --validate-only       Only validate data, don\'t export');
  console.error('');
  console.error('Examples:');
  console.error('  node scripts/export-from-ts.js');
  console.error('  node scripts/export-from-ts.js --base-url https://example.com --output guests.csv');
  console.error('  node scripts/export-from-ts.js --format both --output guests');
  process.exit(1);
}

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    input: 'data/guestList.ts',
    output: 'data/guestList_exported.csv',
    baseUrl: '',
    format: 'csv',
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
      case '--format':
        options.format = args[++i];
        if (!['csv', 'json', 'both'].includes(options.format)) {
          console.error(`❌ Invalid format: ${options.format}. Use csv, json, or both`);
          process.exit(1);
        }
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

function loadGuestList(tsPath) {
  if (!fs.existsSync(tsPath)) {
    console.error('❌ TypeScript guest list not found at', tsPath);
    process.exit(1);
  }

  const raw = fs.readFileSync(tsPath, 'utf8');

  const marker = 'export const guestList';
  const idx = raw.indexOf(marker);
  if (idx === -1) {
    console.error('❌ Could not find "export const guestList" in', tsPath);
    process.exit(1);
  }

  const eqIdx = raw.indexOf('=', idx);
  if (eqIdx === -1) {
    console.error('❌ Could not find "=" after guestList declaration');
    process.exit(1);
  }

  let i = raw.indexOf('{', eqIdx);
  if (i === -1) {
    console.error('❌ Could not find opening "{" for guestList object');
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
    console.error('❌ Could not find matching closing brace for guestList object');
    process.exit(1);
  }

  const objectLiteral = raw.slice(start, end + 1);

  let guestListObj;
  try {
    const scriptText = '(function(){ return ' + objectLiteral + '; })()';
    guestListObj = vm.runInNewContext(scriptText, {}, { timeout: 1000 });
  } catch (err) {
    console.error('❌ Failed to evaluate guestList object from TypeScript file:', err.message);
    process.exit(1);
  }

  if (!guestListObj || typeof guestListObj !== 'object') {
    console.error('❌ Parsed guestList is not an object');
    process.exit(1);
  }

  return guestListObj;
}

function main() {
  const options = parseArgs();

  console.log('🚀 Starting guest list export...');
  console.log(`📂 Input: ${options.input}`);
  console.log(`📝 Format: ${options.format}`);
  if (options.baseUrl) console.log(`🌐 Base URL: ${options.baseUrl}`);

  // Load and parse guest list
  const tsPath = path.resolve(process.cwd(), options.input);
  const guests = loadGuestList(tsPath);

  // Validate data
  console.log('\n🔍 Validating guest data...');
  const { errors, warnings, stats } = validateGuestData(guests);

  if (errors.length > 0) {
    console.error('\n❌ Validation Errors:');
    errors.forEach(error => console.error(`  ${error}`));
    console.error('\n❌ Export aborted due to validation errors');
    process.exit(1);
  }

  if (warnings.length > 0) {
    console.warn('\n⚠️  Warnings:');
    warnings.forEach(warning => console.warn(`  ${warning}`));
  }

  // Show statistics
  console.log('\n📊 Statistics:');
  console.log(`   Total guests: ${stats.total}`);
  console.log(`   With English names: ${stats.withEnglishName}`);
  console.log(`   With titles: ${stats.withTitle}`);
  console.log(`   With relationships: ${stats.withRelationship}`);
  console.log(`   With status: ${stats.withStatus}`);
  console.log(`   Status breakdown:`);
  console.log(`     - Pending: ${stats.statusCounts.pending}`);
  console.log(`     - Sent: ${stats.statusCounts.sent}`);
  console.log(`     - Confirmed: ${stats.statusCounts.confirmed}`);
  console.log(`     - Declined: ${stats.statusCounts.declined}`);

  if (options.validateOnly) {
    console.log('\n✅ Validation completed (no export requested)');
    return;
  }

  // Create backups
  if (!options.noBackup) {
    console.log('\n📦 Creating backups...');
    if (options.format === 'csv' || options.format === 'both') {
      const csvPath = path.resolve(process.cwd(), options.output);
      createBackup(csvPath);
    }
    if (options.format === 'json' || options.format === 'both') {
      const jsonPath = path.resolve(process.cwd(), options.output.replace(/\.csv$/, '.json'));
      createBackup(jsonPath);
    }
  }

  // Export files
  console.log('\n📤 Exporting files...');

  if (options.format === 'csv' || options.format === 'both') {
    const csvPath = path.resolve(process.cwd(), options.output);
    exportToCsv(guests, csvPath, options.baseUrl);
  }

  if (options.format === 'json' || options.format === 'both') {
    const jsonOutput = options.output.replace(/\.csv$/, '.json');
    const jsonPath = path.resolve(process.cwd(), jsonOutput);
    exportToJson(guests, jsonPath);
  }

  console.log('\n🎉 Export completed successfully!');
}

if (require.main === module) {
  main();
}
