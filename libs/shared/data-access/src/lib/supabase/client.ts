import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { detectEnvironment, getSupabaseConfig, validateConfig } from './config';
import { SupabaseClientOptions } from './types';

/**
 * Singleton Supabase client instance
 */
let supabaseInstance: SupabaseClient | null = null;

/**
 * Get optimized client options based on environment
 */
const getClientOptions = (): SupabaseClientOptions => {
  const env = detectEnvironment();

  const baseOptions: SupabaseClientOptions = {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      flowType: 'pkce', // More secure for public clients
    },
    realtime: {
      params: {
        eventsPerSecond: 10, // Rate limiting for realtime
      },
    },
    global: {
      headers: {
        'X-Client-Info': `weople-${env.platform}`,
      },
    },
  };

  // Edge function optimizations
  if (env.isEdgeFunction) {
    return {
      ...baseOptions,
      auth: {
        ...baseOptions.auth,
        persistSession: false, // Don't persist in edge functions
        detectSessionInUrl: false,
      },
      global: {
        ...baseOptions.global,
        headers: {
          ...baseOptions.global?.headers,
          'X-Edge-Runtime': 'true',
        },
      },
    };
  }

  // Mobile optimizations
  if (env.platform === 'mobile') {
    return {
      ...baseOptions,
      auth: {
        ...baseOptions.auth,
        autoRefreshToken: true,
        persistSession: true,
      },
    };
  }

  // Web optimizations
  return baseOptions;
};

/**
 * Create and configure Supabase client
 */
export const createSupabaseClient = (): SupabaseClient => {
  if (supabaseInstance) {
    return supabaseInstance;
  }

  const config = getSupabaseConfig();
  validateConfig(config);

  const options = getClientOptions();

  supabaseInstance = createClient(config.url, config.anonKey, options);

  // Add error handling for the client
  if (!supabaseInstance) {
    throw new Error('Failed to create Supabase client');
  }

  return supabaseInstance;
};

/**
 * Get the existing Supabase client instance or create a new one
 */
export const getSupabaseClient = (): SupabaseClient => {
  if (!supabaseInstance) {
    return createSupabaseClient();
  }
  return supabaseInstance;
};

/**
 * Reset the client instance (useful for testing or environment changes)
 */
export const resetSupabaseClient = (): void => {
  supabaseInstance = null;
};

/**
 * Create an admin client with service role key (server-side only)
 */
export const createSupabaseAdminClient = (): SupabaseClient => {
  const config = getSupabaseConfig();

  if (!config.serviceRoleKey) {
    throw new Error('Service role key is required for admin client');
  }

  const env = detectEnvironment();

  if (env.platform !== 'edge' && typeof window !== 'undefined') {
    throw new Error(
      'Admin client should only be used on server-side or edge functions',
    );
  }

  return createClient(config.url, config.serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};

// Export the default client for convenience
export const supabase = getSupabaseClient();
