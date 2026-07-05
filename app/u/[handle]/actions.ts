'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

type FreeBlock = { type: string; title: string; body: string }

export async function saveProfile(handle: string, formData: FormData) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const tagline = String(formData.get('tagline') ?? '')
  const bio     = String(formData.get('bio') ?? '')
  const avatar  = String(formData.get('avatar_url') ?? '')

  const linkKeys = ['website', 'portfolio', 'github', 'xhs', 'wechat'] as const
  const links: Record<string, string> = {}
  for (const k of linkKeys) {
    const v = String(formData.get(`link_${k}`) ?? '').trim()
    if (v) links[k] = v
  }

  const blocksRaw = String(formData.get('free_blocks') ?? '[]')
  let free_blocks: FreeBlock[] = []
  try {
    const parsed = JSON.parse(blocksRaw)
    if (Array.isArray(parsed)) free_blocks = parsed
  } catch { /* keep [] */ }

  const { error } = await supabase
    .from('users')
    .update({ tagline, bio, avatar_url: avatar || null, links, free_blocks })
    .eq('id', user.id)

  if (error) throw new Error(error.message)

  revalidatePath(`/u/${handle}`)
  redirect(`/u/${handle}`)
}
