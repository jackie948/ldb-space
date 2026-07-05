'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function claimInvite(formData: FormData) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const code = String(formData.get('code') ?? '').trim().toUpperCase()
  if (!code) throw new Error('请填写邀请码')

  const { data, error } = await supabase.rpc('claim_invite', { p_code: code })
  if (error) throw new Error(error.message)

  revalidatePath('/', 'layout')
  if (data?.handle) redirect(`/u/${data.handle}?claimed=1`)
  redirect('/welcome?step=profile')
}

export async function createProfile(formData: FormData) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const handle = String(formData.get('handle') ?? '').trim().toLowerCase()
  const name   = String(formData.get('name') ?? '').trim()

  if (!handle || !name) throw new Error('handle 和姓名都要填')

  const { data, error } = await supabase.rpc('create_profile', { p_handle: handle, p_name: name })
  if (error) throw new Error(error.message)

  revalidatePath('/', 'layout')
  redirect(`/u/${data.handle}`)
}
