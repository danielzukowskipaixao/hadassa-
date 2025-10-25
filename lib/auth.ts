import { createClientServer } from './supabase-server'

export type SessionUser = {
  id: string
  email: string
  role?: 'user' | 'admin'
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  const supabase = createClientServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  // role can be resolved from DB if needed; for simplicity, check email in whitelist env
  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL
  const role: 'user' | 'admin' = user.email && user.email === adminEmail ? 'admin' : 'user'
  return { id: user.id, email: user.email ?? '', role }
}

export function isEmailAllowedToWrite(email?: string | null) {
  const allowed = (process.env.NEXT_PUBLIC_ALLOWED_EMAILS || '')
    .split(',')
    .map((e: string) => e.trim().toLowerCase())
    .filter(Boolean)
  if (!email) return false
  return allowed.includes(email.toLowerCase())
}
