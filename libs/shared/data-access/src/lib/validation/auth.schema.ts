/**
 * Authentication validation schemas
 *
 * Zod schemas for authentication operations (login, register, password reset).
 * Ensures runtime type safety for auth data with detailed error messages.
 */

import { z } from 'zod';
import { emailSchema } from './common.schema';

/**
 * Password validation helper
 * Enforces strong password requirements
 */
const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password cannot exceed 128 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(
    /[^A-Za-z0-9]/,
    'Password must contain at least one special character',
  );

/**
 * Schema for user login
 * Validates email and password requirements
 */
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

/**
 * Schema for user registration
 * Validates all required fields for creating a new account
 */
export const registerSchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
    confirm_password: z.string().min(1, 'Please confirm your password'),
    full_name: z
      .string()
      .min(1, 'Full name is required')
      .max(255, 'Full name cannot exceed 255 characters')
      .optional(),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: 'Passwords do not match',
    path: ['confirm_password'],
  });

/**
 * Schema for password reset request
 * Validates email format
 */
export const resetPasswordSchema = z.object({
  email: emailSchema,
});

// Type exports for inferred types
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
