import Link from 'next/link'
import { Avatar } from './Avatar'
import { getCurrentUser, isStaff } from '@/lib/currentUser'

export async function Header() {
  const me = await getCurrentUser()
  return (
    <header className="border-b border-ink-200 bg-ink-50/80 backdrop-blur sticky top-0 z-10">
      <div className="mx-auto max-w-6xl px-6 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="inline-block w-2 h-2 rounded-full bg-accent" />
          LDB｜Lab 1327 · Design builds
        </Link>
        <nav className="flex items-center gap-6 text-sm text-ink-600">
          <Link href="/feed" className="hover:text-ink-900">Feed</Link>
          <Link href="/curriculum" className="hover:text-ink-900">课程</Link>
          {isStaff(me) && <Link href="/admin" className="hover:text-ink-900">观测台</Link>}
          {me ? (
            <div className="flex items-center gap-3">
              <Link href={`/u/${me.handle}`} className="flex items-center gap-2 hover:text-ink-900">
                <Avatar name={me.name} src={me.avatar_url} seed={me.handle} size="sm" />
                <span>{me.name}</span>
              </Link>
              <form action="/auth/signout" method="post">
                <button type="submit" className="text-ink-400 hover:text-ink-900 text-xs">登出</button>
              </form>
            </div>
          ) : (
            <Link href="/login" className="hover:text-ink-900">登录</Link>
          )}
        </nav>
      </div>
    </header>
  )
}
