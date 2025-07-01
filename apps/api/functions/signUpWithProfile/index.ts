// Supabase Edge Function: signUpWithProfile
// This function creates a user and a profile atomically.
// Place this file in apps/api/functions/signUpWithProfile/index.ts

import { serve } from 'std/server';
import { createClient } from 'supabase-lib';

serve(async (req) => {
  const { email, password } = await req.json();
  const supabase = createClient();

  // 1. Create user via Admin API
  const { data: user, error: userError } = await supabase.auth.admin.createUser(
    {
      email,
      password,
      email_confirm: false,
    },
  );
  if (userError || !user) {
    return new Response(JSON.stringify({ error: userError }), { status: 400 });
  }

  // 2. Create profile
  const { error: profileError } = await supabase.from('profiles').insert({
    id: user.id,
    email: user.email,
  });
  if (profileError) {
    // Rollback: delete the user
    await supabase.auth.admin.deleteUser(user.id);
    return new Response(JSON.stringify({ error: profileError }), {
      status: 400,
    });
  }

  return new Response(JSON.stringify({ user }), { status: 200 });
});
