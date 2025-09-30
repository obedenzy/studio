
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types'; // We will create this type from our schema

// Note: supabase-js is an isomorphic library. It can be used in
// both Client and Server Components.

export function createSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase URL or anonymous key');
  }

  return createClient<Database>(supabaseUrl, supabaseAnonKey);
}

// This is the server-side client for use in Server Actions and Route Handlers.
// It uses the SERVICE_ROLE_KEY for elevated privileges.
export function createSupabaseServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase URL or service role key');
  }
  
  return createClient<Database>(supabaseUrl, supabaseServiceKey);
}

// This is an admin client, functionally the same as the server client.
// It's good practice to use this when you explicitly need admin-level access.
export function createSupabaseAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase credentials for admin client');
  }
  return createClient<Database>(supabaseUrl, supabaseServiceKey);
}
