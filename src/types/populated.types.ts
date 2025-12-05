import mongoose from 'mongoose';

/**
 * Type helper for populated Mongoose documents
 */
export type Populated<T, K extends keyof T> = Omit<T, K> & {
  [P in K]: mongoose.Types.ObjectId | { _id: mongoose.Types.ObjectId; [key: string]: unknown };
};

/**
 * Populated User (student/instructor)
 */
export interface PopulatedUser {
  _id: mongoose.Types.ObjectId | string;
  name: string;
  email?: string;
  [key: string]: unknown;
}

/**
 * Populated Course
 */
export interface PopulatedCourse {
  _id: mongoose.Types.ObjectId | string;
  title: string;
  description?: string;
  [key: string]: unknown;
}

/**
 * Populated Batch
 */
export interface PopulatedBatch {
  _id: mongoose.Types.ObjectId | string;
  name: string;
  [key: string]: unknown;
}

/**
 * Populated Assignment
 */
export interface PopulatedAssignment {
  _id: mongoose.Types.ObjectId | string;
  title: string;
  description?: string;
  instructions?: string;
  maxScore?: number;
  course?: PopulatedCourse | null;
  [key: string]: unknown;
}

/**
 * Type guard to check if a value is a populated document
 */
export function isPopulated<T extends { _id?: unknown }>(
  value: mongoose.Types.ObjectId | T
): value is T {
  return typeof value === 'object' && value !== null && '_id' in value;
}

/**
 * Safely extract ID from populated or ObjectId
 */
export function extractId(value: mongoose.Types.ObjectId | { _id?: unknown } | string): string {
  if (typeof value === 'string') {
    return value;
  }
  if (isPopulated(value)) {
    const id = value._id;
    if (id && typeof id === 'object' && id instanceof mongoose.Types.ObjectId) {
      return id.toString();
    }
    return String(id || '');
  }
  // Check if value is an ObjectId
  const objIdValue = value as unknown;
  if (
    objIdValue &&
    typeof objIdValue === 'object' &&
    objIdValue instanceof mongoose.Types.ObjectId
  ) {
    return objIdValue.toString();
  }
  return '';
}

/**
 * Safely get property from populated document
 */
export function getPopulatedProperty<T extends { _id?: unknown }>(
  value: mongoose.Types.ObjectId | T,
  property: keyof T,
  defaultValue: T[keyof T]
): T[keyof T] {
  if (isPopulated(value)) {
    return (value[property] as T[keyof T]) ?? defaultValue;
  }
  return defaultValue;
}
