import { createClient } from '@supabase/supabase-js';

import { getSupabaseConfig } from './lib/supabase/supabase';

const { url, anonKey } = getSupabaseConfig();

export const supabase = createClient(url, anonKey);
