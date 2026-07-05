'use client'

import { useState } from 'react'
import { uploadAttachment } from '@/lib/upload'

type Attachment = { url: string; name: string; mime: string }

export function AttachmentUpload() {
  const [items, setItems] = useState<Attachment[]>([])
  const [status, setStatus] = useState<'idle' | 'uploading' | 'error'>('idle')
  const [err, setErr] = useState<string>('')

  async function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    setStatus('uploading')
    setErr('')
    try {
      const uploaded = await Promise.all(files.map((f) => uploadAttachment(f)))
      setItems((prev) => [...prev, ...uploaded])
      setStatus('idle')
    } catch (x: any) {
      setStatus('error')
      setErr(x?.message ?? '上传失败')
    }
    e.target.value = '' // 允许重复选同一个文件
  }

  function remove(url: string) {
    setItems((prev) => prev.filter((a) => a.url !== url))
  }

  return (
    <div className="space-y-2">
      <input type="hidden" name="attachments" value={JSON.stringify(items)} />

      {items.length > 0 && (
        <ul className="space-y-1">
          {items.map((a) => (
            <li key={a.url} className="flex items-center gap-2 text-xs text-ink-600">
              <span className="text-ink-400">📎</span>
              <a href={a.url} target="_blank" rel="noreferrer" className="underline underline-offset-2 truncate max-w-[280px]">
                {a.name}
              </a>
              <button type="button" onClick={() => remove(a.url)} className="text-ink-400 hover:text-accent">
                ×
              </button>
            </li>
          ))}
        </ul>
      )}

      <label className="inline-flex items-center gap-2 cursor-pointer text-xs text-ink-600 hover:text-ink-900">
        <span>{status === 'uploading' ? '上传中…' : '+ 附件'}</span>
        <input
          type="file"
          multiple
          className="sr-only"
          onChange={onChange}
          disabled={status === 'uploading'}
        />
      </label>
      {status === 'error' && <span className="ml-3 text-xs text-accent">{err}</span>}
    </div>
  )
}
