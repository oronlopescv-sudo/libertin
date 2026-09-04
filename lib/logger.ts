/**
 * Simple structured logger that sanitises objects before printing.
 * Removes any key that contains the word "token" or "secret" (case‑insensitive).
 */
export function logError(message: string, meta?: Record<string, any>) {
  const sanitized = sanitize(meta);
  console.error(message, sanitized);
}

export function logInfo(message: string, meta?: Record<string, any>) {
  const sanitized = sanitize(meta);
  console.info(message, sanitized);
}

function sanitize(obj?: Record<string, any>) {
  if (!obj) return undefined;
  const clean: Record<string, any> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (/token|secret/i.test(k)) {
      // hide secret values
      clean[k] = '[REDACTED]';
    } else {
      clean[k] = v;
    }
  }
  return clean;
}
