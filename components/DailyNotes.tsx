'use client'
import { useEffect, useState } from 'react'
import { todayKey, isFutureDayKey } from '@/lib/date'
import { motion } from 'framer-motion'
import { Lock } from 'lucide-react'

export function DailyNotes() {
  const [open, setOpen] = useState(false)
  const [content, setContent] = useState<string | null>(null)
  const [dayKey, setDayKey] = useState(todayKey())

  useEffect(() => {
    const dk = todayKey()
    setDayKey(dk)
    fetch(`/api/daily-note?dayKey=${dk}`).then(async (r) => {
      if (r.ok) {
        const json = await r.json()
        setContent(json?.content ?? null)
        setOpen(true)
      } else {
        setContent(null)
        setOpen(true)
      }
    })
  }, [])

  // Simplified calendar strip: show last 7 days and next 3 (locked)
  const days = Array.from({ length: 10 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    const key = `${d.getFullYear().toString().padStart(4,'0')}-${(d.getMonth()+1).toString().padStart(2,'0')}-${d.getDate().toString().padStart(2,'0')}`
    return key
  })

  return (
    <section className="px-6 mt-6">
      <div className="max-w-5xl mx-auto glass p-4">
        <h2 className="text-lg mb-3">Recadinho do Dia</h2>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {days.map((key) => {
            const locked = isFutureDayKey(key)
            const isToday = key === dayKey
            return (
              <button key={key} disabled={locked}
                className={`px-3 py-2 rounded-xl border border-white/20 ${isToday ? 'bg-pop/20' : 'bg-white/10'} ${locked ? 'cursor-not-allowed opacity-50' : 'hover:bg-white/15'}`}
                title={locked ? 'Futuro bloqueado' : key}
                onClick={() => {
                  if (locked) return
                  fetch(`/api/daily-note?dayKey=${key}`).then(r => r.ok ? r.json() : null).then(json => {
                    setDayKey(key)
                    setContent(json?.content ?? null)
                    setOpen(true)
                  })
                }}>
                <div className="text-sm">{key.slice(5)}</div>
                {locked && <Lock className="w-4 h-4" />}
              </button>
            )
          })}
        </div>

        {open && (
          <motion.div initial={{opacity:0, y:6}} animate={{opacity:1, y:0}} className="mt-4 p-4 rounded-xl bg-white/10 border border-white/20">
            <h3 className="text-pop mb-2">{dayKey === todayKey() ? 'Hoje' : dayKey}</h3>
            {content ? (
              <p className="opacity-90 leading-relaxed">{content}</p>
            ) : (
              <p className="opacity-70">Sem recadinho ainda. {dayKey === todayKey() ? 'Escreva algo fofo para hoje no painel!' : ''}</p>
            )}
          </motion.div>
        )}
      </div>
    </section>
  )
}
