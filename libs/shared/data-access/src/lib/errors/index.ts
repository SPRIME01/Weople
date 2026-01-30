/**
 * Error Handling Module
 *
 * Provides standardized error types, error codes, and the Result pattern
 * for functional error handling throughout the application.
 *
 * @example
 * ```typescript
 * import {
 *   tryCatch, success, failure, Result,
 *   NotFoundError, ValidationError,
 *   ErrorCodes
 * } from '@weople/shared/data-access';
 *
 * // Using Result pattern with tryCatch
 * const result = await tryCatch(
 *   () => fetchUser(id),
 *   (error) => new NotFoundError('User', id)
 * );
 *
 * if (result.success) {
 *   console.log(result.data);
 * } else {
 *   console.error(result.error.code, result.error.message);
 * }
 * ```
 */

// Error codes
export { ErrorCodes, type ErrorCode } from './error.codes';

// Error classes
export {
  AIError,
  AppError,
  ConflictError,
  DatabaseError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from './app-error';

// Result pattern
export {
  failure,
  flatMap,
  isFailure,
  isSuccess,
  map,
  mapError,
  success,
  tryCatch,
  tryCatchSync,
  unwrap,
  unwrapOr,
  type Result,
} from './result';
