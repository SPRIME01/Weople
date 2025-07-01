import { supabase } from '../supabase';
import { ProfileService } from './profile.service';
import type { SignUpInput, AuthResult } from '@libs/shared/types/auth.types';

const profileService = new ProfileService();

// RFC 5322 compliant email regex
// eslint-disable-next-line no-control-regex
const EMAIL_REGEX =
  /^(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x5f-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])$/;

// Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, one number, and one special character.
const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+])[A-Za-z\d!@#$%^&*()_+]{8,}$/;

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

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    return { user: null, error };
  }

  if (data.user) {
    try {
      await profileService.createProfile(data.user.id, data.user.email);
    } catch (profileError) {
      // If profile creation fails, we should ideally roll back the user creation or mark it for review.
      // For now, we'll just return the error.
      return { user: null, error: profileError as AuthApiError };
    }
  }

  return { user: data.user, session: data.session, error: null };
};
