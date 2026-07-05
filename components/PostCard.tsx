import Link from 'next/link'
import { Markdown } from './Markdown'

const TYPE_LABEL: Record<string, string> = {
  homework: '作业',
  daily: '日常',
  question: '提问',
  announcement: '通知',
  profile: '个人',
}

type Author = { name: string; handle: string; avatar_url?: string | null }
type Attachment = { url: string; name: string; mime?: string }

function isImage(mime?: string) {
  return mime?.startsWith('image/')
}

export function PostCard({
  post,
}: {
  post: {
    id: string
    type: string
    title?: string | null
    content: string
    week?: number | null
    tags?: string[] | null
    attachments?: Attachment[] | null
    created_at: string
    author?: Author | Author[] | null
  }
}) {
  const author = Array.isArray(post.author) ? post.author[0] : post.author
  return (
    <article className="rounded-card border border-ink-200 bg-white p-5">
      <div className="flex items-center gap-2 text-xs text-ink-400 flex-wrap">
        {author && (
          <Link href={`/u/${author.handle}`} className="font-medium text-ink-600 hover:text-ink-900">
            {author.name}
          </Link>
        )}
        <span>· {TYPE_LABEL[post.type] ?? post.type}</span>
        {post.week != null && <span>· 第 {post.week} 周</span>}
        <span>· {new Date(post.created_at).toLocaleDateString('zh-CN')}</span>
        {(post.tags ?? []).map((t) => (
          <span key={t} className="px-1.5 py-0.5 rounded bg-ink-100 text-ink-600">#{t}</span>
        ))}
      </div>
      {post.title && (
        <h3 className="mt-2 font-semibold">
          <Link href={`/p/${post.id}`} className="hover:underline underline-offset-2">{post.title}</Link>
        </h3>
      )}
      <div className="mt-2">
        <Markdown>{post.content}</Markdown>
      </div>

      {post.attachments && post.attachments.length > 0 && (
        <div className="mt-3 space-y-2">
          {post.attachments.filter((a) => isImage(a.mime)).length > 0 && (
            <div className="grid grid-cols-2 gap-2">
              {post.attachments.filter((a) => isImage(a.mime)).map((a) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={a.url} src={a.url} alt={a.name} className="rounded-card border border-ink-200 max-h-64 object-cover w-full" />
              ))}
            </div>
          )}
          {post.attachments.filter((a) => !isImage(a.mime)).map((a) => (
            <a key={a.url} href={a.url} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-xs text-ink-600 hover:text-ink-900">
              <span className="text-ink-400">📎</span>
              <span className="underline underline-offset-2 truncate">{a.name}</span>
            </a>
          ))}
        </div>
      )}

      <div className="mt-3 text-xs">
        <Link href={`/p/${post.id}`} className="text-ink-400 hover:text-ink-900">评论 →</Link>
      </div>
    </article>
  )
}
