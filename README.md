This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Guest List Management

This project includes comprehensive tools for managing wedding guest lists with CSV import/export functionality.

### CSV Format

**Import CSV Format** (for `data/guestList.csv`):
Guest data should be in CSV format with the following columns:

- `khmerName` (required): Guest name in Khmer script
- `englishName` (required): Guest name in English (used for slug generation)
- `title` (optional): Honorific title (e.g., "លោក", "អ្នកនាង")
- `relationship` (optional): Relationship type (family, immediate-family, friend, colleague, vip, other)

**Note:** Status is managed internally and not included in import CSV files.

**Exported CSV Format** (from export commands):
Exported CSV files include status and optionally invitation URLs:

- `khmerName`: Guest name in Khmer script
- `englishName`: Guest name in English
- `title`: Honorific title
- `relationship`: Relationship type
- `status`: Invitation status (pending, sent, confirmed, declined)
- `url` (optional): Invitation URL when using --base-url

**Note:** Slugs are automatically generated from the English name using URL-safe formatting.

### Importing Guests from CSV

Convert a CSV file into the TypeScript `guestList` mapping:

```bash
# Import CSV and generate TypeScript file
npm run import:csv data/new-guests.csv

# Or specify custom output file
node scripts/import-csv.js data/new-guests.csv data/custom-guestList.ts
```

**Features:**
- ✅ Proper CSV parsing with quoted fields
- ✅ Data validation (required fields, status validation)
- ✅ Slug auto-generation from English names
- ✅ TypeScript interface generation
- ✅ Progress indicators and error reporting

### Exporting Guest List

Export guest data from TypeScript to various formats:

```bash
# Export to CSV (without slugs)
npm run export:csv

# Export with invitation URLs (without slugs)
npm run export:guests

# Export to JSON format
npm run export:json

# Validate data with status statistics
npm run validate:guests
```

**CSV Export Format:**
```csv
khmerName,englishName,title,relationship,status[,url]
ចាន់ ធីដា,Chan Thida,អ្នកនាង,friend,pending[,https://example.com/invite/chan-thida]
```

**Note:** Slugs are auto-generated internally for URL creation but are not included in the exported CSV files. All exported CSV files include the status column for invitation tracking. CSV files include UTF-8 BOM for proper Unicode/Khmer text display in spreadsheet applications.

**Advanced export options:**

```bash
# Export to multiple formats
node scripts/export-from-ts.js --format both --output guests

# Custom base URL and output
node scripts/export-from-ts.js --base-url https://yourdomain.com --output custom.csv

# Skip backups
node scripts/export-from-ts.js --no-backup --output guests.csv
```

**Features:**
- ✅ Data validation and statistics
- ✅ Automatic backup creation
- ✅ Multiple output formats (CSV, JSON)
- ✅ Invitation URL generation
- ✅ Comprehensive error handling

### Processing Existing CSV Files

Enhance existing CSV files with validation and URL generation:

```bash
# Process CSV with URL generation
npm run process:guests

# Custom processing
node scripts/export-guestlist.js --input data/guests.csv --output data/processed.csv --base-url https://yourdomain.com
```

**Features:**
- ✅ CSV validation and cleaning
- ✅ Duplicate detection
- ✅ Data sanitization
- ✅ URL column addition
- ✅ Backup creation

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run import:csv <file>` | Import CSV to TypeScript |
| `npm run export:csv` | Export TypeScript to CSV |
| `npm run export:guests` | Export with invitation URLs |
| `npm run export:json` | Export to JSON format |
| `npm run validate:guests` | Validate guest data only |
| `npm run process:guests` | Process CSV with enhancements |

### Data Validation Rules

**Import Validation** (for CSV files):
- **Khmer Name**: Required, non-empty
- **English Name**: Required for slug generation, non-empty
- **Title**: Optional
- **Relationship**: Optional

**Export Validation** (for TypeScript data):
- **Khmer Name**: Required, non-empty
- **English Name**: Required for slug generation, non-empty
- **Status**: Required, valid values: pending, sent, confirmed, declined
- **Relationship**: Optional

### Error Handling

All scripts provide detailed error messages and will abort on critical issues:
- Missing required fields
- Invalid data formats
- Duplicate entries
- File access problems

Warnings are shown for non-critical issues but don't prevent processing.
