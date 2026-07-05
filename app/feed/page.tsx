import { createClient } from '@/lib/supabase/server'
import { isSupabaseConfigured } from '@/lib/mock'
import { getCurrentUser } from '@/lib/currentUser'
import { Composer } from '@/components/Composer'
import { PostCard } from '@/components/PostCard'

export default async function FeedPage() {
  if (!isSupabaseConfigured()) {
    return (
      <div className="max-w-2xl">
        <h1 className="text-2xl font-semibold">Feed</h1>
        <p className="mt-4 text-ink-600">
          还没配置 Supabase —— 参见 <code className="bg-ink-100 px-1 rounded">.env.example</code>。
        </p>
      </div>
    )
  }

  const supabase = createClient()
  const [{ data: posts }, me] = await Promise.all([
    supabase
      .from('posts')
      .select('id, type, title, content, week, tags, attachments, created_at, author:users!posts_author_id_fkey(name, handle, avatar_url)')
      .order('created_at', { ascending: false })
      .limit(50),
    getCurrentUser(),
  ])

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold">Feed</h1>
      <p className="mt-1 text-sm text-ink-400">所有人的作业 · 日常 · 提问</p>

      {me ? (
        <div className="mt-6"><Composer /></div>
      ) : (
        <p className="mt-6 text-sm text-ink-400">
          <a href="/login" className="text-accent underline">登录</a> 后可发布内容。
        </p>
      )}

      <ul className="mt-8 space-y-4">
        {(posts ?? []).map((p: any) => (
          <li key={p.id}><PostCard post={p} /></li>
        ))}
      </ul>
    </div>
  )
}
