# Supabase Data Access Library

This library provides a configured Supabase client for the Weople2 workspace, optimized for edge functions, Netlify deployment, and cross-platform compatibility.

This library was generated with [Nx](https://nx.dev).

## Features

- ✅ **Cross-platform compatibility** (Web, Mobile, Edge Functions)
- ✅ **Environment-based configuration** with multiple naming conventions
- ✅ **Edge function optimized** (Netlify, Vercel, Cloudflare)
- ✅ **Singleton client pattern** for optimal performance
- ✅ **Type-safe utilities** for auth, database, and storage
- ✅ **Real-time subscriptions** with rate limiting
- ✅ **Admin client** for server-side operations

## Quick Start

### 1. Environment Setup

Copy `.env.example` to `.env.local` and configure your Supabase credentials:

```bash
# Required
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here

# Optional (for server-side operations)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

### 2. Basic Usage

```typescript
import { supabase, supabaseAuth, supabaseDb } from '@weople2/data-access';

// Direct client usage
const { data, error } = await supabase.from('users').select('*');

// Using auth utilities
const user = await supabaseAuth.signIn('user@example.com', 'password');

// Using database utilities
const users = await supabaseDb.table('users').select('*');
```

### 3. Authentication

```typescript
import { supabaseAuth } from '@weople2/data-access';

// Sign up
const { data, error } = await supabaseAuth.signUp(
  'user@example.com',
  'password',
  { redirectTo: 'https://yourapp.com/dashboard' },
);

// Sign in with OAuth
await supabaseAuth.signInWithOAuth('google', {
  redirectTo: 'https://yourapp.com/dashboard',
});

// Listen to auth changes
supabaseAuth.onAuthStateChange((event, session) => {
  console.log('Auth event:', event, session);
});
```

### 4. Database Operations

```typescript
import { supabaseDb } from '@weople2/data-access';

// Basic CRUD
const { data } = await supabaseDb
  .table('users')
  .insert({ name: 'John Doe', email: 'john@example.com' });

const { data } = await supabaseDb.table('users').select('*').eq('id', userId);

// Real-time subscriptions
supabaseDb.subscribe(
  'users',
  (payload) => {
    console.log('User updated:', payload);
  },
  { event: 'UPDATE' },
);

// RPC calls
const result = await supabaseDb.rpc('get_user_stats', { user_id: 123 });
```

### 5. File Storage

```typescript
import { supabaseStorage } from '@weople2/data-access';

// Upload file
const { data, error } = await supabaseStorage.upload(
  'avatars',
  `user-${userId}/avatar.jpg`,
  file,
  { contentType: 'image/jpeg' },
);

// Get public URL
const { data } = supabaseStorage.getPublicUrl('avatars', 'user-123/avatar.jpg');
```

## Edge Functions & Netlify Deployment

The client automatically detects edge function environments and optimizes configuration:

- **Session persistence**: Disabled in edge functions
- **Auto-refresh**: Optimized for serverless
- **Headers**: Includes edge runtime detection

### Netlify Functions Example

```typescript
// netlify/edge-functions/api.ts
import { createSupabaseAdminClient } from '@weople2/data-access';

export default async (request: Request) => {
  const supabase = createSupabaseAdminClient();

  const { data } = await supabase.from('users').select('*');

  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' },
  });
};
```

## Building

Run `nx build data-access` to build the library.

## Running unit tests

Run `nx test data-access` to execute the unit tests via [Vitest](https://vitest.dev/).
