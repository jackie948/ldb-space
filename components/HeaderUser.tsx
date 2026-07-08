'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Avatar } from './Avatar'
import { createClient } from '@/lib/supabase/browser'
import type { LDBUser } from '@/lib/types'

type State = 'loading' | 'guest' | LDBUser

export function HeaderUser() {
  const [state, setState] = useState<State>('loading')

  useEffect(() => {
    const supabase = createClient()
    let mounted = true

    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!mounted) return
      if (!user) { setState('guest'); return }

      const { data } = await supabase
        .from('users').select('id, handle, name, avatar_url, role')
        .eq('id', user.id).maybeSingle()
      if (!mounted) return
      if (data) setState(data as LDBUser)
      else setState('guest')
    }

    load()
    return () => { mounted = false }
  }, [])

  if (state === 'loading') {
    // 占位一个圆圈,避免布局跳动
    return <span className="w-7 h-7 rounded-full bg-ink-100 border border-ink-200 animate-pulse" />
  }

  if (state === 'guest') {
    return <Link href="/login" className="hover:text-ink-900">登录</Link>
  }

  const me = state
  return (
    <div className="flex items-center gap-3">
      <Link href={`/u/${me.handle}`} className="flex items-center gap-2 hover:text-ink-900">
        <Avatar name={me.name} src={me.avatar_url} seed={me.handle} size="sm" />
        <span>{me.name}</span>
      </Link>
      <Link href="/settings" className="text-ink-400 hover:text-ink-900 text-xs">改密码</Link>
      <form action="/auth/signout" method="post">
        <button type="submit" className="text-ink-400 hover:text-ink-900 text-xs">登出</button>
      </form>
    </div>
  )
}
