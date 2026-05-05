import { NextResponse } from 'next/server';
import { Guest } from '@/data/guestList';
import { writeFile, readFile } from 'fs/promises';
import { join } from 'path';

const MAX_CSV_SIZE_BYTES = 2 * 1024 * 1024;
const MAX_CSV_ROWS = 2000;
const MAX_JSON_GUESTS = 500;

interface ImportRequest {
  guests: Guest[];
  type: 'bulk' | 'single';
}

interface ImportResponse {
  success: boolean;
  message: string;
  addedCount?: number;
  skippedCount?: number;
  parsedCount?: number;
  errors?: Array<{ row: number; error: string }>;
}

// Helper function to validate guest data
function validateGuest(guest: Partial<Guest>): { valid: boolean; error?: string } {
  if (!guest.khmerName || typeof guest.khmerName !== 'string') {
    return { valid: false, error: 'Khmer name is required' };
  }
  if (guest.khmerName.trim().length === 0) {
    return { valid: false, error: 'Khmer name cannot be empty' };
  }
  return { valid: true };
}

// Helper function to generate slug from name
function generateSlug(khmerName: string, englishName?: string): string {
  const name = (englishName || khmerName).toLowerCase();
  return name
    .replace(/\s+/g, '-')
    .replace(/[^\w-]/g, '')
    .replace(/-+/g, '-')
    .trim()
    .replace(/^-+|-+$/g, '');
}

function ensureSlug(guest: Guest, index: number): string {
  const slug = generateSlug(guest.khmerName, guest.englishName);
  if (slug) return slug;

  // Khmer-only names can produce empty ASCII slugs; keep deterministic fallback.
  return `guest-${Date.now()}-${index}`;
}

function escapeTsString(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\r?\n/g, ' ')
    .trim();
}

function isAuthenticatedRequest(request: Request): boolean {
  const authHeader = request.headers.get('authorization');
  const cookie = request.headers.get('cookie');
  return Boolean(authHeader || cookie?.includes('auth_token='));
}

// Helper function to persist guests to guestList.ts
async function persistGuestsToFile(newGuests: Array<{ slug: string; guest: Guest }>) {
  try {
    if (newGuests.length === 0) {
      return { addedCount: 0, skippedCount: 0 };
    }

    const guestListPath = join(process.cwd(), 'data', 'guestList.ts');

    // Read the existing file
    let fileContent = await readFile(guestListPath, 'utf-8');

    const existingSlugs = new Set<string>();
    const slugRegex = /"([^"]+)":\s*\{/g;
    let match: RegExpExecArray | null = null;
    while ((match = slugRegex.exec(fileContent)) !== null) {
      existingSlugs.add(match[1]);
    }

    const uniqueNewGuests = new Map<string, Guest>();
    for (const { slug, guest } of newGuests) {
      if (!existingSlugs.has(slug) && !uniqueNewGuests.has(slug)) {
        uniqueNewGuests.set(slug, guest);
      }
    }

    if (uniqueNewGuests.size === 0) {
      return { addedCount: 0, skippedCount: newGuests.length };
    }

    // Generate new guest entries
    const newEntries = Array.from(uniqueNewGuests.entries())
      .map(([slug, guest]) => {
        const entry = `  "${escapeTsString(slug)}": {
    khmerName: "${escapeTsString(guest.khmerName)}",${
      guest.englishName ? `\n    englishName: "${escapeTsString(guest.englishName)}",` : ''
    }${
      guest.title ? `\n    title: "${escapeTsString(guest.title)}",` : ''
    }${
      guest.relationship ? `\n    relationship: "${escapeTsString(guest.relationship)}",` : ''
    }
  },`;
        return entry;
      })
      .join('\n');

    // Find the position to insert new guests (after the opening of guestList)
    const insertPosition = fileContent.indexOf('export const guestList: Record<string, Guest> = {') + 
                          'export const guestList: Record<string, Guest> = {'.length;

    if (insertPosition <= 0) {
      throw new Error('Failed to locate guestList declaration in data/guestList.ts');
    }
    
    // Insert new guests
    fileContent = fileContent.slice(0, insertPosition) + '\n\n' + newEntries + fileContent.slice(insertPosition);

    // Write back to file
    await writeFile(guestListPath, fileContent, 'utf-8');

    return {
      addedCount: uniqueNewGuests.size,
      skippedCount: newGuests.length - uniqueNewGuests.size,
    };
  } catch (error) {
    console.error('Error persisting guests to file:', error);
    return { addedCount: 0, skippedCount: newGuests.length };
  }
}

