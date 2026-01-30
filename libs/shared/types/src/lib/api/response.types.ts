/**
 * API Response Types
 *
 * Standard response wrappers for API endpoints.
 * Provides consistent response structure across all APIs.
 */

/**
 * Standard API response wrapper for single items
 */
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

/**
 * Standard API response wrapper for lists with pagination
 */
export interface PaginatedResponse<T> {
  data: T[];
  success: boolean;
  pagination: PaginationInfo;
  message?: string;
}

/**
 * Pagination metadata
 */
export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/**
 * API error response structure
 */
export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
    fieldErrors?: Record<string, string[]>;
  };
}

/**
 * Success response with no data
 */
export interface EmptySuccessResponse {
  success: true;
  message?: string;
}

/**
 * Generic result type for API operations
 */
export interface OperationResult<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
}

/**
 * API error details
 */
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  fieldErrors?: Record<string, string[]>;
  statusCode?: number;
}

/**
 * Cursor-based pagination info (for real-time/live lists)
 */
export interface CursorPaginationInfo {
  cursor?: string;
  limit: number;
  hasMore: boolean;
}

/**
 * Cursor-based paginated response
 */
export interface CursorPaginatedResponse<T> {
  data: T[];
  success: boolean;
  pagination: CursorPaginationInfo;
  message?: string;
}

/**
 * Bulk operation result
 */
export interface BulkOperationResult {
  success: boolean;
  processed: number;
  succeeded: number;
  failed: number;
  errors?: Array<{
    id: string;
    error: string;
  }>;
}

/**
 * Search suggestion result
 */
export interface SearchSuggestion {
  id: string;
  type: 'contact' | 'company' | 'tag' | 'opportunity';
  title: string;
  subtitle?: string;
}

/**
 * Search suggestions response
 */
export interface SearchSuggestionsResponse {
  success: boolean;
  suggestions: SearchSuggestion[];
  query: string;
}
