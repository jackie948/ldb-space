'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { PostType } from '@/lib/types'

const POST_TYPES: PostType[] = ['homework', 'daily', 'question', 'announcement']

export async function createPost(formData: FormData) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const type = String(formData.get('type') ?? 'daily') as PostType
  const title = String(formData.get('title') ?? '').trim() || null
  const content = String(formData.get('content') ?? '').trim()
  const weekRaw = String(formData.get('week') ?? '').trim()
  const tagsRaw = String(formData.get('tags') ?? '').trim()

  if (!content) throw new Error('内容不能为空')
  if (!POST_TYPES.includes(type)) throw new Error('未知类型')

  const week = weekRaw ? Math.max(0, Math.min(12, Number(weekRaw))) : null
  const tags = tagsRaw ? tagsRaw.split(/[,，\s]+/).filter(Boolean).slice(0, 8) : []

  const attachmentsRaw = String(formData.get('attachments') ?? '[]')
  let attachments: Array<{ url: string; name: string; mime?: string }> = []
  try {
    const parsed = JSON.parse(attachmentsRaw)
    if (Array.isArray(parsed)) attachments = parsed.slice(0, 10)
  } catch { /* keep [] */ }

  const { error } = await supabase.from('posts').insert({
    author_id: user.id,
    type,
    title,
    content,
    week,
    tags,
    attachments,
  })
  if (error) throw new Error(error.message)

  revalidatePath('/feed')
  revalidatePath('/')
}

export async function createComment(postId: string, formData: FormData) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const content = String(formData.get('content') ?? '').trim()
  if (!content) return

  const { error } = await supabase.from('comments').insert({
    post_id: postId,
    author_id: user.id,
    content,
  })
  if (error) throw new Error(error.message)

  revalidatePath(`/p/${postId}`)
}
