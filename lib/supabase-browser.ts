import { createClient } from '@supabase/supabase-js'

export function createClientBrowser() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!supabaseUrl || !supabaseAnonKey) {
    if (typeof window !== 'undefined') {
      console.error('[Supabase] Configure NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY em .env.local')
    }
    // Devolve um client "nulo" que lança um erro amigável ao ser utilizado.
    return new Proxy({} as any, {
      get() {
        throw new Error('Supabase não configurado. Preencha .env.local com NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY e reinicie o servidor (npm run dev).')
      },
    })
  }
  return createClient(supabaseUrl, supabaseAnonKey)
}
