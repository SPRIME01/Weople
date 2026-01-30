import type {
  AuthChangeEvent,
  Session,
  SupabaseClient,
} from '@supabase/supabase-js';
import {
  REALTIME_LISTEN_TYPES,
  type REALTIME_POSTGRES_CHANGES_LISTEN_EVENT,
  type RealtimeChannel,
  type RealtimePostgresChangesFilter,
  type RealtimePostgresChangesPayload,
} from '@supabase/realtime-js';
import { getSupabaseClient } from './client';

/**
 * Authentication utilities
 */
export class SupabaseAuth {
  private client: SupabaseClient;

  constructor() {
    this.client = getSupabaseClient();
  }

  /**
   * Sign up with email and password
   */
  async signUp(
    email: string,
    password: string,
    options?: { redirectTo?: string },
  ) {
    return await this.client.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: options?.redirectTo,
      },
    });
  }

  /**
   * Sign in with email and password
   */
  async signIn(email: string, password: string) {
    return await this.client.auth.signInWithPassword({
      email,
      password,
    });
  }

  /**
   * Sign in with OAuth provider
   */
  async signInWithOAuth(
    provider: 'google' | 'github' | 'apple',
    options?: { redirectTo?: string },
  ) {
    return await this.client.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: options?.redirectTo,
      },
    });
  }

  /**
   * Sign out
   */
  async signOut() {
    return await this.client.auth.signOut();
  }

  /**
   * Get current session
   */
  async getSession() {
    return await this.client.auth.getSession();
  }

  /**
   * Get current user
   */
  async getUser() {
    return await this.client.auth.getUser();
  }

  /**
   * Listen to auth state changes
   */
  onAuthStateChange(
    callback: (event: AuthChangeEvent, session: Session | null) => void,
  ) {
    return this.client.auth.onAuthStateChange(callback);
  }

  /**
   * Reset password
   */
  async resetPassword(email: string, options?: { redirectTo?: string }) {
    return await this.client.auth.resetPasswordForEmail(email, {
      redirectTo: options?.redirectTo,
    });
  }

  /**
   * Update user
   */
  async updateUser(updates: {
    email?: string;
    password?: string;
    data?: Record<string, unknown>;
  }) {
    return await this.client.auth.updateUser(updates);
  }
}

/**
 * Database utilities
 */
export class SupabaseDatabase {
  private client: SupabaseClient;

  constructor() {
    this.client = getSupabaseClient();
  }

  /**
   * Get a table reference
   */
  table(tableName: string): ReturnType<SupabaseClient['from']> {
    return this.client.from(tableName);
  }

  /**
   * Execute RPC (Remote Procedure Call)
   */
  async rpc(functionName: string, params?: Record<string, unknown>) {
    return await this.client.rpc(functionName, params);
  }

  /**
   * Listen to realtime changes
   */
  subscribe<T extends Record<string, unknown> = Record<string, unknown>>(
    table: string,
    callback: (payload: RealtimePostgresChangesPayload<T>) => void,
    options?: {
      event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
      schema?: string;
      filter?: string;
    },
  ): RealtimeChannel {
    const channel = this.client.channel(`realtime:${table}`);

    // Create a properly typed postgres changes filter
    const changeConfig = {
      event: (options?.event || '*') as '*' | 'INSERT' | 'UPDATE' | 'DELETE',
      schema: options?.schema || 'public',
      table,
      filter: options?.filter,
    };

    // Use the properly typed on method for postgres_changes
    // We cast the config to match the expected filter type
    return (channel as RealtimeChannel)
      .on(
        REALTIME_LISTEN_TYPES.POSTGRES_CHANGES,
        changeConfig as RealtimePostgresChangesFilter<'*'>,
        callback as (payload: RealtimePostgresChangesPayload<T>) => void,
      )
      .subscribe();
  }
}

/**
 * Storage utilities
 */
export class SupabaseStorage {
  private client: SupabaseClient;

  constructor() {
    this.client = getSupabaseClient();
  }

  /**
   * Get a storage bucket
   */
  bucket(bucketName: string): ReturnType<SupabaseClient['storage']['from']> {
    return this.client.storage.from(bucketName);
  }

  /**
   * Upload a file
   */
  async upload(
    bucketName: string,
    path: string,
    file: File | ArrayBuffer | string,
    options?: {
      cacheControl?: string;
      contentType?: string;
      upsert?: boolean;
    },
  ): Promise<
    ReturnType<ReturnType<SupabaseClient['storage']['from']>['upload']>
  > {
    return await this.client.storage
      .from(bucketName)
      .upload(path, file, options);
  }

  /**
   * Download a file
   */
  async download(
    bucketName: string,
    path: string,
  ): Promise<
    ReturnType<ReturnType<SupabaseClient['storage']['from']>['download']>
  > {
    return await this.client.storage.from(bucketName).download(path);
  }

  /**
   * Get public URL for a file
   */
  getPublicUrl(bucketName: string, path: string) {
    return this.client.storage.from(bucketName).getPublicUrl(path);
  }

  /**
   * Delete a file
   */
  async remove(
    bucketName: string,
    paths: string[],
  ): Promise<
    ReturnType<ReturnType<SupabaseClient['storage']['from']>['remove']>
  > {
    return await this.client.storage.from(bucketName).remove(paths);
  }
}

// Export utility instances
export const supabaseAuth = new SupabaseAuth();
export const supabaseDb = new SupabaseDatabase();
export const supabaseStorage = new SupabaseStorage();
