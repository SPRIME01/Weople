/**
 * Follow-up validation schemas
 *
 * Zod schemas for follow-up creation and update operations.
 * Ensures runtime type safety for follow-up data.
 */

import { z } from 'zod';
import { uuidSchema } from './common.schema';

/**
 * Priority levels for follow-ups
 */
const priorityEnum = z.enum(['low', 'medium', 'high', 'critical'], {
  message: 'Priority must be one of: low, medium, high, critical',
});

/**
 * Schema for creating a new follow-up
 * All fields are validated against database constraints
 */
export const createFollowUpSchema = z.object({
  contact_id: uuidSchema.optional(),
  title: z
    .string()
    .min(1, 'Title is required')
    .max(255, 'Title cannot exceed 255 characters'),
  description: z
    .string()
    .max(2000, 'Description cannot exceed 2000 characters')
    .optional(),
  due_date: z.string().datetime('Invalid datetime format (must be ISO 8601)'),
  priority: priorityEnum,
});

/**
 * Schema for updating an existing follow-up
 * All fields are optional (partial update)
 */
export const updateFollowUpSchema = createFollowUpSchema.partial();

// Type exports for inferred types
export type CreateFollowUpInput = z.infer<typeof createFollowUpSchema>;
export type UpdateFollowUpInput = z.infer<typeof updateFollowUpSchema>;
export type FollowUpPriority = z.infer<typeof priorityEnum>;
