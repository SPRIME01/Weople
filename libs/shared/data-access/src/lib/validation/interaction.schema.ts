/**
 * Interaction validation schemas
 *
 * Zod schemas for interaction creation and update operations.
 * Ensures runtime type safety for interaction data.
 */

import { z } from 'zod';
import { uuidSchema } from './common.schema';

/**
 * Schema for creating a new interaction
 * All fields are validated against database constraints
 */
export const createInteractionSchema = z.object({
  contact_id: uuidSchema,
  type_id: uuidSchema,
  interaction_date: z
    .string()
    .datetime('Invalid datetime format (must be ISO 8601)'),
  notes: z
    .string()
    .max(10000, 'Notes cannot exceed 10000 characters')
    .optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

/**
 * Schema for updating an existing interaction
 * All fields are optional (partial update)
 */
export const updateInteractionSchema = createInteractionSchema.partial();

// Type exports for inferred types
export type CreateInteractionInput = z.infer<typeof createInteractionSchema>;
export type UpdateInteractionInput = z.infer<typeof updateInteractionSchema>;
