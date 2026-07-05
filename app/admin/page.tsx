import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { isSupabaseConfigured } from '@/lib/mock'
import { getCurrentUser, isStaff } from '@/lib/currentUser'
import type { LDBUser } from '@/lib/types'

type StudentRow = LDBUser & {
  posts_total: number
  homework_count: number
  daily_count: number
  question_count: number
  last_post_at: string | null
  comments_given: number
}

async function loadRows(): Promise<StudentRow[]> {
  const supabase = createClient()

  const { data: students } = await supabase
    .from('users').select('*').eq('role', 'student').order('name')

  const { data: posts } = await supabase
    .from('posts').select('author_id, type, created_at')

  const { data: comments } = await supabase
    .from('comments').select('author_id')

  const map: Record<string, StudentRow> = {}
  for (const s of (students as LDBUser[]) ?? []) {
    map[s.id] = { ...s, posts_total: 0, homework_count: 0, daily_count: 0, question_count: 0, last_post_at: null, comments_given: 0 }
  }
  for (const p of (posts as any[]) ?? []) {
    const row = map[p.author_id]
    if (!row) continue
    row.posts_total++
    if (p.type === 'homework') row.homework_count++
    else if (p.type === 'daily') row.daily_count++
    else if (p.type === 'question') row.question_count++
    if (!row.last_post_at || p.created_at > row.last_post_at) row.last_post_at = p.created_at
  }
  for (const c of (comments as any[]) ?? []) {
    const row = map[c.author_id]
    if (row) row.comments_given++
  }
  return Object.values(map).sort((a, b) => a.name.localeCompare(b.name, 'zh'))
}

function daysAgo(iso: string | null): string {
  if (!iso) return '—'
  const ms = Date.now() - new Date(iso).getTime()
  const d = Math.floor(ms / 86400000)
  if (d <= 0) return '今天'
  if (d === 1) return '昨天'
  return `${d} 天前`
}

export default async function AdminPage() {
  if (!isSupabaseConfigured()) {
    return <div className="text-ink-600">观测台需要连上 Supabase 才有数据。</div>
  }
  const me = await getCurrentUser()
  if (!isStaff(me)) redirect('/')

  const rows = await loadRows()
  const totals = rows.reduce(
    (acc, r) => {
      acc.posts += r.posts_total
      acc.hw += r.homework_count
      return acc
    },
    { posts: 0, hw: 0 }
  )

  return (
    <div>
      <div className="flex items-baseline justify-between">
        <h1 className="text-2xl font-semibold">观测台</h1>
        <Link href="/admin/invites" className="text-xs text-ink-400 hover:text-ink-900 underline underline-offset-2">
          邀请码 →
        </Link>
      </div>
      <p className="mt-1 text-sm text-ink-400">L1/L2/admin 可见 · 每位同学的学习轨迹一屏看完</p>

      <div className="mt-6 grid grid-cols-3 gap-4">
        <Stat label="学员" value={rows.length} />
        <Stat label="累计发帖" value={totals.posts} />
        <Stat label="累计作业帖" value={totals.hw} />
      </div>

      <div className="mt-10 overflow-x-auto rounded-card border border-ink-200 bg-white">
        <table className="w-full text-sm">
          <thead className="text-xs tracking-wider text-ink-400 uppercase bg-ink-50">
            <tr>
              <th className="text-left px-4 py-3">姓名</th>
              <th className="text-left px-4 py-3">L1</th>
              <th className="text-left px-4 py-3">作品</th>
              <th className="text-right px-4 py-3">作业</th>
              <th className="text-right px-4 py-3">日常</th>
              <th className="text-right px-4 py-3">提问</th>
              <th className="text-right px-4 py-3">评论</th>
              <th className="text-right px-4 py-3">最近发帖</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-200">
            {rows.map((r) => (
              <tr key={r.id} className="hover:bg-ink-50/60">
                <td className="px-4 py-3">
                  <Link href={`/u/${r.handle}`} className="font-medium text-ink-900 hover:underline underline-offset-2">
                    {r.name}
                  </Link>
                  <div className="text-xs text-ink-400">/{r.handle}</div>
                </td>
                <td className="px-4 py-3 text-ink-600">{r.l1_mentor ?? '—'}</td>
                <td className="px-4 py-3 text-ink-600">{r.team_project ?? '—'}</td>
                <td className="px-4 py-3 text-right tabular-nums">{r.homework_count}</td>
                <td className="px-4 py-3 text-right tabular-nums text-ink-600">{r.daily_count}</td>
                <td className="px-4 py-3 text-right tabular-nums text-ink-600">{r.question_count}</td>
                <td className="px-4 py-3 text-right tabular-nums text-ink-600">{r.comments_given}</td>
                <td className={`px-4 py-3 text-right ${r.last_post_at ? 'text-ink-900' : 'text-ink-400'}`}>
                  {daysAgo(r.last_post_at)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-xs text-ink-400">
        观测口径：所有帖子 / 评论都算；点击姓名跳个人页看具体内容。
      </p>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-card border border-ink-200 bg-white p-5">
      <div className="text-xs tracking-[0.2em] text-ink-400 uppercase">{label}</div>
      <div className="mt-2 text-3xl font-semibold tabular-nums">{value}</div>
    </div>
  )
}
