import { AppError } from './app-error';
import { ErrorCodes } from './error.codes';

/**
 * Result type for functional error handling.
 * Represents either a successful value (success: true) or an error (success: false).
 *
 * @example
 * ```typescript
 * const result = await fetchUser('123');
 * if (result.success) {
 *   console.log(result.data);
 * } else {
 *   console.error(result.error);
 * }
 * ```
 */
export type Result<T, E = AppError> =
  | { success: true; data: T; error: null }
  | { success: false; data: null; error: E };

/**
 * Creates a successful Result with the given data.
 *
 * @param data - The successful value to wrap
 * @returns A Result indicating success with the data
 *
 * @example
 * ```typescript
 * return success(user);
 * ```
 */
export function success<T>(data: T): Result<T, never> {
  return { success: true, data, error: null };
}

/**
 * Creates a failed Result with the given error.
 *
 * @param error - The error to wrap
 * @returns A Result indicating failure with the error
 *
 * @example
 * ```typescript
 * return failure(new NotFoundError('User', id));
 * ```
 */
export function failure<E extends AppError>(error: E): Result<never, E> {
  return { success: false, data: null, error };
}

/**
 * Type guard to check if a Result is successful.
 *
 * @param result - The Result to check
 * @returns True if the Result is successful
 */
export function isSuccess<T, E>(
  result: Result<T, E>,
): result is { success: true; data: T; error: null } {
  return result.success === true;
}

/**
 * Type guard to check if a Result is a failure.
 *
 * @param result - The Result to check
 * @returns True if the Result is a failure
 */
export function isFailure<T, E>(
  result: Result<T, E>,
): result is { success: false; data: null; error: E } {
  return result.success === false;
}

/**
 * Maps a successful Result value using the provided function.
 * If the Result is a failure, returns the failure unchanged.
 *
 * @param result - The Result to map
 * @param fn - The mapping function
 * @returns A new Result with the mapped value or the original error
 */
export function map<T, U, E>(
  result: Result<T, E>,
  fn: (data: T) => U,
): Result<U, E> {
  if (isSuccess(result)) {
    return success(fn(result.data));
  }
  return result;
}

/**
 * Maps a failed Result error using the provided function.
 * If the Result is successful, returns the success unchanged.
 *
 * @param result - The Result to map
 * @param fn - The error mapping function
 * @returns A new Result with the mapped error or the original data
 */
export function mapError<T, E, F extends AppError>(
  result: Result<T, E>,
  fn: (error: E) => F,
): Result<T, F> {
  if (isFailure(result)) {
    return failure(fn(result.error));
  }
  return result;
}

/**
 * Chains asynchronous operations that return Results.
 * If the input Result is successful, applies the function to its value.
 * If the input Result is a failure, returns the failure unchanged.
 *
 * @param result - The Result to flatMap
 * @param fn - The function to apply that returns a new Result
 * @returns The chained Result
 */
export function flatMap<T, U, E>(
  result: Result<T, E>,
  fn: (data: T) => Result<U, E>,
): Result<U, E> {
  if (isSuccess(result)) {
    return fn(result.data);
  }
  return result;
}

/**
 * Unwraps a Result, returning the data or throwing the error.
 * Use with caution - prefer pattern matching with isSuccess/isFailure.
 *
 * @param result - The Result to unwrap
 * @returns The data if successful
 * @throws The error if the Result is a failure
 */
export function unwrap<T, E extends AppError>(result: Result<T, E>): T {
  if (isSuccess(result)) {
    return result.data;
  }
  throw result.error;
}

/**
 * Unwraps a Result with a default value for failures.
 *
 * @param result - The Result to unwrap
 * @param defaultValue - The value to return if the Result is a failure
 * @returns The data if successful, otherwise the default value
 */
export function unwrapOr<T, E>(result: Result<T, E>, defaultValue: T): T {
  if (isSuccess(result)) {
    return result.data;
  }
  return defaultValue;
}

/**
 * Wraps an async function call in a try-catch and returns a Result.
 * Catches any thrown errors and wraps them in an AppError.
 *
 * @param fn - The async function to execute
 * @param errorMapper - Optional function to map caught errors to AppError
 * @returns A Promise resolving to a Result
 *
 * @example
 * ```typescript
 * const result = await tryCatch(
 *   () => fetchUser(id),
 *   (error) => new NotFoundError('User', id)
 * );
 * ```
 */
export async function tryCatch<T>(
  fn: () => Promise<T>,
  errorMapper?: (error: unknown) => AppError,
): Promise<Result<T, AppError>> {
  try {
    const data = await fn();
    return success(data);
  } catch (error) {
    const mappedError = errorMapper
      ? errorMapper(error)
      : new AppError(
          error instanceof Error ? error.message : 'Unknown error',
          ErrorCodes.UNKNOWN_ERROR,
        );
    return failure(mappedError);
  }
}

/**
 * Wraps a synchronous function call in a try-catch and returns a Result.
 * Catches any thrown errors and wraps them in an AppError.
 *
 * @param fn - The sync function to execute
 * @param errorMapper - Optional function to map caught errors to AppError
 * @returns A Result
 *
 * @example
 * ```typescript
 * const result = tryCatchSync(
 *   () => parseJSON(jsonString),
 *   (error) => new ValidationError('Invalid JSON format')
 * );
 * ```
 */
export function tryCatchSync<T>(
  fn: () => T,
  errorMapper?: (error: unknown) => AppError,
): Result<T, AppError> {
  try {
    const data = fn();
    return success(data);
  } catch (error) {
    const mappedError = errorMapper
      ? errorMapper(error)
      : new AppError(
          error instanceof Error ? error.message : 'Unknown error',
          ErrorCodes.UNKNOWN_ERROR,
        );
    return failure(mappedError);
  }
}
