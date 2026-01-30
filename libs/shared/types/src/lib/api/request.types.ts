/**
 * API Request Types
 *
 * Common request structures for pagination, filtering, and sorting.
 */

import { OpportunityStage } from '../entities/opportunity.types';

/**
 * Sort direction for query results
 */
export type SortDirection = 'asc' | 'desc';

/**
 * Sort configuration for queries
 */
export interface SortConfig {
  column: string;
  direction: SortDirection;
}

/**
 * Pagination parameters for list requests
 */
export interface PaginationParams {
  page: number;
  limit: number;
}

/**
 * Pagination options with defaults
 */
export interface PaginationOptions {
  page?: number;
  limit?: number;
}

/**
 * Standard filter operators for query building
 */
export type FilterOperator =
  | 'eq' // Equal
  | 'neq' // Not equal
  | 'gt' // Greater than
  | 'gte' // Greater than or equal
  | 'lt' // Less than
  | 'lte' // Less than or equal
  | 'like' // Like (pattern matching)
  | 'ilike' // Case-insensitive like
  | 'in' // In array
  | 'is' // Is null/not null
  | 'contains'; // For arrays/json

/**
 * Single filter condition
 */
export interface FilterCondition {
  field: string;
  operator: FilterOperator;
  value: unknown;
}

/**
 * Filter options for list queries
 */
export interface FilterOptions {
  where?: Record<string, unknown>;
  orderBy?: SortConfig;
  limit?: number;
  offset?: number;
}

/**
 * Advanced filter options with multiple conditions
 */
export interface AdvancedFilterOptions {
  conditions?: FilterCondition[];
  orderBy?: SortConfig;
  pagination?: PaginationParams;
}

/**
 * Common query parameters for list endpoints
 */
export interface ListQueryParams extends PaginationOptions {
  sort?: string;
  order?: SortDirection;
  search?: string;
  [key: string]: unknown;
}

/**
 * Contact-specific filter parameters
 */
export interface ContactFilterParams extends ListQueryParams {
  company?: string;
  tag_id?: string;
  health_min?: number;
  health_max?: number;
  has_interactions?: boolean;
}

/**
 * Interaction-specific filter parameters
 */
export interface InteractionFilterParams extends ListQueryParams {
  contact_id?: string;
  type_id?: string;
  date_from?: string;
  date_to?: string;
  has_sentiment?: boolean;
}

/**
 * Follow-up-specific filter parameters
 */
export interface FollowUpFilterParams extends ListQueryParams {
  contact_id?: string;
  priority?: string;
  completed?: boolean;
  due_before?: string;
  due_after?: string;
}

/**
 * Opportunity-specific filter parameters
 */
export interface OpportunityFilterParams extends ListQueryParams {
  stage?: OpportunityStage;
  stages?: OpportunityStage[];
  value_min?: number;
  value_max?: number;
  expected_close_before?: string;
  expected_close_after?: string;
}
