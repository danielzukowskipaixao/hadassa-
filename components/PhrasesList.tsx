'use client'
import { useEffect, useState } from 'react'
import { createClientBrowser } from '@/lib/supabase-browser'

type Phrase = {
  id: string
  text: string
  createdAt: string
  isPublic: boolean
  userId?: string
}

export function PhrasesList() {
  const [items, setItems] = useState<Phrase[]>([])
  const [page, setPage] = useState(0)
  const [loading, setLoading] = useState(false)
  const supabase = createClientBrowser()

  async function loadMore() {
    if (loading) return
    setLoading(true)
    try {
      const pageSize = 20
      const from = page * pageSize
      const to = from + pageSize - 1
      const { data, error } = await supabase
        .from('Phrase')
        .select('*')
        .order('createdAt', { ascending: false })
        .range(from, to)
      if (error) throw error
      setItems((prev) => [...prev, ...(data || [])])
      setPage((p) => p + 1)
    } catch {
      // network or JSON error — keep calm and carry on
    }
    setLoading(false)
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { loadMore() }, [])

  // Event listeners for optimistic updates from PhrasesForm
  useEffect(() => {
    function onCreated(e: any) { setItems((prev) => [e.detail, ...prev]) }
    function onRevert(e: any) { setItems((prev) => prev.filter((p) => p.id !== e.detail)) }
    function onReplace(e: any) {
      const { tempId, real } = e.detail
      setItems((prev) => prev.map((p) => (p.id === tempId ? real : p)))
    }
    window.addEventListener('phrase:created' as any, onCreated)
    window.addEventListener('phrase:revert' as any, onRevert)
    window.addEventListener('phrase:replace' as any, onReplace)
    return () => {
      window.removeEventListener('phrase:created' as any, onCreated)
      window.removeEventListener('phrase:revert' as any, onRevert)
      window.removeEventListener('phrase:replace' as any, onReplace)
    }
  }, [])

  async function onDelete(id: string) {
    const prev = items
    setItems((cur) => cur.filter((p) => p.id !== id))
    const { error } = await supabase.from('Phrase').delete().eq('id', id)
    if (error) { setItems(prev); alert('Erro ao excluir.') }
  }

  return (
    <div className="mt-4">
      <ul className="grid gap-2">
        {items.map((p) => (
          <li key={p.id} className="p-3 rounded-xl bg-white/10 border border-white/20">
            <div className="text-xs opacity-70">{new Date(p.createdAt).toLocaleString()}</div>
            <div className="whitespace-pre-wrap leading-relaxed">{p.text}</div>
            <div className="flex justify-end gap-3 mt-2">
              <button onClick={() => onDelete(p.id)} className="text-sm opacity-80 hover:opacity-100 underline">Excluir</button>
            </div>
          </li>
        ))}
      </ul>

      {true && (
        <div className="mt-4 grid place-items-center">
          <button onClick={loadMore} className="px-4 py-2 rounded-xl bg-white/10 border border-white/20 hover:bg-white/15">
            {loading ? 'Carregando…' : 'Carregar mais'}
          </button>
        </div>
      )}
    </div>
  )
}
