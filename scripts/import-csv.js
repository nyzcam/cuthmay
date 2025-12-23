#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

/**
 * Improved CSV Import Script for Guest List
 * Features:
 * - Proper CSV parsing with quoted fields
 * - Data validation
 * - Duplicate checking
 * - TypeScript interface generation
 * - Error handling and reporting
 * - Progress indicators
 */

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

function validateGuestData(guest, lineNumber) {
  const errors = [];
  const warnings = [];

  // Required fields
  if (!guest.khmerName || guest.khmerName.trim() === '') {
    errors.push(`Line ${lineNumber}: Missing required field 'khmerName'`);
  }

  if (!guest.englishName || guest.englishName.trim() === '') {
    errors.push(`Line ${lineNumber}: Missing required field 'englishName' (needed for slug generation)`);
  }

  // Status validation
  if (guest.status && !['pending', 'sent', 'confirmed', 'declined'].includes(guest.status)) {
    warnings.push(`Line ${lineNumber}: Unknown status '${guest.status}'. Valid values: pending, sent, confirmed, declined`);
  }

  // Valid relationship values
  const validRelationships = ['family', 'immediate-family', 'friend', 'colleague', 'vip', 'other'];
  if (guest.relationship && !validRelationships.includes(guest.relationship)) {
    warnings.push(`Line ${lineNumber}: Unknown relationship '${guest.relationship}'. Consider using: ${validRelationships.join(', ')}`);
  }

  return { errors, warnings };
}

function escapeString(s) {
  if (s === undefined || s === null || s === '') return '';
  return s.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$/g, '\\$').replace(/"/g, '\\"');
}

function generateTypeScript(guests, outputPath) {
  const output = [];

  // Add interface and imports
  output.push('export interface Guest {');
  output.push('  khmerName: string;');
  output.push('  englishName?: string;');
  output.push('  title?: string;');
  output.push('  relationship?: string;');
  output.push('  status?: \'pending\' | \'sent\' | \'confirmed\' | \'declined\';');
  output.push('}');
  output.push('');
  output.push('export const guestList: Record<string, Guest> = {');
  output.push('');

  // Sort guests by slug for consistent output
  const sortedSlugs = Object.keys(guests).sort();

  sortedSlugs.forEach(slug => {
    const guest = guests[slug];
    output.push(`  "${escapeString(slug)}": {`);
    output.push(`    khmerName: "${escapeString(guest.khmerName)}",`);
    if (guest.englishName) output.push(`    englishName: "${escapeString(guest.englishName)}",`);
    if (guest.title) output.push(`    title: "${escapeString(guest.title)}",`);
    if (guest.relationship) output.push(`    relationship: "${escapeString(guest.relationship)}",`);
    if (guest.status) output.push(`    status: "${escapeString(guest.status)}",`);
    output.push('  },');
    output.push('');
  });

  output.push('};');
  output.push('');

  fs.writeFileSync(outputPath, output.join('\n'), 'utf8');
  console.log(`✓ Generated TypeScript file: ${outputPath}`);
}

function usage() {
  console.error('Usage: node scripts/import-csv.js <input.csv> [output.ts]');
  console.error('');
  console.error('Arguments:');
  console.error('  input.csv    Path to CSV file to import');
  console.error('  output.ts    Output TypeScript file (default: data/guestList.ts)');
  console.error('');
  console.error('CSV Format:');
  console.error('  slug,khmerName,englishName,title,relationship,plusOnes');
  console.error('  Required: slug, khmerName');
  console.error('  Optional: englishName, title, relationship, plusOnes');
  process.exit(1);
}

function main() {
  if (process.argv.length < 3) usage();

  const inputPath = path.resolve(process.cwd(), process.argv[2]);
  const outputPath = process.argv[3] ? path.resolve(process.cwd(), process.argv[3]) : path.resolve(process.cwd(), 'data/guestList.ts');

  // Check input file
  if (!fs.existsSync(inputPath)) {
    console.error('❌ Input file not found:', inputPath);
    process.exit(1);
  }

  console.log(`📄 Reading CSV file: ${inputPath}`);

  const raw = fs.readFileSync(inputPath, 'utf8');
  const lines = raw.split(/\r?\n/).filter(line => line.trim() !== '');

  if (lines.length === 0) {
    console.error('❌ Empty CSV file');
    process.exit(1);
  }

  // Parse headers
  const headers = parseCsvLine(lines[0]);
  console.log(`📋 Found headers: ${headers.join(', ')}`);

  // Validate required headers
  const requiredHeaders = ['khmerName', 'englishName'];
  const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
  if (missingHeaders.length > 0) {
    console.error(`❌ Missing required headers: ${missingHeaders.join(', ')}`);
    process.exit(1);
  }

  // Parse and validate data
  const guests = {};
  const allErrors = [];
  const allWarnings = [];
  const slugCollisions = [];

  console.log(`\n🔍 Processing ${lines.length - 1} guest records...`);

  for (let i = 1; i < lines.length; i++) {
    const cols = parseCsvLine(lines[i]);
    if (cols.length === 0) continue;

    const guest = {};
    headers.forEach((header, index) => {
      guest[header] = cols[index] || '';
    });

    // Generate slug from English name
    try {
      const generatedSlug = generateSlug(guest.englishName);
      guest.slug = generatedSlug;
    } catch (error) {
      allErrors.push(`Line ${i + 1}: ${error.message}`);
      continue;
    }

    // Validate data
    const { errors, warnings } = validateGuestData(guest, i + 1);
    allErrors.push(...errors);
    allWarnings.push(...warnings);

    // Check for slug collisions
    if (guests[guest.slug]) {
      slugCollisions.push(`Line ${i + 1}: Slug collision '${guest.slug}' (generated from '${guest.englishName}')`);
    } else {
      guests[guest.slug] = guest;
    }
  }

  // Report issues
  if (allErrors.length > 0) {
    console.error('\n❌ Validation Errors:');
    allErrors.forEach(error => console.error(`  ${error}`));
    console.error('\n❌ Import aborted due to validation errors');
    process.exit(1);
  }

  if (slugCollisions.length > 0) {
    console.error('\n❌ Slug Collisions:');
    slugCollisions.forEach(collision => console.error(`  ${collision}`));
    console.error('\n❌ Import aborted due to slug collisions');
    process.exit(1);
  }

  if (allWarnings.length > 0) {
    console.warn('\n⚠️  Warnings:');
    allWarnings.forEach(warning => console.warn(`  ${warning}`));
  }

  // Generate TypeScript
  console.log(`\n📝 Generating TypeScript for ${Object.keys(guests).length} guests...`);
  generateTypeScript(guests, outputPath);

  console.log('\n✅ Import completed successfully!');
  console.log(`   Processed: ${Object.keys(guests).length} guests`);
  if (allWarnings.length > 0) {
    console.log(`   Warnings: ${allWarnings.length}`);
  }
}

if (require.main === module) {
  main();
}
