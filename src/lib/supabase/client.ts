import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';
import { env } from '@/lib/env';

export const supabaseBrowser = createClient<Database>(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);
