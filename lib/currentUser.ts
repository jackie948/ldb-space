import { createClient } from '@/lib/supabase/server'
import { isSupabaseConfigured } from '@/lib/mock'
import type { LDBUser } from '@/lib/types'

/** 返回登录后的 public.users 行；未登录 / 未配置 Supabase 时返回 null。 */
export async function getCurrentUser(): Promise<LDBUser | null> {
  if (!isSupabaseConfigured()) return null
  const supabase = createClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()
  if (!authUser) return null

  const { data } = await supabase.from('users').select('*').eq('id', authUser.id).maybeSingle()
  return (data as LDBUser) ?? null
}

export function isStaff(u: LDBUser | null): boolean {
  return !!u && (u.role === 'l1' || u.role === 'l2' || u.role === 'admin')
}
export function isAdmin(u: LDBUser | null): boolean {
  return !!u && u.role === 'admin'
}
