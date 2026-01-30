/**
 * Contact validation schemas
 *
 * Zod schemas for contact creation and update operations.
 * Ensures runtime type safety for contact data.
 */

import { z } from 'zod';
import { phoneSchema, uuidSchema } from './common.schema';

/**
 * Schema for creating a new contact
 * All fields are validated against database constraints
 */
export const createContactSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(255, 'Name cannot exceed 255 characters'),
  email: z
    .string()
    .email('Invalid email format')
    .max(255, 'Email cannot exceed 255 characters')
    .optional(),
  phone: phoneSchema.optional(),
  company: z
    .string()
    .max(255, 'Company cannot exceed 255 characters')
    .optional(),
  job_title: z
    .string()
    .max(255, 'Job title cannot exceed 255 characters')
    .optional(),
  bio: z.string().max(2000, 'Bio cannot exceed 2000 characters').optional(),
  tags: z
    .array(uuidSchema, {
      message: 'Tags must be an array of valid UUIDs',
    })
    .optional(),
});

/**
 * Schema for updating an existing contact
 * All fields are optional (partial update)
 */
export const updateContactSchema = createContactSchema.partial();

// Type exports for inferred types
export type CreateContactInput = z.infer<typeof createContactSchema>;
export type UpdateContactInput = z.infer<typeof updateContactSchema>;
