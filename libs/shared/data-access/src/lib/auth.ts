import type { AuthResult, SignUpInput } from '@weople/shared/types';
import { ProfileService } from './profile.service';
import { supabase } from '../supabase';

const profileService = new ProfileService();

// Helper to call the edge function
async function signUpWithProfileEdgeFn(
  email: string,
  password: string,
): Promise<AuthResult> {
  const response = await fetch('/functions/v1/signUpWithProfile', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const result = await response.json();
  if (!response.ok) {
    return {
      user: null,
      error: result.error || {
        name: 'AuthApiError',
        message: 'Unknown error',
        status: 400,
      },
    };
  }
  return { user: result.user, session: null, error: null };
}

// Simplified email regex compatible with JavaScript RegExp
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+])[A-Za-z\d!@#$%^&*()_+]{12,}$/;

export const signUp = async ({
  email,
  password,
}: SignUpInput): Promise<AuthResult> => {
  if (!EMAIL_REGEX.test(email)) {
    return {
      user: null,
      error: {
        name: 'AuthApiError',
        message: 'Email does not meet strength requirements.',
        status: 400,
      },
    };
  }

  if (!PASSWORD_REGEX.test(password)) {
    return {
      user: null,
      error: {
        name: 'AuthApiError',
        message: 'Password does not meet strength requirements.',
        status: 400,
      },
    };
  }

  // Try atomic sign up via edge function
  try {
    return await signUpWithProfileEdgeFn(email, password);
  } catch {
    // fallback to legacy (non-atomic) approach
  }

  // Legacy fallback: not atomic
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    return { user: null, error };
  }

  if (data.user) {
    try {
      // Attempt to create profile
      await profileService.createProfile(data.user.id, data.user.email);
    } catch (profileError) {
      // Normalize error to AuthError shape
      return {
        user: null,
        error: {
          name: 'ProfileCreationError',
          message:
            profileError instanceof Error
              ? profileError.message
              : 'Profile creation failed',
          status: 400,
        },
      };
    }
  }

  return { user: data.user, session: data.session, error: null };
};
