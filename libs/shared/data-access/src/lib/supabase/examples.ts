/**
 * Example usage of the Supabase data access library
 *
 * This file demonstrates how to use the Supabase client in different scenarios
 */

import type { AuthChangeEvent, Session } from '@supabase/supabase-js';
import {
  createSupabaseAdminClient,
  detectEnvironment,
  supabase,
  supabaseAuth,
  supabaseDb,
  supabaseStorage,
} from './index';

/**
 * Example: User authentication flow
 */
export async function exampleAuthFlow() {
  try {
    // Sign up a new user
    const { data: signUpData, error: signUpError } = await supabaseAuth.signUp(
      'user@example.com',
      'securePassword123',
      { redirectTo: 'https://yourapp.com/welcome' },
    );

    if (signUpError) {
      console.error('Sign up error:', signUpError);
      return;
    }

    console.log('User signed up:', signUpData.user?.email);

    // Sign in existing user
    const { data: signInData, error: signInError } = await supabaseAuth.signIn(
      'user@example.com',
      'securePassword123',
    );

    if (signInError) {
      console.error('Sign in error:', signInError);
      return;
    }

    console.log('User signed in:', signInData.user?.email);

    // Get current session
    const { data: session } = await supabaseAuth.getSession();
    console.log('Current session:', session.session?.user?.email);

    // Listen to auth state changes
    // const {
    //   data: { subscription: _authSubscription },
    // } = supabaseAuth.onAuthStateChange((event: AuthChangeEvent, session: Session | null) => {
    //   console.log('Auth state changed:', event, session?.user?.email);
    // });

    supabaseAuth.onAuthStateChange(
      (event: AuthChangeEvent, session: Session | null) => {
        console.log('Auth state changed:', event, session?.user?.email);
      },
    );

    // Remember to unsubscribe when done
    // authSubscription.unsubscribe();
  } catch (error) {
    console.error('Auth flow error:', error);
  }
}

/**
 * Example: Database operations
 */
export async function exampleDatabaseOperations() {
  try {
    // Insert data
    const { data: insertData, error: insertError } = await supabaseDb
      .table('users')
      .insert([
        { name: 'John Doe', email: 'john@example.com' },
        { name: 'Jane Smith', email: 'jane@example.com' },
      ])
      .select();

    if (insertError) {
      console.error('Insert error:', insertError);
      return;
    }

    console.log('Inserted users:', insertData);

    // Query data
    const { data: users, error: queryError } = await supabaseDb
      .table('users')
      .select('*')
      .eq('email', 'john@example.com');

    if (queryError) {
      console.error('Query error:', queryError);
      return;
    }

    console.log('Found users:', users);

    // Update data
    const { data: updateData, error: updateError } = await supabaseDb
      .table('users')
      .update({ name: 'John Updated' })
      .eq('email', 'john@example.com')
      .select();

    if (updateError) {
      console.error('Update error:', updateError);
      return;
    }

    console.log('Updated users:', updateData);

    // Real-time subscription
    // const _subscription = supabaseDb.subscribe(
    //   'users',
    //   (payload: Record<string, unknown>) => {
    //     console.log('User table changed:', payload);
    //   },
    //   { event: '*' },
    // );

    supabaseDb.subscribe(
      'users',
      (payload: Record<string, unknown>) => {
        console.log('User table changed:', payload);
      },
      { event: '*' },
    );

    // Clean up subscription when done
    // subscription.unsubscribe();
  } catch (error) {
    console.error('Database operations error:', error);
  }
}

/**
 * Example: File storage operations
 */
