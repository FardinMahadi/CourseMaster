import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// Use global to cache the connection across hot reloads in development
declare global {
  var mongoose: MongooseCache | undefined;
}

let cached: MongooseCache = global.mongoose || { conn: null, promise: null };

if (!global.mongoose) {
  global.mongoose = cached;
}

// Custom error class for database connection errors
export class DatabaseConnectionError extends Error {
  public readonly isConnectionError = true;
  public readonly originalError?: Error;

  constructor(message: string, originalError?: Error) {
    super(message);
    this.name = 'DatabaseConnectionError';
    this.originalError = originalError;
  }
}

// Check if an error is a database connection error
export function isDatabaseConnectionError(error: unknown): error is DatabaseConnectionError {
  return (
    error instanceof DatabaseConnectionError ||
    (error instanceof Error &&
      (error.name === 'MongoNetworkError' ||
        error.name === 'MongoServerSelectionError' ||
        error.name === 'MongoTimeoutError' ||
        error.message.includes('ECONNREFUSED') ||
        error.message.includes('ETIMEDOUT') ||
        error.message.includes('ENOTFOUND') ||
        error.message.includes('getaddrinfo') ||
        error.message.includes('connect ECONNRESET') ||
        error.message.includes('connection timed out') ||
        error.message.includes('failed to connect')))
  );
}

// Connection state constants
const CONNECTION_STATES = {
  disconnected: 0,
  connected: 1,
  connecting: 2,
  disconnecting: 3,
} as const;

// Check if connection is alive and ready
function isConnectionAlive(): boolean {
  return mongoose.connection.readyState === CONNECTION_STATES.connected;
}

// Reset cached connection
function resetConnection(): void {
  cached.conn = null;
  cached.promise = null;
  if (global.mongoose) {
    global.mongoose.conn = null;
    global.mongoose.promise = null;
  }
}

// Connection options with timeouts
const connectionOptions: mongoose.ConnectOptions = {
  bufferCommands: false,
  serverSelectionTimeoutMS: 10000, // 10 seconds to select a server
  socketTimeoutMS: 45000, // 45 seconds for socket operations
  maxPoolSize: 10,
  minPoolSize: 1,
};

async function connectDB(): Promise<typeof mongoose> {
  // If we have a cached connection, verify it's still alive
  if (cached.conn) {
    if (isConnectionAlive()) {
      return cached.conn;
    }

    // Connection is stale, reset and reconnect
    if (process.env.NODE_ENV === 'development') {
      console.log('⚠️ MongoDB connection stale, reconnecting...');
    }
    resetConnection();
  }

  // If we're already connecting, wait for that promise
  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI!, connectionOptions)
      .then(mongooseInstance => {
        // Log connection info for debugging
        if (process.env.NODE_ENV === 'development') {
          console.log('✅ MongoDB Connected');
          console.log('📊 Database:', mongooseInstance.connection.db?.databaseName || 'unknown');
          console.log('🔗 Host:', mongooseInstance.connection.host);
        }

        // Set up connection event listeners
        mongooseInstance.connection.on('disconnected', () => {
          if (process.env.NODE_ENV === 'development') {
            console.log('⚠️ MongoDB disconnected');
          }
          resetConnection();
        });

        mongooseInstance.connection.on('error', err => {
          console.error('❌ MongoDB connection error:', err.message);
          resetConnection();
        });

        return mongooseInstance;
      })
      .catch((error: Error) => {
        // Reset the promise so we can retry
        resetConnection();

        // Log the error with details
        interface MongoError extends Error {
          code?: number | string;
          codeName?: string;
        }
        const mongoError = error as MongoError;
        console.error('❌ MongoDB connection failed:', {
          message: error.message,
          name: error.name,
          code: mongoError.code,
          codeName: mongoError.codeName,
          uri: MONGODB_URI?.replace(/\/\/[^:]+:[^@]+@/, '//***:***@'), // Hide credentials
          fullError: error,
        });

        // Throw a custom error with more context
        throw new DatabaseConnectionError(`Failed to connect to MongoDB: ${error.message}`, error);
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    // Ensure promise is cleared on error
    resetConnection();

    if (e instanceof DatabaseConnectionError) {
      throw e;
    }

    // Wrap other errors
    throw new DatabaseConnectionError(
      `Database connection error: ${e instanceof Error ? e.message : 'Unknown error'}`,
      e instanceof Error ? e : undefined
    );
  }

  return cached.conn;
}

// Health check function to verify database connection
export async function checkDatabaseHealth(): Promise<{
  isConnected: boolean;
  readyState: number;
  host?: string;
  database?: string;
}> {
  try {
    await connectDB();
    return {
      isConnected: isConnectionAlive(),
      readyState: mongoose.connection.readyState,
      host: mongoose.connection.host,
      database: mongoose.connection.db?.databaseName,
    };
  } catch {
    return {
      isConnected: false,
      readyState: mongoose.connection.readyState,
    };
  }
}

// Graceful shutdown function
export async function disconnectDB(): Promise<void> {
  if (cached.conn) {
    await mongoose.disconnect();
    resetConnection();
    if (process.env.NODE_ENV === 'development') {
      console.log('🔌 MongoDB disconnected gracefully');
    }
  }
}

export default connectDB;
