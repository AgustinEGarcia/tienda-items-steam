import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';
import { env } from '@/lib/env';
import { cleanSupabaseUrl } from '@/lib/supabase/urlHelper';

export const supabaseBrowser = createClient<Database>(
  cleanSupabaseUrl(env.NEXT_PUBLIC_SUPABASE_URL),
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

