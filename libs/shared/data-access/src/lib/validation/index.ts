/**
 * Validation schemas index
 *
 * Centralized exports for all Zod validation schemas.
 * Provides runtime type safety for all entity operations.
 */

// Common validators
export * from './common.schema';

// Entity validators
export * from './auth.schema';
export * from './contact.schema';
export * from './followup.schema';
export * from './interaction.schema';
export * from './opportunity.schema';
export * from './tag.schema';
