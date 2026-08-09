/**
 * Input validation utilities for xlibertine
 * Prevents XSS, injection attacks, and invalid data
 */

export class ValidationError extends Error {
  constructor(field: string, message: string) {
    super(`${field}: ${message}`);
    this.name = 'ValidationError';
  }
}

/**
 * Validate email format
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 255;
}

/**
 * Validate password strength
 * Requirements: 8+ chars, 1 uppercase, 1 number
 */
export function validatePassword(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Au moins 8 caractères');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Au moins 1 majuscule');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Au moins 1 chiffre');
  }
  if (password.length > 128) {
    errors.push('Maximum 128 caractères');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate username (alphanumeric, 3-20 chars, no spaces)
 */
export function validateUsername(username: string): boolean {
  const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;
  return usernameRegex.test(username);
}

/**
 * Validate date of birth (must be 18+)
 */
export function validateDateOfBirth(dateString: string): boolean {
  const birthDate = new Date(dateString);
  const today = new Date();
  const age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    return age - 1 >= 18;
  }

  return age >= 18;
}

/**
 * Sanitize text input (remove HTML, limit length)
 */
export function sanitizeText(text: string, maxLength: number = 500): string {
  return text
    .trim()
    .slice(0, maxLength)
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/[<>]/g, ''); // Remove angle brackets
}

/**
 * Sanitize bio/description (allow newlines, remove HTML)
 */
export function sanitizeBio(text: string, maxLength: number = 1000): string {
  return text
    .trim()
    .slice(0, maxLength)
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/[<>]/g, ''); // Remove angle brackets
}

/**
 * Validate URL
 */
export function validateUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate location coordinates
 */
export function validateCoordinates(
  lat: number | undefined,
  lng: number | undefined
): boolean {
  if (lat === undefined || lng === undefined) return false;
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
}

/**
 * Validate file upload
 */
export function validateFileUpload(
  file: File,
  maxSizeMB: number = 5,
  allowedTypes: string[] = ['image/jpeg', 'image/png', 'image/webp']
): { valid: boolean; error?: string } {
  const maxBytes = maxSizeMB * 1024 * 1024;

  if (file.size > maxBytes) {
    return { valid: false, error: `Fichier trop volumineux (max ${maxSizeMB}MB)` };
  }

  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Format de fichier non autorisé' };
  }

  return { valid: true };
}

/**
 * Validate group name
 */
export function validateGroupName(name: string): boolean {
  return name.length >= 3 && name.length <= 100 && !/[<>]/.test(name);
}

/**
 * Validate message content
 */
export function validateMessage(content: string): { valid: boolean; error?: string } {
  const trimmed = content.trim();

  if (trimmed.length === 0) {
    return { valid: false, error: 'Le message ne peut pas être vide' };
  }

  if (trimmed.length > 2000) {
    return { valid: false, error: 'Le message est trop long (max 2000 caractères)' };
  }

  return { valid: true };
}

/**
 * Rate limit check (simple in-memory, use Redis in production)
 */
const rateLimitStore = new Map<string, number[]>();

export function checkRateLimit(
  key: string,
  maxRequests: number = 10,
  windowSeconds: number = 60
): boolean {
  const now = Date.now();
  const windowStart = now - windowSeconds * 1000;

  if (!rateLimitStore.has(key)) {
    rateLimitStore.set(key, []);
  }

  const timestamps = rateLimitStore.get(key)!;
  const validTimestamps = timestamps.filter((t) => t > windowStart);

  if (validTimestamps.length >= maxRequests) {
    return false; // Rate limited
  }

  validTimestamps.push(now);
  rateLimitStore.set(key, validTimestamps);

  return true;
}

/**
 * Validate interests array
 */
export function validateInterests(
  interests: string[],
  allowedInterests: string[] = [
    'Clubs libertins',
    'Soirées privées',
    'Échangisme soft',
    'Échangisme complet',
    'Gang bang',
    'Voyeurisme',
    'Exhibitionnisme',
    'BDSM',
    'Fétichisme',
  ]
): boolean {
  if (!Array.isArray(interests)) return false;
  if (interests.length === 0 || interests.length > 10) return false;

  return interests.every((interest) => allowedInterests.includes(interest));
}
