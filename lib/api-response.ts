import { NextResponse } from 'next/server';

/**
 * Helper to create a consistent JSON error response.
 * Usage: `return apiError('Invalid input', 400);`
 */
export function apiError(message: string, status: number = 400) {
  return NextResponse.json({ error: message }, { status });
}

/**
 * Helper to create a successful JSON response.
 * Usage: `return apiSuccess(data);`
 */
export function apiSuccess<T>(data: T, status: number = 200) {
  return NextResponse.json(data, { status });
}
