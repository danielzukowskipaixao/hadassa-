import { cookies } from 'next/headers'
import { createServerClient, type CookieOptions } from '@supabase/ssr'

// Prefer non-public envs on the server, but fall back to NEXT_PUBLIC_* if needed
const SUPABASE_URL = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export function createClientServer() {
  // If envs are missing, return a minimal stub that behaves as unauthenticated
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[supabase-server] SUPABASE_URL/ANON_KEY ausentes. Preencha .env.local (NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY).')
    }
    return {
      auth: {
        async getUser() {
          return { data: { user: null }, error: new Error('Supabase não configurado') }
        },
      },
    } as any
  }

  const cookieStore = cookies()
  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
      set(name: string, value: string, options: CookieOptions) {
        try { cookieStore.set({ name, value, ...options }) } catch {}
      },
      remove(name: string, options: CookieOptions) {
        try { cookieStore.set({ name, value: '', ...options }) } catch {}
      },
    },
  })
}
