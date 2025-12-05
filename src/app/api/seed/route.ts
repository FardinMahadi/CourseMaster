import { NextRequest, NextResponse } from 'next/server';

import { seedDatabase } from '@/lib/seed';

// POST /api/seed - Seed database with dummy data (development only)
export async function POST(request: NextRequest) {
  // Only allow seeding in development mode
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Seeding is only allowed in development mode' },
      { status: 403 }
    );
  }

  try {
    console.log('🌱 Starting database seeding...');
    const result = await seedDatabase();

    return NextResponse.json(
      {
        message: 'Database seeded successfully',
        data: result,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('❌ Seeding error:', error);
    return NextResponse.json(
      {
        error: 'Failed to seed database',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
