/**
 * Runtime environment validator for server‑only secret variables.
 * Import this module at the top of any server‑side file that requires
 * secret env vars. It will throw early if a required variable is missing.
 */
export function requireEnvVar(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

// Export specific validators for the known secrets used by the project.
export const SUPABASE_SERVICE_ROLE_KEY = requireEnvVar('SUPABASE_SERVICE_ROLE_KEY');
export const STRIPE_SECRET_KEY = requireEnvVar('STRIPE_SECRET_KEY');
export const RESEND_API_KEY = requireEnvVar('RESEND_API_KEY');
