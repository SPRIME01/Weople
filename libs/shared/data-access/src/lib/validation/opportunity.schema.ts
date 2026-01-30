/**
 * Opportunity validation schemas
 *
 * Zod schemas for opportunity creation and update operations.
 * Ensures runtime type safety for opportunity data.
 */

import { z } from 'zod';
import { uuidSchema } from './common.schema';

/**
 * Opportunity stages enum
 */
const opportunityStageEnum = z.enum(
  [
    'prospecting',
    'qualification',
    'proposal',
    'negotiation',
    'closed_won',
    'closed_lost',
  ],
  {
    message:
      'Stage must be one of: prospecting, qualification, proposal, negotiation, closed_won, closed_lost',
  },
);

/**
 * Schema for creating a new opportunity
 * All fields are validated against database constraints
 */
export const createOpportunitySchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(255, 'Title cannot exceed 255 characters'),
  description: z
    .string()
    .max(5000, 'Description cannot exceed 5000 characters')
    .optional(),
  value: z
    .number({
      message: 'Value must be a number',
    })
    .positive('Value must be a positive number')
    .optional(),
  currency: z
    .string()
    .length(3, 'Currency must be a 3-letter code (ISO 4217)')
    .default('USD'),
  stage: opportunityStageEnum,
  probability: z
    .number()
    .int('Probability must be an integer')
    .min(0, 'Probability cannot be less than 0')
    .max(100, 'Probability cannot exceed 100')
    .optional(),
  expected_close: z
    .string()
    .datetime('Invalid datetime format (must be ISO 8601)')
    .optional(),
  contact_ids: z
    .array(uuidSchema, {
      message: 'Contact IDs must be an array of valid UUIDs',
    })
    .optional(),
});

/**
 * Schema for updating an existing opportunity
 * All fields are optional (partial update)
 */
export const updateOpportunitySchema = createOpportunitySchema.partial();

// Type exports for inferred types
export type CreateOpportunityInput = z.infer<typeof createOpportunitySchema>;
export type UpdateOpportunityInput = z.infer<typeof updateOpportunitySchema>;
export type OpportunityStage = z.infer<typeof opportunityStageEnum>;
