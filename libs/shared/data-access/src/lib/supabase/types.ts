/**
 * Supabase configuration types
 */
export interface SupabaseConfig {
  url: string;
  anonKey: string;
  serviceRoleKey?: string;
}

/**
 * Supabase client options for different environments
 */
export interface SupabaseClientOptions {
  auth?: {
    autoRefreshToken?: boolean;
    persistSession?: boolean;
    detectSessionInUrl?: boolean;
    flowType?: 'implicit' | 'pkce';
  };
  realtime?: {
    params?: {
      eventsPerSecond?: number;
    };
  };
  global?: {
    headers?: Record<string, string>;
  };
}

/**
 * Environment-specific configuration
 */
export interface EnvironmentConfig {
  isDevelopment: boolean;
  isProduction: boolean;
  isEdgeFunction: boolean;
  platform: 'web' | 'mobile' | 'edge';
}
