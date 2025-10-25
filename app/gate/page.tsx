"use client"
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

export default function GatePage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { inputRef.current?.focus() }, [])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch('/api/gate/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      })
      if (!res.ok) {
        setError('Senha incorreta, tente novamente.')
      } else {
        router.replace('/')
      }
    } catch (err) {
      setError('Falha ao enviar. Verifique sua conexão.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen grid place-items-center text-foreground">
      <div className="bg-floral" />
      <div className="glass p-6 w-full max-w-sm">
        <h1 className="text-xl mb-2">Hadassah • Memórias</h1>
        <p className="opacity-80 mb-4">Digite a senha para entrar.</p>
        <form onSubmit={onSubmit} className="space-y-3" aria-label="Portão de senha">
          <label className="block">
            <span className="sr-only">Senha</span>
            <div className="relative">
              <input
                ref={inputRef}
                type={show ? 'text' : 'password'}
                placeholder="Digite a senha"
                className="w-full rounded-xl p-3 bg-white/10 border border-white/20"
                value={password}
                onChange={(e)=> setPassword(e.target.value)}
                aria-label="Senha"
              />
              <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-sm opacity-80 hover:opacity-100"
                onClick={() => setShow((s)=>!s)}
                aria-label={show ? 'Ocultar senha' : 'Mostrar senha'}
              >{show ? 'Ocultar' : 'Mostrar'}</button>
            </div>
          </label>
          {error && <div role="status" className="text-sm text-red-300">{error}</div>}
          <div className="flex justify-end">
            <button type="submit" disabled={submitting} className="px-4 py-2 rounded-xl bg-pop text-ink">
              {submitting ? 'Entrando…' : 'Entrar'}
            </button>
          </div>
        </form>
      </div>
    </main>
  )
}
