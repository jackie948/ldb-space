import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { isSupabaseConfigured } from '@/lib/mock'
import { getCurrentUser } from '@/lib/currentUser'
import { Markdown } from '@/components/Markdown'
import { createComment } from '@/app/feed/actions'

const TYPE_LABEL: Record<string, string> = {
  homework: '作业',
  daily: '日常',
  question: '提问',
  announcement: '通知',
  profile: '个人',
}

export default async function PostDetail({ params }: { params: { id: string } }) {
  if (!isSupabaseConfigured()) notFound()

  const supabase = createClient()
  const { data: post } = await supabase
    .from('posts')
    .select('*, author:users!posts_author_id_fkey(name, handle, avatar_url)')
    .eq('id', params.id)
    .maybeSingle()
  if (!post) notFound()

  const { data: comments } = await supabase
    .from('comments')
    .select('*, author:users!comments_author_id_fkey(name, handle)')
    .eq('post_id', params.id)
    .order('created_at', { ascending: true })

  const me = await getCurrentUser()
  const submit = createComment.bind(null, params.id)

  const author = Array.isArray((post as any).author) ? (post as any).author[0] : (post as any).author

  return (
    <div className="max-w-2xl mx-auto">
      <Link href="/feed" className="text-xs text-ink-400 hover:text-ink-900">← 返回 Feed</Link>

      <article className="mt-4 rounded-card border border-ink-200 bg-white p-6">
        <div className="flex items-center gap-2 text-xs text-ink-400 flex-wrap">
          <Link href={`/u/${author?.handle}`} className="font-medium text-ink-600 hover:text-ink-900">
            {author?.name}
          </Link>
          <span>· {TYPE_LABEL[post.type] ?? post.type}</span>
          {post.week != null && <span>· 第 {post.week} 周</span>}
          <span>· {new Date(post.created_at).toLocaleString('zh-CN')}</span>
          {(post.tags ?? []).map((t: string) => (
            <span key={t} className="px-1.5 py-0.5 rounded bg-ink-100 text-ink-600">#{t}</span>
          ))}
        </div>
        {post.title && <h1 className="mt-3 text-xl font-semibold">{post.title}</h1>}
        <div className="mt-3"><Markdown>{post.content}</Markdown></div>

        {Array.isArray((post as any).attachments) && (post as any).attachments.length > 0 && (
          <div className="mt-4 space-y-2">
            {(post as any).attachments.filter((a: any) => a.mime?.startsWith('image/')).length > 0 && (
              <div className="grid grid-cols-2 gap-2">
                {(post as any).attachments.filter((a: any) => a.mime?.startsWith('image/')).map((a: any) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={a.url} src={a.url} alt={a.name} className="rounded-card border border-ink-200 max-h-80 object-cover w-full" />
                ))}
              </div>
            )}
            {(post as any).attachments.filter((a: any) => !a.mime?.startsWith('image/')).map((a: any) => (
              <a key={a.url} href={a.url} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-xs text-ink-600 hover:text-ink-900">
                <span className="text-ink-400">📎</span>
                <span className="underline underline-offset-2 truncate">{a.name}</span>
              </a>
            ))}
          </div>
        )}
      </article>

      <section className="mt-8">
        <h2 className="text-xs tracking-[0.2em] text-ink-400 uppercase mb-4">评论 · {comments?.length ?? 0}</h2>

        <ul className="space-y-3">
          {(comments ?? []).map((c: any) => {
            const ca = Array.isArray(c.author) ? c.author[0] : c.author
            return (
              <li key={c.id} className="rounded-card border border-ink-200 bg-white p-4">
                <div className="text-xs text-ink-400">
                  <Link href={`/u/${ca?.handle}`} className="font-medium text-ink-600 hover:text-ink-900">
                    {ca?.name}
                  </Link>
                  <span> · {new Date(c.created_at).toLocaleString('zh-CN')}</span>
                </div>
                <div className="mt-2 text-sm"><Markdown>{c.content}</Markdown></div>
              </li>
            )
          })}
        </ul>

        {me ? (
          <form action={submit} className="mt-6 space-y-3">
            <textarea
              name="content"
              required
              rows={3}
              placeholder="写点什么…"
              className="w-full px-3 py-2 rounded-card border border-ink-200 focus:border-ink-900 outline-none text-sm"
            />
            <div className="flex justify-end">
              <button type="submit" className="px-4 py-2 rounded-card bg-ink-900 text-ink-50 text-sm font-medium">
                评论
              </button>
            </div>
          </form>
        ) : (
          <p className="mt-6 text-sm text-ink-400">
            <a href="/login" className="text-accent underline">登录</a> 后可评论。
          </p>
        )}
      </section>
    </div>
  )
}
