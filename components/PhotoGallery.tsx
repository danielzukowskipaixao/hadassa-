'use client'
import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { Plus } from 'lucide-react'
import { createClientBrowser } from '@/lib/supabase-browser'

export function PhotoGallery() {
  const [photos, setPhotos] = useState<any[]>([])
  const [cursor, setCursor] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const supabaseRef = useRef<ReturnType<typeof createClientBrowser> | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  useEffect(() => { supabaseRef.current = createClientBrowser() }, [])

  async function loadMore() {
    if (loading) return
    setLoading(true)
    const params = new URLSearchParams()
    if (cursor) params.set('cursor', cursor)
    const res = await fetch(`/api/photos?${params.toString()}`)
    const json = await res.json()
    setPhotos(prev => [...prev, ...json.items])
    setCursor(json.nextCursor)
    setLoading(false)
  }

  useEffect(() => { loadMore() }, [])

  function openFilePicker() { inputRef.current?.click() }

  async function onFilesSelected(files: FileList | null) {
    if (!files || !files.length) return
    const list = Array.from(files).slice(0, 10)
    for (const file of list) {
      if (file.size > 10 * 1024 * 1024) { alert(`Arquivo muito grande: ${file.name}`); continue }
      const path = `${Date.now()}-${file.name}`.replace(/\s+/g, '_')
  const supabase = supabaseRef.current ?? createClientBrowser()
  const { data, error } = await supabase.storage.from('photos').upload(path, file, { upsert: false })
      if (error) { console.error(error); alert(error.message); continue }
      const { data: pub } = supabase.storage.from('photos').getPublicUrl(path)
      await fetch('/api/photos', { method: 'POST', headers: { 'Content-Type':'application/json' }, body: JSON.stringify({ url: pub.publicUrl, isPublic: true }) })
      setPhotos([]); setCursor(null); loadMore()
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

        <div className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {photos.map((p) => (
            <div key={p.id} className="relative aspect-square overflow-hidden rounded-xl border border-white/20">
              <Image src={p.thumbUrl || p.url} alt={p.caption || 'Foto'} fill className="object-cover" sizes="(max-width: 768px) 50vw, 25vw" />
            </div>
          ))}
        </div>

        {cursor && (
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
