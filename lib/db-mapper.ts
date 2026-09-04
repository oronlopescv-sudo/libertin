/**
 * Utility to map database snake_case fields to camelCase JavaScript objects.
 * Example usage:
 *   const user = mapDbToJs(dbRow);
 */
export function mapDbToJs<T>(dbObj: Record<string, any>): T {
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(dbObj)) {
    const camelKey = key.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
    result[camelKey] = value;
  }
  return result as T;
}
