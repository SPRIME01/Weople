/**
 * API Types
 *
 * Request and response types for API operations.
 */

// Request types
export type {
  AdvancedFilterOptions,
  ContactFilterParams,
  FilterCondition,
  FilterOperator,
  FilterOptions,
  FollowUpFilterParams,
  InteractionFilterParams,
  ListQueryParams,
  OpportunityFilterParams,
  PaginationOptions,
  PaginationParams,
  SortConfig,
  SortDirection,
} from './request.types';

// Response types
export type {
  ApiError,
  ApiErrorResponse,
  ApiResponse,
  BulkOperationResult,
  CursorPaginatedResponse,
  CursorPaginationInfo,
  EmptySuccessResponse,
  OperationResult,
  PaginatedResponse,
  PaginationInfo,
  SearchSuggestion,
  SearchSuggestionsResponse,
} from './response.types';
