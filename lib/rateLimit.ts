const memory = new Map<string, { count: number; reset: number }>()

export function rateLimit(key: string, limit = 20, windowMs = 60_000) {
  const now = Date.now()
  const item = memory.get(key)
  if (!item || item.reset < now) {
    memory.set(key, { count: 1, reset: now + windowMs })
    return { ok: true, remaining: limit - 1 }
  }
  if (item.count >= limit) {
    return { ok: false, retryAfter: item.reset - now }
  }
  item.count++
  return { ok: true, remaining: limit - item.count }
}
