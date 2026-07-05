'use client'

import { useState } from 'react'
import { Avatar } from './Avatar'
import { uploadAvatar } from '@/lib/upload'

export function AvatarUpload({
  name,
  handle,
  initialUrl,
}: {
  name: string
  handle: string
  initialUrl?: string | null
}) {
  const [url, setUrl] = useState<string | null>(initialUrl ?? null)
  const [status, setStatus] = useState<'idle' | 'uploading' | 'error'>('idle')
  const [err, setErr] = useState<string>('')

  async function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setStatus('uploading')
    setErr('')
    try {
      const next = await uploadAvatar(file)
      setUrl(next)
      setStatus('idle')
    } catch (x: any) {
      setStatus('error')
      setErr(x?.message ?? '上传失败')
    }
  }

  return (
    <div className="flex items-center gap-4">
      <Avatar name={name} src={url} seed={handle} size="xl" />
      {/* 隐藏字段，让 saveProfile 表单读取 */}
      <input type="hidden" name="avatar_url" value={url ?? ''} />
      <label className="cursor-pointer">
        <span className="inline-block px-3 py-2 text-sm rounded-card border border-ink-200 hover:border-ink-900">
          {status === 'uploading' ? '上传中…' : url ? '更换头像' : '上传头像'}
        </span>
        <input
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={onChange}
          disabled={status === 'uploading'}
        />
      </label>
      {status === 'error' && <span className="text-xs text-accent">{err}</span>}
    </div>
  )
}
