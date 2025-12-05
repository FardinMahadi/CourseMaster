import { NextResponse } from 'next/server';

import { checkDatabaseHealth } from '@/lib/db';

export async function GET() {
  try {
    const dbHealth = await checkDatabaseHealth();

    const status = dbHealth.isConnected ? 'healthy' : 'unhealthy';
    const statusCode = dbHealth.isConnected ? 200 : 503;

    return NextResponse.json(
      {
        status,
        timestamp: new Date().toISOString(),
        services: {
          database: {
            status: dbHealth.isConnected ? 'connected' : 'disconnected',
            readyState: dbHealth.readyState,
            host: dbHealth.host || 'unknown',
            database: dbHealth.database || 'unknown',
          },
        },
      },
      { status: statusCode }
    );
  } catch (error) {
    console.error('Health check error:', error);
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        services: {
          database: {
            status: 'error',
            error: error instanceof Error ? error.message : 'Unknown error',
          },
        },
      },
      { status: 503 }
    );
  }
}
