/**
 * Centralized application configuration.
 * Values are sourced from environment variables defined in `.env`.
 * See `.env.example` for a list of required variables.
 */

const getEnv = (key: string, defaultValue: string = ''): string => {
  return import.meta.env[key] ?? defaultValue;
};

export const APP_CONFIG = {
  supabase: {
    url: getEnv('VITE_SUPABASE_URL'),
    anonKey: getEnv('VITE_SUPABASE_KEY'),
    serviceRoleKey: getEnv('VITE_SUPABASE_SERVICE_ROLE_KEY'),
  },
  api: {
    baseUrl: getEnv('VITE_API_BASE_URL', '/api'),
    useMock: getEnv('VITE_USE_MOCK', 'false') === 'true',
  }
};
