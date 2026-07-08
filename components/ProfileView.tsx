'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Markdown } from './Markdown'
import { Avatar } from './Avatar'
import type { LDBUser, LDBPost } from '@/lib/types'

const LINK_LABELS: Record<string, string> = {
  website: '个人网站',
  portfolio: '作品集',
  github: 'GitHub',
  xhs: '小红书',
  wechat: '微信',
}

// 单次会话内缓存,避免重复请求
type Cache = { user: LDBUser | null; posts: LDBPost[]; canEdit: boolean }
const cacheStore = new Map<string, { at: number; data: Cache }>()
const inflightStore = new Map<string, Promise<Cache | null>>()
const CACHE_MS = 60 * 1000

// 悬停/进入前提前加载数据 —— 由 StudentCard 触发
export function prefetchProfile(handle: string) {
  const c = cacheStore.get(handle)
  if (c && Date.now() - c.at < CACHE_MS) return
  if (inflightStore.has(handle)) return

  const p = (async (): Promise<Cache | null> => {
    const { createClient } = await import('@/lib/supabase/browser')
    const supabase = createClient()

    const [{ data: userRow }, { data: { user: authUser } }] = await Promise.all([
      supabase.from('users').select('*').eq('handle', handle).maybeSingle(),
      supabase.auth.getUser(),
    ])
    if (!userRow) return null
    const user = userRow as LDBUser

    const postsP = supabase
      .from('posts').select('*')
      .eq('author_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20)
    const meRoleP = authUser
      ? supabase.from('users').select('id, role').eq('id', authUser.id).maybeSingle()
      : Promise.resolve({ data: null })

    const [{ data: postsData }, { data: meData }] = await Promise.all([postsP, meRoleP])
    const posts = (postsData as LDBPost[]) ?? []
    const canEdit = !!meData && ((meData as any).id === user.id || (meData as any).role === 'admin')

    const next: Cache = { user, posts, canEdit }
    cacheStore.set(handle, { at: Date.now(), data: next })
    return next
  })()

  inflightStore.set(handle, p)
  p.finally(() => { inflightStore.delete(handle) })
}

export function ProfileView({ handle }: { handle: string }) {
  const [data, setData] = useState<Cache | null>(() => {
    const c = cacheStore.get(handle)
    if (c && Date.now() - c.at < CACHE_MS) return c.data
    return null
  })
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      // 触发预取(可能已经由 hover 提前触发过,会命中 inflight)
      prefetchProfile(handle)
      // 等待正在进行的请求完成 / 或直接读缓存
      const inflight = inflightStore.get(handle)
      const result = inflight ? await inflight : (cacheStore.get(handle)?.data ?? null)
      if (!mounted) return
      if (!result) { setNotFound(true); return }
      setData(result)
    })()
    return () => { mounted = false }
  }, [handle])

  if (notFound) {
    return (
      <div className="text-center py-24">
        <p className="text-xs tracking-[0.2em] text-ink-400 uppercase">404</p>
        <h1 className="mt-4 text-2xl font-semibold">找不到这位同学</h1>
        <Link href="/" className="mt-6 inline-block text-accent underline underline-offset-2 text-sm">回到学员墙</Link>
      </div>
    )
  }

  if (!data) {
    // 骨架
    return (
      <div className="max-w-3xl mx-auto animate-pulse">
        <div className="h-4 w-20 bg-ink-100 rounded" />
        <div className="mt-4 flex items-start gap-5">
          <div className="w-20 h-20 rounded-full bg-ink-100" />
          <div className="flex-1 space-y-3">
            <div className="h-6 w-32 bg-ink-100 rounded" />
            <div className="h-4 w-48 bg-ink-100 rounded" />
          </div>
        </div>
        <div className="mt-10 h-32 bg-ink-100 rounded-card" />
      </div>
    )
  }

  const { user, posts, canEdit } = data

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <Link href="/" className="text-xs text-ink-400 hover:text-ink-900">← 返回学员墙</Link>
        {canEdit && (
          <Link
            href={`/u/${user.handle}/edit`}
            className="text-xs px-3 py-1.5 rounded-card border border-ink-200 hover:border-ink-900"
          >
            编辑
          </Link>
        )}
      </div>

      <header className="mt-4 flex items-start gap-5">
        <Avatar name={user.name} src={user.avatar_url} seed={user.handle} size="xl" />
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-semibold">{user.name}</h1>
          {user.tagline && <p className="mt-3 text-ink-600">{user.tagline}</p>}
          <div className="mt-4 flex flex-wrap gap-1.5 text-[11px]">
            {user.department  && <span className="px-2 py-0.5 rounded bg-ink-100 text-ink-600">{user.department}</span>}
            {user.team_number && <span className="px-2 py-0.5 rounded bg-ink-100 text-ink-600">{user.team_number} 组</span>}
          </div>
        </div>
      </header>

      {user.links && Object.keys(user.links).length > 0 && (
        <section className="mt-8">
          <h2 className="text-xs tracking-[0.2em] text-ink-400 uppercase mb-2">链接</h2>
          <ul className="space-y-1">
            {Object.entries(user.links).map(([k, v]) => (
              <li key={k}>
                <span className="text-ink-400 text-sm mr-2">{LINK_LABELS[k] ?? k}</span>
                <a href={v} target="_blank" rel="noreferrer" className="text-accent underline underline-offset-2 text-sm">
                  {v}
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      {user.bio && (
        <section className="mt-8">
          <h2 className="text-xs tracking-[0.2em] text-ink-400 uppercase mb-3">关于我</h2>
          <Markdown>{user.bio}</Markdown>
        </section>
      )}

      {user.free_blocks?.map((b, i) => (
        <section key={i} className="mt-8">
          <h2 className="text-xs tracking-[0.2em] text-ink-400 uppercase mb-3">{b.title}</h2>
          <Markdown>{b.body}</Markdown>
        </section>
      ))}

      {!user.bio && (!user.free_blocks || user.free_blocks.length === 0) && (
        <section className="mt-10 rounded-card border border-dashed border-ink-200 p-6 text-center text-sm text-ink-400">
          这里空空的 —— 登录后可以编辑自己的主页 ✨
        </section>
      )}

      <section className="mt-12">
        <h2 className="text-xs tracking-[0.2em] text-ink-400 uppercase mb-4">动态 · {posts.length}</h2>
        {posts.length === 0 ? (
          <p className="text-sm text-ink-400">还没有动态。</p>
        ) : (
          <ul className="space-y-4">
            {posts.map((p) => (
              <li key={p.id} className="rounded-card border border-ink-200 bg-white p-5">
                <div className="flex items-center gap-2 text-xs text-ink-400">
                  <span>{p.type}</span>
                  {p.week != null && <span>· 第 {p.week} 周</span>}
                  <span>· {new Date(p.created_at).toLocaleDateString('zh-CN')}</span>
                </div>
                {p.title && <h3 className="mt-2 font-semibold">{p.title}</h3>}
                <div className="mt-2">
                  <Markdown>{p.content}</Markdown>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
