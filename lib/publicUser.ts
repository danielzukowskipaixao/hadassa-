import type { SupabaseClient } from '@supabase/supabase-js'

let cachedPublicUserId: string | null = null

export async function ensurePublicUserId(supabase: SupabaseClient): Promise<string> {
  if (cachedPublicUserId) return cachedPublicUserId
  const email = 'public@local'
  const { data, error } = await supabase
    .from('User')
    .upsert({ email, name: 'Public User', role: 'user' }, { onConflict: 'email' })
    .select('id')
    .single()
  if (error) throw error
  cachedPublicUserId = data.id
  return data.id
}
