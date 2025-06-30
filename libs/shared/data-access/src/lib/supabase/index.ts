// Re-export main client and utilities
export {
  createSupabaseAdminClient,
  createSupabaseClient,
  getSupabaseClient,
  resetSupabaseClient,
  supabase,
} from './client';

export { detectEnvironment, getSupabaseConfig, validateConfig } from './config';

export {
  SupabaseAuth,
  SupabaseDatabase,
  SupabaseStorage,
  supabaseAuth,
  supabaseDb,
  supabaseStorage,
} from './utils';

export type {
  EnvironmentConfig,
  SupabaseClientOptions,
  SupabaseConfig,
} from './types';

// Re-export Supabase types that consumers might need
export type {
  AuthError,
  PostgrestError,
  Session,
  SupabaseClient,
  User,
} from '@supabase/supabase-js';

// Export examples (optional - can be removed in production)
export { default as examples } from './examples';
