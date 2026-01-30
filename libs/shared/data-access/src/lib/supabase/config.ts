import { EnvironmentConfig, SupabaseConfig } from './types';
import { warn } from '../logger';

/**
 * Environment detection utilities
 */
export const detectEnvironment = (): EnvironmentConfig => {
  // Check if running in Edge Runtime (Netlify Functions, Vercel Edge, etc.)
  const globalThisAny = globalThis as Record<string, unknown>;
  const isEdgeFunction =
    typeof globalThisAny['EdgeRuntime'] !== 'undefined' ||
    // Netlify Edge Functions
    typeof globalThisAny['Netlify'] !== 'undefined' ||
    // Vercel Edge Runtime
    // Note: exclude Bun/Deno (which expose Web APIs) from being treated as Edge
    (typeof WebAssembly !== 'undefined' &&
      typeof Request !== 'undefined' &&
      typeof Response !== 'undefined' &&
      typeof (globalThis as any).Bun === 'undefined' &&
      typeof (globalThis as any).Deno === 'undefined');

  // Platform detection
  const platform = isEdgeFunction
    ? 'edge'
    : typeof window !== 'undefined'
      ? 'web'
      : 'mobile';

  const isDevelopment =
    process.env['NODE_ENV'] === 'development' ||
    process.env['VITE_ENV'] === 'development';

  const isProduction =
    process.env['NODE_ENV'] === 'production' ||
    process.env['VITE_ENV'] === 'production';

  return {
    isDevelopment,
    isProduction,
    isEdgeFunction,
    platform: platform as 'web' | 'mobile' | 'edge',
  };
};

/**
 * Get Supabase configuration from environment variables
 * Supports multiple environment variable naming conventions
 */
export const getSupabaseConfig = (): SupabaseConfig => {
  // Try different environment variable naming conventions
  const url =
    process.env['SUPABASE_URL'] ||
    process.env['VITE_SUPABASE_URL'] ||
    process.env['NEXT_PUBLIC_SUPABASE_URL'] ||
    process.env['EXPO_PUBLIC_SUPABASE_URL'];

  const anonKey =
    process.env['SUPABASE_ANON_KEY'] ||
    process.env['VITE_SUPABASE_ANON_KEY'] ||
    process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY'] ||
    process.env['EXPO_PUBLIC_SUPABASE_ANON_KEY'];

  const serviceRoleKey =
    process.env['SUPABASE_SERVICE_ROLE_KEY'] ||
    process.env['VITE_SUPABASE_SERVICE_ROLE_KEY'];

  if (!url || !anonKey) {
    throw new Error(
      'Missing Supabase configuration. Please set SUPABASE_URL and SUPABASE_ANON_KEY environment variables.\n' +
        'Supported variable names:\n' +
        '- SUPABASE_URL / VITE_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_URL\n' +
        '- SUPABASE_ANON_KEY / VITE_SUPABASE_ANON_KEY / NEXT_PUBLIC_SUPABASE_ANON_KEY / EXPO_PUBLIC_SUPABASE_ANON_KEY',
    );
  }

  return {
    url,
    anonKey,
    serviceRoleKey,
  };
};

/**
 * Validate Supabase configuration
 */
export const validateConfig = (config: SupabaseConfig): void => {
  if (!config.url) {
    throw new Error('Supabase URL is required');
  }

  if (!config.anonKey) {
    throw new Error('Supabase anonymous key is required');
  }

  // Basic URL validation
  try {
    new URL(config.url);
  } catch {
    throw new Error('Invalid Supabase URL format');
  }

  // Check if URL looks like a Supabase URL
  if (
    !config.url.includes('supabase.co') &&
    !config.url.includes('localhost')
  ) {
    warn('URL does not appear to be a valid Supabase URL', { url: config.url });
  }
};
