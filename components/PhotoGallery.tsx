'use client'
import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { Plus } from 'lucide-react'
import { createClientBrowser } from '@/lib/supabase-browser'
import { ensurePublicUserId } from '@/lib/publicUser'

export function PhotoGallery() {
  const [photos, setPhotos] = useState<any[]>([])
  const [recent, setRecent] = useState<any[]>([])
  const [page, setPage] = useState(0)
  const [loading, setLoading] = useState(false)
  const supabaseRef = useRef<ReturnType<typeof createClientBrowser> | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  useEffect(() => { supabaseRef.current = createClientBrowser() }, [])

  async function loadMore() {
    if (loading) return
    setLoading(true)
    try {
      const supabase = supabaseRef.current ?? createClientBrowser()
      const pageSize = 20
      const from = page * pageSize
      const to = from + pageSize - 1
      const { data, error } = await supabase
        .from('Photo')
        .select('*')
        .order('createdAt', { ascending: false })
        .range(from, to)
      if (error) throw error
      setPhotos(prev => [...prev, ...(data || [])])
      setPage(p => p + 1)
    } catch {
      // ignore errors and keep UI responsive
    }
    setLoading(false)
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { loadMore() }, [])

  function openFilePicker() { inputRef.current?.click() }

  async function onFilesSelected(files: FileList | null) {
    if (!files || !files.length) return
    const list = Array.from(files).slice(0, 10)
    for (const file of list) {
      if (file.size > 10 * 1024 * 1024) { alert(`Arquivo muito grande: ${file.name}`); continue }
      const path = `${Date.now()}-${file.name}`.replace(/\s+/g, '_')
      try {
        const supabase = supabaseRef.current ?? createClientBrowser()
        const { data, error } = await supabase.storage.from('photos').upload(path, file, { upsert: false })
        if (error) { console.error(error); alert(error.message); continue }
        const { data: pub } = supabase.storage.from('photos').getPublicUrl(path)
        // Optimistically show in "Recém-enviadas"
        const temp = { id: `tmp-${Date.now()}`, url: pub.publicUrl, thumbUrl: pub.publicUrl }
        setRecent((r) => [temp, ...r].slice(0, 12))

        // Ensure a Public User exists and persist photo metadata directly via Supabase
        const userId = await ensurePublicUserId(supabase)
        const { error: insertErr } = await supabase
          .from('Photo')
          .insert({ url: pub.publicUrl, thumbUrl: pub.publicUrl, isPublic: true, userId })
        if (insertErr) console.warn('Falha ao salvar metadados da foto:', insertErr.message)
      } catch (err: any) {
        alert(err?.message || 'Configure o Supabase (.env.local) para enviar fotos.')
        break
      }
      // reload list to include the newly uploaded photo in the main grid
      setPhotos([]); setPage(0); await loadMore()
    }
  }

  return (
    <section className="px-6 mt-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between">
          <h2 className="text-lg">Galeria de Fotos</h2>
          <button onClick={openFilePicker} aria-label="Adicionar fotos"
            className="rounded-full h-12 w-12 grid place-items-center bg-pop text-ink shadow-lg">
            <Plus />
          </button>
          <input ref={inputRef} type="file" accept="image/*" multiple className="hidden" onChange={(e)=> onFilesSelected(e.target.files)} />
        </div>

        {recent.length > 0 && (
          <div className="mt-4">
            <div className="text-sm opacity-80 mb-2">Recém-enviadas</div>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {recent.map((p) => (
                <div key={p.id} className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg border border-white/20">
                  <Image src={p.thumbUrl || p.url} alt={p.caption || 'Foto'} fill className="object-cover" sizes="96px" />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {photos.map((p) => (
            <div key={p.id} className="relative aspect-square overflow-hidden rounded-xl border border-white/20">
              <Image src={p.thumbUrl || p.url} alt={p.caption || 'Foto'} fill className="object-cover" sizes="(max-width: 768px) 50vw, 25vw" />
            </div>
          ))}
        </div>

        {true && (
          <div className="mt-4 grid place-items-center">
            <button onClick={loadMore} className="px-4 py-2 rounded-xl bg-white/10 border border-white/20 hover:bg-white/15">
              {loading ? 'Carregando…' : 'Carregar mais'}
            </button>
          </div>
        )}
      </div>
    </section>
  )
}
