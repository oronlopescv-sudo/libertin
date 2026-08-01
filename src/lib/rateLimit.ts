const rateLimitMap = new Map<string, number[]>()

export function checkRateLimit(ip: string, limit: number = 10): boolean {
  const now = Date.now()
  const userRequests = rateLimitMap.get(ip) || []
  const recentRequests = userRequests.filter(t => now - t < 60000)
  
  if (recentRequests.length >= limit) {
    return false
  }
  
  rateLimitMap.set(ip, [...recentRequests, now])
  return true
}
