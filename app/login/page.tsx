'use client'
import { useEffect, useRef, useState } from 'react'
import { createClientBrowser } from '@/lib/supabase-browser'
import { z } from 'zod'
import { motion } from 'framer-motion'

const EmailSchema = z.object({ email: z.string().email() })

export default function LoginPage() {
  const supabaseRef = useRef<ReturnType<typeof createClientBrowser> | null>(null)
  useEffect(() => { supabaseRef.current = createClientBrowser() }, [])
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle'|'loading'|'sent'|'error'>('idle')
  const [message, setMessage] = useState('')

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const parsed = EmailSchema.safeParse({ email })
    if (!parsed.success) { setMessage('E-mail inválido'); setStatus('error'); return }

    setStatus('loading')
    try {
      const supabase = supabaseRef.current ?? createClientBrowser()
      const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: `${window.location.origin}/` } })
      if (error) { setMessage(error.message); setStatus('error') }
      else { setMessage('Enviamos um link mágico para seu e-mail.'); setStatus('sent') }
    } catch (err: any) {
      setMessage(err?.message || 'Configure o Supabase em .env.local');
      setStatus('error')
    }
  }

  return (
    <main className="min-h-screen grid place-items-center p-6">
      <div className="glass p-6 w-full max-w-md">
        <h1 className="text-2xl mb-3 text-pop">Entrar</h1>
        <p className="text-sm mb-4 opacity-80">Acesse com seu e-mail (link mágico). Apenas e-mails autorizados podem escrever.</p>
        <form onSubmit={onSubmit} className="grid gap-3">
          <input className="rounded-lg p-3 bg-white/10 border border-white/20" placeholder="hadassah@exemplo.com" value={email} onChange={(e)=> setEmail(e.target.value)} />
          <button className="rounded-xl bg-pop/90 hover:bg-pop text-ink py-3 font-medium" disabled={status==='loading'}>
            {status==='loading' ? 'Enviando…' : 'Enviar link mágico'}
          </button>
        </form>
        {message && (
          <motion.p initial={{opacity:0, y:4}} animate={{opacity:1, y:0}} className="mt-3 text-sm text-pastel-blue">
            {message}
          </motion.p>
        )}
      </div>
    </main>
  )
}
