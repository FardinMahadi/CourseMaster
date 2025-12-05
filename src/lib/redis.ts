import { createClient, type RedisClientType } from 'redis';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

interface RedisCache {
  client: RedisClientType | null;
  promise: Promise<RedisClientType | null> | null;
  isAvailable: boolean;
}

// Use global to cache the connection across hot reloads in development
declare global {
  var redis: RedisCache | undefined;
}

let cached: RedisCache = global.redis || {
  client: null,
  promise: null,
  isAvailable: false,
};

if (!global.redis) {
  global.redis = cached;
}

// Reset cached connection
function resetConnection(): void {
  cached.client = null;
  cached.promise = null;
  cached.isAvailable = false;
  if (global.redis) {
    global.redis.client = null;
    global.redis.promise = null;
    global.redis.isAvailable = false;
  }
}

// Check if connection is ready
function isConnectionReady(client: RedisClientType | null): boolean {
  return client !== null && client.isReady;
}

async function getRedisClient(): Promise<RedisClientType | null> {
  // If we have a cached client, verify it's still ready
  if (cached.client) {
    if (isConnectionReady(cached.client)) {
      return cached.client;
    }

    // Connection is stale, reset and reconnect
    if (process.env.NODE_ENV === 'development') {
      console.log('⚠️ Redis connection stale, reconnecting...');
    }
    resetConnection();
  }

  // If we're already connecting, wait for that promise
  if (!cached.promise) {
    cached.promise = (async (): Promise<RedisClientType | null> => {
      try {
        const client = createClient({
          url: REDIS_URL,
        });

        // Set up error handlers
        client.on('error', (err: Error) => {
          console.error('❌ Redis client error:', err.message);
          resetConnection();
        });

        client.on('connect', () => {
          if (process.env.NODE_ENV === 'development') {
            console.log('🔄 Redis connecting...');
          }
        });

        client.on('ready', () => {
          if (process.env.NODE_ENV === 'development') {
            console.log('✅ Redis Connected');
          }
          cached.isAvailable = true;
        });

        client.on('reconnecting', () => {
          if (process.env.NODE_ENV === 'development') {
            console.log('🔄 Redis reconnecting...');
          }
        });

        client.on('end', () => {
          if (process.env.NODE_ENV === 'development') {
            console.log('⚠️ Redis connection ended');
          }
          resetConnection();
        });

        // Connect to Redis
        await client.connect();

        return client as RedisClientType;
      } catch (error) {
        // Reset the promise so we can retry
        resetConnection();

        // Log the error but don't throw - graceful degradation
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        if (process.env.NODE_ENV === 'development') {
          console.warn('⚠️ Redis connection failed:', errorMessage);
          console.warn('⚠️ Continuing without Redis cache (graceful degradation)');
        }

        // Return null to indicate Redis is unavailable
        return null;
      }
    })();
  }

  try {
    cached.client = await cached.promise;
    return cached.client;
  } catch (e) {
    // Ensure promise is cleared on error
    resetConnection();

    // Return null instead of throwing - graceful degradation
    if (process.env.NODE_ENV === 'development') {
      console.warn('⚠️ Redis unavailable, continuing without cache');
    }

    return null;
  }
}

// Health check function to verify Redis connection
export async function checkRedisHealth(): Promise<{
  isAvailable: boolean;
  isReady: boolean;
  url?: string;
}> {
  try {
    const client = await getRedisClient();
    return {
      isAvailable: client !== null,
      isReady: isConnectionReady(client),
      url: REDIS_URL.replace(/\/\/[^:]+:[^@]+@/, '//***:***@'), // Hide credentials
    };
  } catch {
    return {
      isAvailable: false,
      isReady: false,
    };
  }
}

// Graceful shutdown function
export async function disconnectRedis(): Promise<void> {
  if (cached.client) {
    try {
      await cached.client.quit();
      if (process.env.NODE_ENV === 'development') {
        console.log('🔌 Redis disconnected gracefully');
      }
    } catch (error) {
      // Force disconnect if quit fails
      await cached.client.disconnect();
      if (process.env.NODE_ENV === 'development') {
        console.warn('⚠️ Redis force disconnected');
      }
    }
    resetConnection();
  }
}

export default getRedisClient;
