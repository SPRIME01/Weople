import { ErrorCodes } from './error.codes';

/**
 * Base application error class.
 * All custom errors should extend this class for consistent error handling.
 */
export class AppError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode = 500,
    public readonly details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = 'AppError';
    // Fix prototype chain for instanceof checks
    Object.setPrototypeOf(this, AppError.prototype);
  }

  /**
   * Convert error to a plain object for serialization.
   * Useful for logging and API responses.
   */
  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      details: this.details,
      stack: this.stack,
    };
  }
}

/**
 * Validation error with field-level error details.
 * Used when input validation fails.
 */
export class ValidationError extends AppError {
  constructor(
    message: string,
    public readonly fieldErrors?: Record<string, string[]>,
  ) {
    super(message, ErrorCodes.VALIDATION_INVALID_INPUT, 400, { fieldErrors });
    this.name = 'ValidationError';
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

/**
 * Error thrown when a requested resource is not found.
 */
export class NotFoundError extends AppError {
  constructor(resource: string, id?: string) {
    super(
      `${resource}${id ? ` with id ${id}` : ''} not found`,
      ErrorCodes.RESOURCE_NOT_FOUND,
      404,
      { resource, id },
    );
    this.name = 'NotFoundError';
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

/**
 * Error thrown when authentication is required but not provided or invalid.
 */
export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, ErrorCodes.AUTH_UNAUTHORIZED, 401);
    this.name = 'UnauthorizedError';
    Object.setPrototypeOf(this, UnauthorizedError.prototype);
  }
}

/**
 * Error thrown when there's a conflict with the current state of the resource.
 * Commonly used for duplicate entries or version conflicts.
 */
export class ConflictError extends AppError {
  constructor(
    message: string,
    public readonly conflictField?: string,
    public readonly conflictValue?: unknown,
  ) {
    super(message, ErrorCodes.RESOURCE_CONFLICT, 409, {
      conflictField,
      conflictValue,
    });
    this.name = 'ConflictError';
    Object.setPrototypeOf(this, ConflictError.prototype);
  }
}

/**
 * Error thrown when a database operation fails.
 */
export class DatabaseError extends AppError {
  constructor(
    message: string,
    public readonly operation?: string,
    public readonly originalError?: unknown,
  ) {
    super(message, ErrorCodes.DB_QUERY_ERROR, 500, {
      operation,
      originalError:
        originalError instanceof Error ? originalError.message : originalError,
    });
    this.name = 'DatabaseError';
    Object.setPrototypeOf(this, DatabaseError.prototype);
  }

  /**
   * Create a database error from a connection failure.
   */
  static connectionError(originalError?: unknown): DatabaseError {
    return new DatabaseError(
      'Failed to connect to the database',
      'connect',
      originalError,
    );
  }

  /**
   * Create a database error from a constraint violation.
   */
  static constraintViolation(
    constraint: string,
    originalError?: unknown,
  ): DatabaseError {
    const error = new DatabaseError(
      `Database constraint violation: ${constraint}`,
      'constraint_check',
      originalError,
    );
    // Override the error code for constraint violations
    Object.defineProperty(error, 'code', {
      value: ErrorCodes.DB_CONSTRAINT_VIOLATION,
      writable: false,
    });
    return error;
  }
}

/**
 * Error thrown when an AI processing operation fails.
 */
export class AIError extends AppError {
  constructor(
    message: string,
    public readonly operation?: string,
    public readonly model?: string,
    public readonly originalError?: unknown,
  ) {
    super(message, ErrorCodes.AI_PROCESSING_ERROR, 502, {
      operation,
      model,
      originalError:
        originalError instanceof Error ? originalError.message : originalError,
    });
    this.name = 'AIError';
    Object.setPrototypeOf(this, AIError.prototype);
  }

  /**
   * Create an AI error for rate limiting.
   */
  static rateLimit(model?: string, retryAfter?: number): AIError {
    const details: Record<string, unknown> = {};
    if (retryAfter !== undefined) {
      details['retryAfter'] = retryAfter;
    }

    const error = new AIError('AI rate limit exceeded', 'completion', model);

    // Create a new error with the correct code and details
    const rateLimitError = new AIError(
      error.message,
      error.operation,
      error.model,
      error.originalError,
    );

    // Override properties using defineProperty
    Object.defineProperty(rateLimitError, 'code', {
      value: ErrorCodes.AI_RATE_LIMIT,
      writable: false,
      configurable: true,
    });
    Object.defineProperty(rateLimitError, 'statusCode', {
      value: 429,
      writable: false,
      configurable: true,
    });
    Object.defineProperty(rateLimitError, 'details', {
      value: { ...rateLimitError.details, ...details },
      writable: false,
      configurable: true,
    });

    return rateLimitError;
  }

  /**
   * Create an AI error for budget exceeded.
   */
  static budgetExceeded(model?: string): AIError {
    const budgetError = new AIError(
      'AI budget exceeded for this billing period',
      'completion',
      model,
    );

    // Override properties using defineProperty
    Object.defineProperty(budgetError, 'code', {
      value: ErrorCodes.AI_BUDGET_EXCEEDED,
      writable: false,
      configurable: true,
    });
    Object.defineProperty(budgetError, 'statusCode', {
      value: 402,
      writable: false,
      configurable: true,
    });

    return budgetError;
  }
}
