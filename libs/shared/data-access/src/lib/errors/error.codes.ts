/**
 * Standardized error codes for the application.
 * All error codes follow a consistent naming pattern: DOMAIN_SUBTYPE
 */
export const ErrorCodes = {
  // Auth errors
  AUTH_UNAUTHORIZED: 'AUTH_001',
  AUTH_FORBIDDEN: 'AUTH_002',
  AUTH_INVALID_CREDENTIALS: 'AUTH_003',
  AUTH_SESSION_EXPIRED: 'AUTH_004',

  // Validation errors
  VALIDATION_INVALID_INPUT: 'VAL_001',
  VALIDATION_REQUIRED_FIELD: 'VAL_002',
  VALIDATION_INVALID_FORMAT: 'VAL_003',

  // Resource errors
  RESOURCE_NOT_FOUND: 'RES_001',
  RESOURCE_ALREADY_EXISTS: 'RES_002',
  RESOURCE_CONFLICT: 'RES_003',

  // Database errors
  DB_CONNECTION_ERROR: 'DB_001',
  DB_QUERY_ERROR: 'DB_002',
  DB_CONSTRAINT_VIOLATION: 'DB_003',

  // AI errors
  AI_PROCESSING_ERROR: 'AI_001',
  AI_RATE_LIMIT: 'AI_002',
  AI_BUDGET_EXCEEDED: 'AI_003',

  // Network errors
  NETWORK_ERROR: 'NET_001',
  TIMEOUT_ERROR: 'NET_002',

  // Unknown
  UNKNOWN_ERROR: 'UNK_001',
} as const;

/**
 * Type for all valid error codes
 */
export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes];
