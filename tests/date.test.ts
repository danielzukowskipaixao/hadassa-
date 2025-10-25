import { describe, it, expect } from 'vitest'
import { todayKey, isFutureDayKey } from '@/lib/date'

describe('date utils', () => {
  it('should mark future day as blocked', () => {
    const today = todayKey()
    const next = new Date()
    next.setDate(next.getDate() + 1)
    const nextKey = `${next.getFullYear().toString().padStart(4,'0')}-${(next.getMonth()+1).toString().padStart(2,'0')}-${next.getDate().toString().padStart(2,'0')}`
    expect(isFutureDayKey(nextKey)).toBe(true)
    expect(isFutureDayKey(today)).toBe(false)
  })
})
