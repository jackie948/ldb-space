import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { isSupabaseConfigured } from '@/lib/mock'
import { getCurrentUser } from '@/lib/currentUser'
import { saveProfile } from '../actions'
import { AvatarUpload } from '@/components/AvatarUpload'
import type { LDBUser } from '@/lib/types'

const LINKS = [
  { k: 'website',   label: '个人网站' },
  { k: 'portfolio', label: '作品集' },
  { k: 'github',    label: 'GitHub' },
  { k: 'xhs',       label: '小红书' },
  { k: 'wechat',    label: '微信' },
]

export default async function EditProfilePage({ params }: { params: { handle: string } }) {
  if (!isSupabaseConfigured()) redirect(`/u/${params.handle}`)

  const supabase = createClient()
  const { data: user } = await supabase.from('users').select('*').eq('handle', params.handle).maybeSingle()
  if (!user) notFound()

  const me = await getCurrentUser()
  const canEdit = !!me && (me.id === (user as LDBUser).id || me.role === 'admin')
  if (!canEdit) redirect(`/u/${params.handle}`)

  const u = user as LDBUser
  const action = saveProfile.bind(null, params.handle)

  return (
    <div className="max-w-2xl mx-auto">
      <Link href={`/u/${params.handle}`} className="text-xs text-ink-400 hover:text-ink-900">← 返回主页</Link>
      <h1 className="mt-4 text-2xl font-semibold">编辑主页</h1>

      <form action={action} className="mt-8 space-y-6">
        <Field label="头像">
          <AvatarUpload name={u.name} handle={u.handle} initialUrl={u.avatar_url} />
        </Field>

        <Field label="Tagline（一句话）">
          <input name="tagline" defaultValue={u.tagline ?? ''} className={input} maxLength={80} />
        </Field>

        <Field label="Bio（Markdown 长自述）">
          <textarea name="bio" defaultValue={u.bio ?? ''} rows={10} className={`${input} font-mono text-sm`} />
        </Field>

        <fieldset className="space-y-3">
          <legend className="text-xs tracking-[0.2em] text-ink-400 uppercase">链接</legend>
          {LINKS.map(({ k, label }) => (
            <div key={k} className="flex items-center gap-3">
              <label className="w-20 text-sm text-ink-600 shrink-0">{label}</label>
              <input
                name={`link_${k}`}
                defaultValue={(u.links ?? {})[k] ?? ''}
                placeholder="https://…"
                className={input}
              />
            </div>
          ))}
        </fieldset>

        <Field label="自由区块 (JSON)" hint='格式：[{"type":"text","title":"我在做","body":"markdown 内容"}]'>
          <textarea
            name="free_blocks"
            defaultValue={JSON.stringify(u.free_blocks ?? [], null, 2)}
            rows={8}
            className={`${input} font-mono text-xs`}
          />
        </Field>

        <div className="flex items-center gap-3 pt-4">
          <button type="submit" className="px-5 py-2.5 rounded-card bg-ink-900 text-ink-50 font-medium">保存</button>
          <Link href={`/u/${params.handle}`} className="text-sm text-ink-400 hover:text-ink-900">取消</Link>
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
