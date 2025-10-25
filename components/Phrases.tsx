'use client'
import { useEffect, useState } from 'react'

export function Phrases() {
  const [list, setList] = useState<any[]>([])
  const [text, setText] = useState('')

  async function load() {
    const res = await fetch('/api/phrases')
    const json = await res.json()
    setList(json.items)
  }

  useEffect(() => { load() }, [])

  async function add() {
    if (!text.trim()) return
    const res = await fetch('/api/phrases', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text, isPublic: true }) })
    if (res.ok) { setText(''); load() } else { alert('É preciso estar autenticado e autorizado.') }
  }

  return (
    <section className="px-6 mt-8">
      <div className="max-w-5xl mx-auto glass p-4">
        <h2 className="text-lg mb-3">Frases/Recadinhos</h2>
        <div className="flex gap-2">
          <input className="flex-1 rounded-xl p-3 bg-white/10 border border-white/20" value={text} onChange={(e)=> setText(e.target.value)} placeholder="Escreva algo fofo…" />
          <button onClick={add} className="rounded-xl px-4 bg-pop text-ink">Enviar</button>
        </div>
        <ul className="mt-4 grid gap-2">
          {list.map((p) => (
            <li key={p.id} className="p-3 rounded-xl bg-white/10 border border-white/20">
              <div className="text-sm opacity-70">{new Date(p.createdAt).toLocaleString()}</div>
              <div>{p.text}</div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
