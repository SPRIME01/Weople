/**
 * Common validation schemas
 *
 * Shared validators used across multiple entity schemas.
 * Provides runtime type safety with detailed error messages.
 */

import { z } from 'zod';

/**
 * UUID validation schema
 * Validates UUID v4 format
 */
export const uuidSchema = z.string().uuid('Invalid UUID format');

/**
 * Email validation schema
 * Validates email format with custom error message
 */
export const emailSchema = z.string().email('Invalid email format');

/**
 * Phone validation schema
 * Validates E.164 format (e.g., +1234567890)
 * E.164 format: optional '+' followed by 1-15 digits, first digit must be non-zero
 */
export const phoneSchema = z
  .string()
  .regex(
    /^\+[1-9]\d{1,14}$/,
    'Invalid phone number format (must be E.164, e.g., +1234567890)',
  );

/**
 * Pagination validation schema
 * Validates and provides defaults for pagination parameters
 */
export const paginationSchema = z.object({
  page: z
    .number()
    .int('Page must be an integer')
    .min(1, 'Page must be at least 1')
    .default(1),
  limit: z
    .number()
    .int('Limit must be an integer')
    .min(1, 'Limit must be at least 1')
    .max(100, 'Limit cannot exceed 100')
    .default(20),
});

/**
 * Hex color validation schema
 * Validates 6-digit hex color format (e.g., #3b82f6, #FF0000)
 */
export const hexColorSchema = z
  .string()
  .regex(
    /^#[0-9A-Fa-f]{6}$/,
    'Invalid hex color format (must be 6 characters, e.g., #3b82f6)',
  );

// Type exports for inferred types
export type PaginationInput = z.infer<typeof paginationSchema>;