export async function exampleStorageOperations() {
  try {
    // Example file (in a real app, this would come from user input)
    const file = new File(['Hello, world!'], 'hello.txt', {
      type: 'text/plain',
    });

    // Upload file
    const { data: uploadData, error: uploadError } =
      await supabaseStorage.upload('documents', `user-123/hello.txt`, file, {
        contentType: 'text/plain',
        upsert: true,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return;
    }

    console.log('File uploaded:', uploadData);

    // Get public URL
    const { data: urlData } = supabaseStorage.getPublicUrl(
      'documents',
      'user-123/hello.txt',
    );
    console.log('Public URL:', urlData.publicUrl);

    // Download file
    const { data: downloadData, error: downloadError } =
      await supabaseStorage.download('documents', 'user-123/hello.txt');

    if (downloadError) {
      console.error('Download error:', downloadError);
      return;
    }

    console.log('Downloaded file:', downloadData);

    // List files in bucket
    const { data: listData, error: listError } = await supabaseStorage
      .bucket('documents')
      .list('user-123');

    if (listError) {
      console.error('List error:', listError);
      return;
    }

    console.log('Files in bucket:', listData);
  } catch (error) {
    console.error('Storage operations error:', error);
  }
}

/**
 * Example: Edge function / Server-side operations
 */
export async function exampleEdgeFunctionOperations() {
  try {
    const env = detectEnvironment();
    console.log('Environment:', env);

    // Only use admin client in server-side environments
    if (env.isEdgeFunction || env.platform === 'edge') {
      const adminClient = createSupabaseAdminClient();

      // Admin operations bypass Row Level Security
      const { data: allUsers, error } = await adminClient
        .from('users')
        .select('*');

      if (error) {
        console.error('Admin query error:', error);
        return;
      }

      console.log('All users (admin access):', allUsers);

      // Example: Call a database function
      const { data: functionResult, error: functionError } =
        await adminClient.rpc('admin_get_user_stats');

      if (functionError) {
        console.error('Function error:', functionError);
        return;
      }

      console.log('Function result:', functionResult);
    } else {
      console.log(
        'Admin client should only be used in server-side environments',
      );
    }
  } catch (error) {
    console.error('Edge function operations error:', error);
  }
}

/**
 * Example: Direct client usage
 */
export async function exampleDirectClientUsage() {
  try {
    // Use the singleton client directly
    const { data, error } = await supabase
      .from('users')
      .select('id, name, email')
      .limit(10);

    if (error) {
      console.error('Direct client error:', error);
      return;
    }

    console.log('Users from direct client:', data);

    // Chain operations
    const { data: filteredUsers, error: filterError } = await supabase
      .from('users')
      .select('*')
      .ilike('name', '%john%')
      .order('created_at', { ascending: false });

    if (filterError) {
      console.error('Filter error:', filterError);
      return;
    }

    console.log('Filtered users:', filteredUsers);
  } catch (error) {
    console.error('Direct client usage error:', error);
  }
}

/**
 * Example: Error handling patterns
 */
export async function exampleErrorHandling() {
  try {
    // Always destructure data and error
    const { data, error } = await supabaseDb
      .table('users')
      .select('*')
      .eq('id', 'non-existent-id');

    // Check for errors before using data
    if (error) {
      console.error('Database error:', error.message);

      // Handle different types of errors
      if (error.code === 'PGRST116') {
        console.log('No rows found');
      } else if (error.code === '42P01') {
        console.log('Table does not exist');
      }

      return;
    }

    // Safe to use data here
    console.log('Query successful:', data);
  } catch (error) {
    // Handle unexpected errors
    console.error('Unexpected error:', error);
  }
}

/**
 * Run all examples (for testing purposes)
 */
export async function runAllExamples() {
  console.log('🚀 Running Supabase examples...\n');

  console.log('1. Environment Detection:');
  const env = detectEnvironment();
  console.log(env);

  // Note: These examples require a real Supabase project and proper environment setup
  // Uncomment to run with a real project:

  // console.log('\n2. Authentication Flow:');
  // await exampleAuthFlow();

  // console.log('\n3. Database Operations:');
  // await exampleDatabaseOperations();

  // console.log('\n4. Storage Operations:');
  // await exampleStorageOperations();

  // console.log('\n5. Direct Client Usage:');
  // await exampleDirectClientUsage();

  // console.log('\n6. Error Handling:');
  // await exampleErrorHandling();

  console.log('\n✅ Examples completed!');
}

// Export for use in other files
export default {
  exampleAuthFlow,
  exampleDatabaseOperations,
  exampleStorageOperations,
  exampleEdgeFunctionOperations,
  exampleDirectClientUsage,
  exampleErrorHandling,
  runAllExamples,
};
