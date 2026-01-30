/**
 * Profile entity types
 *
 * Represents user profiles in the system.
 * Profiles are linked to Supabase auth.users table.
 */

/**
 * User role type
 */
export type UserRole = 'user' | 'admin';

/**
 * User preferences structure
 */
export interface UserPreferences {
  theme?: 'light' | 'dark' | 'system';
  notifications?: boolean;
  email_digest?: 'daily' | 'weekly' | 'monthly' | 'never';
  ai_enabled?: boolean;
  [key: string]: unknown;
}

/**
 * Profile entity representing a user in the system
 */
export interface Profile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  role: UserRole;
  preferences: UserPreferences;
  ai_enabled: boolean;
  created_at: string;
}

/**
 * Input for creating a new profile
 */
export interface CreateProfileInput {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  role?: UserRole;
  preferences?: UserPreferences;
  ai_enabled?: boolean;
}

/**
 * Input for updating an existing profile
 */
export interface UpdateProfileInput {
  full_name?: string;
  avatar_url?: string;
  role?: UserRole;
  preferences?: UserPreferences;
  ai_enabled?: boolean;
}
