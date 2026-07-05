import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { isSupabaseConfigured } from '@/lib/mock'
import { claimInvite, createProfile } from './actions'

export default async function WelcomePage({
  searchParams,
}: {
  searchParams: { step?: string }
}) {
  if (!isSupabaseConfigured()) redirect('/')

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // 已经有 profile → 直接进去
  const { data: existing } = await supabase.from('users').select('handle').eq('id', user.id).maybeSingle()
  if (existing?.handle) redirect(`/u/${existing.handle}`)

  const step = searchParams.step === 'profile' ? 'profile' : 'invite'

  return (
    <div className="max-w-md mx-auto pt-10">
      <p className="text-xs tracking-[0.2em] text-ink-400 uppercase">Welcome to LDB</p>
      <h1 className="mt-2 text-2xl font-semibold">{step === 'invite' ? '认领你的位置' : '建一个新档案'}</h1>

      {step === 'invite' ? (
        <>
          <p className="mt-3 text-sm text-ink-600">
            项目组给每位同学发了一次性邀请码，用它把你的账号和名单里的位置关联起来。
          </p>
          <form action={claimInvite} className="mt-8 space-y-4">
            <input
              name="code"
              required
              autoFocus
              placeholder="LDB-2026-XXXX"
              className="w-full px-4 py-3 rounded-card border border-ink-200 focus:border-ink-900 outline-none tracking-widest text-center font-mono uppercase"
            />
            <button type="submit" className="w-full py-3 rounded-card bg-ink-900 text-ink-50 font-medium">
              认领
            </button>
          </form>

          <div className="mt-8 text-center">
            <Link href="/welcome?step=profile" className="text-sm text-ink-400 hover:text-ink-900 underline underline-offset-2">
              我没有邀请码 · 建一个新档案 →
            </Link>
          </div>
        </>
      ) : (
        <>
          <p className="mt-3 text-sm text-ink-600">
            选一个你想用的 handle（会成为你主页的地址：<code className="bg-ink-100 px-1 rounded text-xs">/u/handle</code>），再填一下真实姓名。
          </p>
          <form action={createProfile} className="mt-8 space-y-4">
            <label className="block">
              <div className="text-xs tracking-[0.2em] text-ink-400 uppercase mb-1.5">Handle</div>
              <input
                name="handle"
                required
                pattern="[a-z0-9_\-]{2,32}"
                placeholder="e.g. xujingjing"
                className="w-full px-4 py-3 rounded-card border border-ink-200 focus:border-ink-900 outline-none lowercase"
              />
              <p className="text-[11px] text-ink-400 mt-1">小写字母、数字、下划线、连字符，2–32 字符</p>
            </label>
            <label className="block">
              <div className="text-xs tracking-[0.2em] text-ink-400 uppercase mb-1.5">姓名</div>
              <input
                name="name"
                required
                placeholder="你的名字"
                className="w-full px-4 py-3 rounded-card border border-ink-200 focus:border-ink-900 outline-none"
              />
            </label>
            <button type="submit" className="w-full py-3 rounded-card bg-ink-900 text-ink-50 font-medium">
              开始
            </button>
          </form>

          <div className="mt-8 text-center">
            <Link href="/welcome" className="text-sm text-ink-400 hover:text-ink-900 underline underline-offset-2">
              ← 我有邀请码
            </Link>
          </div>
        </>
      )}
    </div>
  )
}
