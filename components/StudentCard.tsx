import Link from 'next/link'
import { Avatar } from './Avatar'
import type { LDBUser } from '@/lib/types'

export function StudentCard({ user }: { user: LDBUser }) {
  return (
    <Link
      href={`/u/${user.handle}`}
      className="group block rounded-card border border-ink-200 bg-white p-5 transition hover:border-ink-900 hover:-translate-y-0.5"
    >
      <div className="flex items-start gap-4">
        <Avatar name={user.name} src={user.avatar_url} seed={user.handle} size="md" />
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-ink-900 truncate">{user.name}</h3>
          {user.tagline && (
            <p className="text-sm text-ink-600 mt-1 line-clamp-2">{user.tagline}</p>
          )}
          <div className="mt-3 flex flex-wrap gap-1.5 text-[11px] text-ink-400">
            {user.department  && <span className="px-1.5 py-0.5 rounded bg-ink-100">{user.department}</span>}
            {user.team_number && <span className="px-1.5 py-0.5 rounded bg-ink-100">{user.team_number} 组</span>}
          </div>
        </div>
      </div>
    </Link>
  )
}
