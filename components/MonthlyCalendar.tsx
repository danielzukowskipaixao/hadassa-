'use client'
import { useEffect, useMemo, useState } from 'react'
import {
  addDays,
  addMonths,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  startOfMonth,
  startOfWeek,
} from 'date-fns'
import { todayKey, keyFor, isFutureDayKey } from '@/lib/date'
import { ChevronLeft, ChevronRight, Lock } from 'lucide-react'
import { DailyNoteModal } from './DailyNoteModal'

function toDayKey(d: Date) {
  return keyFor(d)
}

export function MonthlyCalendar() {
  const [currentMonth, setCurrentMonth] = useState<Date>(() => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), 1)
  })
  const [selectedDayKey, setSelectedDayKey] = useState<string | null>(null)
  const [autoOpenChecked, setAutoOpenChecked] = useState(false)

  const gridDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 0 })
    const end = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 0 })
    const days: Date[] = []
    let cur = start
    while (cur <= end) {
      days.push(cur)
      cur = addDays(cur, 1)
    }
    return days
  }, [currentMonth])

  const today = todayKey()

  // Auto-open today's note if exists (only once per mount)
  useEffect(() => {
    if (autoOpenChecked) return
    setAutoOpenChecked(true)
    const dk = today
    fetch(`/api/daily-note/get?dayKey=${dk}`).then(async (r) => {
      if (r.ok) {
        const json = await r.json()
        if (json && (json.title || json.content)) {
          setSelectedDayKey(dk)
        }
      }
    })
  }, [autoOpenChecked, today])

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <button
          className="px-2 py-1 rounded-lg border border-white/20 hover:bg-white/10"
          onClick={() => setCurrentMonth((m) => addMonths(m, -1))}
          aria-label="Mês anterior"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div className="font-medium">
          {format(currentMonth, 'MMMM yyyy')}
        </div>
        <button
          className="px-2 py-1 rounded-lg border border-white/20 hover:bg-white/10"
          onClick={() => setCurrentMonth((m) => addMonths(m, 1))}
          aria-label="Próximo mês"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 text-xs opacity-70 mb-2">
        {['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'].map((d) => (
          <div key={d} className="text-center py-1">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {gridDays.map((d) => {
          const dk = toDayKey(d)
          const isOut = !isSameMonth(d, currentMonth)
          const isToday = dk === today
          const future = isFutureDayKey(dk)
          return (
            <button
              key={dk}
              onClick={() => { if (!future) setSelectedDayKey(dk) }}
              disabled={future}
              aria-disabled={future}
              aria-current={isToday ? 'date' : undefined}
              title={future ? 'Dia futuro bloqueado' : dk}
              className={
                `relative aspect-square rounded-xl border border-white/20 text-sm ` +
                `${isOut ? 'opacity-40' : ''} ` +
                `${future ? 'cursor-not-allowed' : 'hover:bg-white/10'} ` +
                `${isToday ? 'bg-pop/20' : 'bg-white/5'}`
              }
            >
              <div className="absolute top-1 left-1 text-xs">{format(d, 'd')}</div>
              {future && <Lock className="absolute bottom-1 right-1 h-3 w-3 opacity-70" />}
            </button>
          )
        })}
      </div>

      <DailyNoteModal
        open={!!selectedDayKey}
        dayKey={selectedDayKey || ''}
        onClose={() => setSelectedDayKey(null)}
      />
    </div>
  )
}
