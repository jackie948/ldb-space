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

    async function loadProfile(userId: string) {
      const { data } = await supabase
        .from('users').select('id, handle, name, avatar_url, role')
        .eq('id', userId).maybeSingle()
      if (!mounted) return
      if (data) setState(data as LDBUser)
      else setState('guest')
    }

    async function initial() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!mounted) return
      if (!user) { setState('guest'); return }
      await loadProfile(user.id)
    }

    // 首次加载
    initial()

    // 监听登录 / 登出事件 —— 状态变了立刻刷新 Header
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return
      if (session?.user) {
        loadProfile(session.user.id)
      } else {
        setState('guest')
      }
    })

    return () => {
      mounted = false
      sub.subscription.unsubscribe()
    }
  }, [])

  if (state === 'loading') {
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
