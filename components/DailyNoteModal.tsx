'use client'
import { useEffect, useState } from 'react'
import { Dialog } from './ui/dialog'
import { todayKey } from '@/lib/date'

export function DailyNoteModal({ open, onClose, dayKey, onSaved }: {
  open: boolean
  onClose: () => void
  dayKey: string
  onSaved?: () => void
}) {
  const [loading, setLoading] = useState(false)
  const [content, setContent] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setLoading(true)
    setError(null)
    fetch(`/api/daily-note/get?dayKey=${dayKey}`).then(async (r) => {
      if (!r.ok) return null
      return r.json()
    }).then((json) => {
      setContent(json?.content ?? '')
    }).finally(() => setLoading(false))
  }, [open, dayKey])

  async function save() {
    setLoading(true)
    setError(null)
    const res = await fetch('/api/daily-note/upsert', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dayKey, content, isPublic: true })
    })
    setLoading(false)
    if (!res.ok) {
      if (res.status === 401) setError('Você precisa estar logado e autorizado para salvar.')
      else if (res.status === 403) setError('Dias futuros são bloqueados.')
      else setError('Erro ao salvar. Tente novamente.')
      return
    }
    onSaved?.()
    onClose()
  }

  return (
    <Dialog open={open} onClose={onClose}>
      <div className="space-y-3">
        <div className="text-sm opacity-80">{dayKey === todayKey() ? 'Hoje' : dayKey}</div>
        <textarea
          aria-label="Recadinho do dia"
          className="w-full min-h-32 rounded-xl p-3 bg-white/10 border border-white/20"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={dayKey === todayKey() ? 'Escreva o recadinho de hoje…' : 'Escreva o recadinho…'}
        />
        {error && <div className="text-sm text-red-300">{error}</div>}
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-3 py-2 rounded-xl border border-white/20">Cancelar</button>
          <button onClick={save} disabled={loading} className="px-3 py-2 rounded-xl bg-pop text-ink">
            {loading ? 'Salvando…' : 'Salvar'}
          </button>
        </div>
      </div>
    </Dialog>
  )
}
