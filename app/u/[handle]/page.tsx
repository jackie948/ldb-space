// 缓存 60 秒 —— 个人页更新不频繁
export const revalidate = 60

import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Markdown } from '@/components/Markdown'
import { Avatar } from '@/components/Avatar'
import { MOCK_STUDENTS, isSupabaseConfigured } from '@/lib/mock'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/currentUser'
import type { LDBUser, LDBPost } from '@/lib/types'

async function getUser(handle: string): Promise<LDBUser | null> {
  if (!isSupabaseConfigured()) {
    return MOCK_STUDENTS.find((u) => u.handle === handle) ?? null
  }
  const supabase = createClient()
  const { data } = await supabase.from('users').select('*').eq('handle', handle).maybeSingle()
  return (data as LDBUser) ?? null
}

async function getPosts(userId: string): Promise<LDBPost[]> {
  if (!isSupabaseConfigured()) return []
  const supabase = createClient()
  const { data } = await supabase
    .from('posts')
    .select('*')
    .eq('author_id', userId)
    .order('created_at', { ascending: false })
    .limit(20)
  return (data as LDBPost[]) ?? []
}

const LINK_LABELS: Record<string, string> = {
  website: '个人网站',
  portfolio: '作品集',
  github: 'GitHub',
  xhs: '小红书',
  wechat: '微信',
}

export default async function UserPage({ params }: { params: { handle: string } }) {
  const user = await getUser(params.handle)
  if (!user) notFound()
  const posts = await getPosts(user.id)
  const me = await getCurrentUser()
  const canEdit = !!me && (me.id === user.id || me.role === 'admin')

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

      {/* Hero */}
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

      {/* Links */}
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

      {/* Bio */}
      {user.bio && (
        <section className="mt-8">
          <h2 className="text-xs tracking-[0.2em] text-ink-400 uppercase mb-3">关于我</h2>
          <Markdown>{user.bio}</Markdown>
        </section>
      )}

      {/* Free blocks */}
      {user.free_blocks?.map((b, i) => (
        <section key={i} className="mt-8">
          <h2 className="text-xs tracking-[0.2em] text-ink-400 uppercase mb-3">{b.title}</h2>
          <Markdown>{b.body}</Markdown>
        </section>
      ))}

      {/* Empty state hint if the profile is bare */}
      {!user.bio && (!user.free_blocks || user.free_blocks.length === 0) && (
        <section className="mt-10 rounded-card border border-dashed border-ink-200 p-6 text-center text-sm text-ink-400">
          {'这里空空的 —— 登录后可以编辑自己的主页 ✨'}
        </section>
      )}

      {/* Posts */}
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
