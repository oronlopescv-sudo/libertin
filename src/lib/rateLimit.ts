const WINDOW_MS = 60_000

const rateLimitMap = new Map<string, number[]>()

/** Purge les entrées expirées pour éviter que la Map ne grossisse sans fin. */
function sweep(now: number) {
  for (const [key, timestamps] of rateLimitMap) {
    const recent = timestamps.filter((t) => now - t < WINDOW_MS)
    if (recent.length === 0) rateLimitMap.delete(key)
    else rateLimitMap.set(key, recent)
  }
}

let lastSweep = 0

export function checkRateLimit(ip: string, limit: number = 10): boolean {
  const now = Date.now()

  if (now - lastSweep > WINDOW_MS) {
    sweep(now)
    lastSweep = now
  }

  const userRequests = rateLimitMap.get(ip) || []
  const recentRequests = userRequests.filter((t) => now - t < WINDOW_MS)

  if (recentRequests.length >= limit) {
    return false
  }

  rateLimitMap.set(ip, [...recentRequests, now])
  return true
}

/** Adresse IP du client, en tenant compte du reverse proxy de l'hébergeur. */
export function clientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()
  return request.headers.get('x-real-ip') ?? 'unknown'
}

/** Réponse standard quand la limite est atteinte. */
export function tooManyRequests() {
  return Response.json(
    { error: 'Trop de tentatives. Réessayez dans une minute.' },
    { status: 429 }
  )
}
