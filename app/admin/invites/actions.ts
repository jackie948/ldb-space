'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUser, isAdmin } from '@/lib/currentUser'

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // 去掉易混淆字符
  let out = 'LDB-2026-'
  for (let i = 0; i < 4; i++) out += chars[Math.floor(Math.random() * chars.length)]
  return out
}

export async function issueInvite(formData: FormData) {
  const me = await getCurrentUser()
  if (!isAdmin(me)) redirect('/')

  const supabase = createClient()
  const target = String(formData.get('target_user') ?? '').trim() || null
  const role   = String(formData.get('role_hint') ?? 'student')

  const code = generateCode()
  const { error } = await supabase.from('invites').insert({
    code,
    target_user: target || null,
    role_hint: role,
  })
  if (error) throw new Error(error.message)

  revalidatePath('/admin/invites')
}

export async function revokeInvite(code: string) {
  const me = await getCurrentUser()
  if (!isAdmin(me)) redirect('/')
  const supabase = createClient()
  const { error } = await supabase.from('invites').delete().eq('code', code)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/invites')
}
