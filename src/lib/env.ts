import { z } from 'zod';

const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z
    .string()
    .url('NEXT_PUBLIC_SUPABASE_URL debe ser una URL válida')
    .optional(),
  SUPABASE_URL: z
    .string()
    .url('SUPABASE_URL debe ser una URL válida')
    .optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional(),
  SUPABASE_ANON_KEY: z.string().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  ADMIN_PASSWORD: z
    .string()
    .min(4, 'ADMIN_PASSWORD debe tener al menos 4 caracteres')
    .default('admin1234'),
  SESSION_SECRET: z
    .string()
    .min(16, 'SESSION_SECRET debe tener al menos 16 caracteres')
    .default('default-session-secret-must-be-changed-in-prod'),
  DEFAULT_APP_ID: z.coerce.number().int().positive().default(730),
  DEFAULT_CONTEXT_ID: z.coerce.number().int().positive().default(2),
  STEAM_CACHE_TTL_MINUTES: z.coerce.number().int().positive().default(60),
  MAX_MANAGED_ACCOUNTS: z.coerce.number().int().positive().default(5),
  STEAM_PRICE_DELAY_MS: z.coerce.number().int().positive().default(2500),
}).transform((val) => {
  return {
    ...val,
    NEXT_PUBLIC_SUPABASE_URL:
      val.NEXT_PUBLIC_SUPABASE_URL || val.SUPABASE_URL || 'https://placeholder.supabase.co',
    NEXT_PUBLIC_SUPABASE_ANON_KEY:
      val.NEXT_PUBLIC_SUPABASE_ANON_KEY || val.SUPABASE_ANON_KEY || 'placeholder-anon-key',
  };
});

export type Env = z.infer<typeof envSchema>;

export function parseEnv(rawEnv: Record<string, unknown> = process.env): Env {
  const parsed = envSchema.safeParse(rawEnv);

  if (!parsed.success) {
    const errorMessages = parsed.error.issues
      .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
      .join('\n');
    console.error('❌ Error de validación en variables de entorno:\n', errorMessages);
    throw new Error(`Variables de entorno inválidas:\n${errorMessages}`);
  }

  return parsed.data;
}

export const env = parseEnv(process.env);