function parseGuestsFromCsv(csvText: string) {
  const lines = csvText.split(/\r?\n/).filter((line) => line.trim());
  if (lines.length < 2) {
    return {
      guests: [] as Array<{ slug: string; guest: Guest }>,
      errors: [{ row: 1, error: 'CSV must include a header and at least one row' }],
      parsedCount: 0,
    };
  }

  if (lines.length - 1 > MAX_CSV_ROWS) {
    return {
      guests: [] as Array<{ slug: string; guest: Guest }>,
      errors: [{ row: 1, error: `CSV exceeds max rows (${MAX_CSV_ROWS})` }],
      parsedCount: 0,
    };
  }

  const header = lines[0].split(',').map((h) => h.trim().toLowerCase());
  const guests: Array<{ slug: string; guest: Guest }> = [];
  const errors: Array<{ row: number; error: string }> = [];

  for (let i = 1; i < lines.length; i++) {
    try {
      const values = lines[i].split(',').map((v) => v.trim());
      const guestObj: Partial<Guest> = {};

      for (let idx = 0; idx < header.length; idx++) {
        const key = header[idx];
        const value = values[idx];
        if (!value) continue;

        if (key === 'khmername') guestObj.khmerName = value;
        if (key === 'englishname') guestObj.englishName = value;
        if (key === 'title') guestObj.title = value;
        if (key === 'relationship') guestObj.relationship = value;
        if (key === 'status') guestObj.status = value as Guest['status'];
      }

      const validation = validateGuest(guestObj);
      if (!validation.valid) {
        errors.push({ row: i + 1, error: validation.error || 'Invalid guest data' });
        continue;
      }

      const guest = guestObj as Guest;
      guests.push({ slug: ensureSlug(guest, i), guest });
    } catch (error) {
      errors.push({
        row: i + 1,
        error: error instanceof Error ? error.message : 'Failed to parse row',
      });
    }
  }

  return {
    guests,
    errors,
    parsedCount: lines.length - 1,
  };
}

export async function POST(request: Request) {
  try {
    if (!isAuthenticatedRequest(request)) {
      return NextResponse.json(
        { error: 'Unauthorized: Please log in first' },
        { status: 401 }
      );
    }

    const body: ImportRequest = await request.json();

    if (!body.guests || !Array.isArray(body.guests)) {
      return NextResponse.json(
        { error: 'Invalid request: guests array is required' },
        { status: 400 }
      );
    }

    if (body.guests.length === 0) {
      return NextResponse.json(
        { error: 'No guests provided' },
        { status: 400 }
      );
    }

    if (body.guests.length > MAX_JSON_GUESTS) {
      return NextResponse.json(
        { error: `Too many guests in one request (max ${MAX_JSON_GUESTS})` },
        { status: 400 }
      );
    }

    const errors: Array<{ row: number; error: string }> = [];
    const validGuests: Array<{ slug: string; guest: Guest }> = [];

    body.guests.forEach((guest, index) => {
      const validation = validateGuest(guest);
      if (!validation.valid) {
        errors.push({ row: index + 1, error: validation.error || 'Invalid guest data' });
      } else {
        const slug = ensureSlug(guest, index + 1);
        validGuests.push({ slug, guest });
      }
    });

    if (errors.length > 0 && body.type === 'single') {
      return NextResponse.json(
        { 
          success: false, 
          message: `Validation failed for ${errors.length} guest(s)`,
          errors 
        },
        { status: 400 }
      );
    }

    const { addedCount, skippedCount } = await persistGuestsToFile(validGuests);

    const response: ImportResponse = {
      success: errors.length === 0,
      message: 
        body.type === 'single'
          ? (addedCount > 0
              ? `Guest "${body.guests[0].khmerName}" added successfully`
              : `Guest "${body.guests[0].khmerName}" already exists`)
          : `Successfully imported ${addedCount} guest(s)`,
      addedCount,
      skippedCount,
      ...(errors.length > 0 && { errors }),
    };

    return NextResponse.json(response, {
      status: errors.length === 0 ? 200 : 206,
      headers: {
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('Import error:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to import guests' 
      },
      { status: 500 }
    );
  }
}

// Handle CSV file upload
export async function PUT(request: Request) {
  try {
    if (!isAuthenticatedRequest(request)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.name.toLowerCase().endsWith('.csv')) {
      return NextResponse.json(
        { error: 'Only CSV files are supported' },
        { status: 400 }
      );
    }

    if (file.size > MAX_CSV_SIZE_BYTES) {
      return NextResponse.json(
        { error: `CSV is too large (max ${MAX_CSV_SIZE_BYTES / (1024 * 1024)}MB)` },
        { status: 400 }
      );
    }

    const csvText = await file.text();
    const { guests, errors, parsedCount } = parseGuestsFromCsv(csvText);

    if (guests.length === 0 && errors.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'Failed to parse CSV rows',
          parsedCount,
          errors,
        },
        { status: 400, headers: { 'Cache-Control': 'no-store' } }
      );
    }

    const { addedCount, skippedCount } = await persistGuestsToFile(guests);

    return NextResponse.json({
      success: errors.length === 0,
      message: `Imported ${addedCount} guest(s)${
        skippedCount > 0 ? `, skipped ${skippedCount} duplicate(s)` : ''
      }${errors.length > 0 ? ` with ${errors.length} error(s)` : ''}`,
      addedCount,
      skippedCount,
      parsedCount,
      errors: errors.length > 0 ? errors : undefined,
    }, {
      status: errors.length === 0 ? 200 : 206,
      headers: {
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('CSV parsing error:', error);
    return NextResponse.json(
      { error: 'Failed to parse CSV file' },
      { status: 500 }
    );
  }
}
