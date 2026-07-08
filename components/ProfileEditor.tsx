'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Avatar } from './Avatar'
import { createClient } from '@/lib/supabase/browser'
import { uploadAvatar } from '@/lib/upload'
import type { LDBUser } from '@/lib/types'

const LINKS = [
  { k: 'website',   label: '个人网站' },
  { k: 'portfolio', label: '作品集' },
  { k: 'github',    label: 'GitHub' },
  { k: 'xhs',       label: '小红书' },
  { k: 'wechat',    label: '微信' },
]

export function ProfileEditor({ handle }: { handle: string }) {
  const router = useRouter()
  const [u, setU] = useState<LDBUser | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [forbidden, setForbidden] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // 表单状态
  const [tagline, setTagline] = useState('')
  const [bio, setBio] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [linkValues, setLinkValues] = useState<Record<string, string>>({})
  const [freeBlocks, setFreeBlocks] = useState('[]')

  useEffect(() => {
    let mounted = true
    ;(async () => {
      const supabase = createClient()
      const [{ data: user }, { data: { user: authUser } }] = await Promise.all([
        supabase.from('users').select('*').eq('handle', handle).maybeSingle(),
        supabase.auth.getUser(),
      ])
      if (!mounted) return
      if (!user) { setNotFound(true); return }
      if (!authUser) { setForbidden(true); return }

      // 校验权限:自己 or admin
      const { data: me } = await supabase
        .from('users').select('id, role').eq('id', authUser.id).maybeSingle()
      if (!mounted) return
      const canEdit = me && ((me as any).id === (user as any).id || (me as any).role === 'admin')
      if (!canEdit) { setForbidden(true); return }

      const uu = user as LDBUser
      setU(uu)
      setTagline(uu.tagline ?? '')
      setBio(uu.bio ?? '')
      setAvatarUrl(uu.avatar_url ?? '')
      setLinkValues((uu.links ?? {}) as Record<string, string>)
      setFreeBlocks(JSON.stringify(uu.free_blocks ?? [], null, 2))
    })()
    return () => { mounted = false }
  }, [handle])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!u) return
    setSaving(true)
    setError('')
    try {
      const supabase = createClient()

      const links: Record<string, string> = {}
      for (const { k } of LINKS) {
        const v = (linkValues[k] ?? '').trim()
        if (v) links[k] = v
      }

      let free_blocks: any[] = []
      try {
        const parsed = JSON.parse(freeBlocks)
        if (Array.isArray(parsed)) free_blocks = parsed
      } catch {}

      const { error: err } = await supabase
        .from('users')
        .update({
          tagline,
          bio,
          avatar_url: avatarUrl || null,
          links,
          free_blocks,
        })
        .eq('id', u.id)

      if (err) throw err
      // 保存成功 → 跳回主页;顺便清理个人页内存缓存,避免看到旧数据
      try {
        const { clearProfileCache } = await import('./ProfileView')
        clearProfileCache(handle)
      } catch {}
      router.push(`/u/${handle}`)
      router.refresh()
    } catch (x: any) {
      setError(x?.message ?? '保存失败')
      setSaving(false)
    }
  }

  if (notFound) return <div className="text-center py-24 text-ink-400">找不到这位同学。</div>
  if (forbidden) return <div className="text-center py-24 text-ink-400">你没有权限编辑这个主页。</div>
  if (!u) {
    return (
      <div className="max-w-2xl mx-auto animate-pulse">
        <div className="h-4 w-20 bg-ink-100 rounded" />
        <div className="mt-4 h-6 w-32 bg-ink-100 rounded" />
        <div className="mt-8 space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-12 bg-ink-100 rounded-card" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Link href={`/u/${handle}`} className="text-xs text-ink-400 hover:text-ink-900">← 返回主页</Link>
      <h1 className="mt-4 text-2xl font-semibold">编辑主页</h1>

      <form onSubmit={onSubmit} className="mt-8 space-y-6">
        <Field label="头像">
          <AvatarUploadWrap
            name={u.name}
            handle={u.handle}
            value={avatarUrl}
            onChange={setAvatarUrl}
          />
        </Field>

        <Field label="Tagline(一句话)">
          <input
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
            className={input}
            maxLength={80}
          />
        </Field>

        <Field label="Bio(Markdown 长自述)">
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={10}
            className={`${input} font-mono text-sm`}
          />
        </Field>

        <fieldset className="space-y-3">
          <legend className="text-xs tracking-[0.2em] text-ink-400 uppercase">链接</legend>
          {LINKS.map(({ k, label }) => (
            <div key={k} className="flex items-center gap-3">
              <label className="w-20 text-sm text-ink-600 shrink-0">{label}</label>
              <input
                value={linkValues[k] ?? ''}
                onChange={(e) => setLinkValues((prev) => ({ ...prev, [k]: e.target.value }))}
                placeholder="https://…"
                className={input}
              />
            </div>
          ))}
        </fieldset>

        <Field label="自由区块 (JSON)" hint='格式:[{"type":"text","title":"我在做","body":"markdown 内容"}]'>
          <textarea
            value={freeBlocks}
            onChange={(e) => setFreeBlocks(e.target.value)}
            rows={8}
            className={`${input} font-mono text-xs`}
          />
        </Field>

        <div className="flex items-center gap-3 pt-4">
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 rounded-card bg-ink-900 text-ink-50 font-medium disabled:opacity-50"
          >
            {saving ? '保存中…' : '保存'}
          </button>
          <Link href={`/u/${handle}`} className="text-sm text-ink-400 hover:text-ink-900">取消</Link>
          {error && <span className="text-sm text-accent">{error}</span>}
        </div>
      </form>
    </div>
  )
}

const input =
  'w-full px-3 py-2 rounded-card border border-ink-200 bg-white focus:border-ink-900 outline-none'

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="flex items-baseline justify-between mb-1.5">
        <span className="text-xs tracking-[0.2em] text-ink-400 uppercase">{label}</span>
        {hint && <span className="text-[11px] text-ink-400">{hint}</span>}
      </div>
      {children}
    </label>
  )
}

// 受控版头像上传:内部管上传状态,值由父组件持有
function AvatarUploadWrap({
  name, handle, value, onChange,
}: { name: string; handle: string; value: string; onChange: (v: string) => void }) {
  const [status, setStatus] = useState<'idle' | 'uploading' | 'error'>('idle')
  const [err, setErr] = useState('')

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setStatus('uploading')
    setErr('')
    try {
      const next = await uploadAvatar(file)
      onChange(next)
      setStatus('idle')
    } catch (x: any) {
      setStatus('error')
      setErr(x?.message ?? '上传失败')
    }
  }

  return (
    <div className="flex items-center gap-4">
      <Avatar name={name} src={value || null} seed={handle} size="xl" />
      <label className="cursor-pointer">
        <span className="inline-block px-3 py-2 text-sm rounded-card border border-ink-200 hover:border-ink-900">
          {status === 'uploading' ? '上传中…' : value ? '更换头像' : '上传头像'}
        </span>
        <input
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={onFile}
          disabled={status === 'uploading'}
        />
      </label>
      {status === 'error' && <span className="text-xs text-accent">{err}</span>}
    </div>
  )
}
