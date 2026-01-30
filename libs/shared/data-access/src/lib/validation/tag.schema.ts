/**
 * Tag validation schemas
 *
 * Zod schemas for tag creation and update operations.
 * Ensures runtime type safety for tag data.
 */

import { z } from 'zod';
import { hexColorSchema, uuidSchema } from './common.schema';

/**
 * Schema for creating a new tag
 * All fields are validated against database constraints
 */
export const createTagSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(50, 'Name cannot exceed 50 characters'),
  color: hexColorSchema.default('#3b82f6'),
  parent_id: uuidSchema.optional(),
  description: z
    .string()
    .max(500, 'Description cannot exceed 500 characters')
    .optional(),
});

/**
 * Schema for updating an existing tag
 * All fields are optional (partial update)
 */
export const updateTagSchema = createTagSchema.partial();

// Type exports for inferred types
export type CreateTagInput = z.infer<typeof createTagSchema>;
export type UpdateTagInput = z.infer<typeof updateTagSchema>;
