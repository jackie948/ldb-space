import { createClient } from '@/lib/supabase/browser'

function ext(filename: string): string {
  const m = filename.match(/\.([a-zA-Z0-9]+)$/)
  return m ? m[1].toLowerCase() : 'bin'
}

function ym(): string {
  const d = new Date()
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}`
}

function rand(): string {
  return Math.random().toString(36).slice(2, 10)
}

/** 上传单张头像，返回 public URL。会覆盖旧头像。 */
export async function uploadAvatar(file: File): Promise<string> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('not authenticated')

  const path = `${user.id}/avatar.${ext(file.name)}`
  const { error } = await supabase.storage.from('avatars').upload(path, file, {
    upsert: true,
    contentType: file.type || undefined,
    cacheControl: '3600',
  })
  if (error) throw error

  const { data } = supabase.storage.from('avatars').getPublicUrl(path)
  // 拼一个 cache-busting query，避免浏览器还展示旧图
  return `${data.publicUrl}?v=${Date.now()}`
}

/** 上传一个附件（图片 / PDF 等），返回 { url, name, mime }。 */
export async function uploadAttachment(file: File): Promise<{ url: string; name: string; mime: string }> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('not authenticated')

  const path = `${user.id}/${ym()}/${rand()}.${ext(file.name)}`
  const { error } = await supabase.storage.from('uploads').upload(path, file, {
    upsert: false,
    contentType: file.type || undefined,
    cacheControl: '3600',
  })
  if (error) throw error

  const { data } = supabase.storage.from('uploads').getPublicUrl(path)
  return { url: data.publicUrl, name: file.name, mime: file.type || 'application/octet-stream' }
}
