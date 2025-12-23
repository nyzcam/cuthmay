import { NextResponse } from 'next/server';
import { Guest } from '@/data/guestList';

interface ImportRequest {
  guests: Guest[];
  type: 'bulk' | 'single';
}

interface ImportResponse {
  success: boolean;
  message: string;
  addedCount?: number;
  errors?: Array<{ row: number; error: string }>;
}

// Helper function to validate guest data
function validateGuest(guest: any, index: number): { valid: boolean; error?: string } {
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
    .trim();
}

export async function POST(request: Request) {
  try {
    // Check authentication
    const authHeader = request.headers.get('authorization');
    const cookie = request.headers.get('cookie');
    
    if (!authHeader && !cookie?.includes('auth_token')) {
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

    const errors: Array<{ row: number; error: string }> = [];
    const validGuests: Array<{ slug: string; guest: Guest }> = [];

    // Validate all guests
    body.guests.forEach((guest, index) => {
      const validation = validateGuest(guest, index);
      if (!validation.valid) {
        errors.push({ row: index + 1, error: validation.error || 'Invalid guest data' });
      } else {
        const slug = generateSlug(guest.khmerName, guest.englishName);
        validGuests.push({ slug, guest });
      }
    });

    // If there are validation errors, return them
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

    // In a real implementation, you would:
    // 1. Save guests to a database
    // 2. Update the guestList.ts file
    // 3. Return confirmation

    const response: ImportResponse = {
      success: errors.length === 0,
      message: 
        body.type === 'single'
          ? `Guest "${body.guests[0].khmerName}" added successfully`
          : `Successfully imported ${validGuests.length} guest(s)`,
      addedCount: validGuests.length,
      ...(errors.length > 0 && { errors }),
    };

    return NextResponse.json(response, {
      status: errors.length === 0 ? 200 : 206, // 206 Partial Content if some failed
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
    const authHeader = request.headers.get('authorization');
    const cookie = request.headers.get('cookie');
    
    if (!authHeader && !cookie?.includes('auth_token')) {
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
    if (!file.name.endsWith('.csv')) {
      return NextResponse.json(
        { error: 'Only CSV files are supported' },
        { status: 400 }
      );
    }

    // Read and parse CSV
    const csvText = await file.text();
    const lines = csvText.split('\n').filter(line => line.trim());

    // Parse CSV header and data
    const header = lines[0].split(',').map(h => h.trim().toLowerCase());
    const guests: Guest[] = [];
    const errors: Array<{ row: number; error: string }> = [];

    for (let i = 1; i < lines.length; i++) {
      try {
        const values = lines[i].split(',').map(v => v.trim());
        const guestObj: any = {};

        header.forEach((key, idx) => {
          if (values[idx]) {
            guestObj[key] = values[idx];
          }
        });

        const validation = validateGuest(guestObj, i);
        if (!validation.valid) {
          errors.push({ row: i + 1, error: validation.error || 'Invalid guest data' });
        } else {
          guests.push(guestObj as Guest);
        }
      } catch (error) {
        errors.push({ 
          row: i + 1, 
          error: error instanceof Error ? error.message : 'Failed to parse row' 
        });
      }
    }

    return NextResponse.json({
      success: errors.length === 0,
      message: `Parsed ${guests.length} guest(s)${errors.length > 0 ? ` with ${errors.length} error(s)` : ''}`,
      guests,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error('CSV parsing error:', error);
    return NextResponse.json(
      { error: 'Failed to parse CSV file' },
      { status: 500 }
    );
  }
}
