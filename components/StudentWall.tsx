'use client'

import { useEffect, useState } from 'react'
import { StudentCard } from './StudentCard'
import { createClient } from '@/lib/supabase/browser'
import type { LDBUser } from '@/lib/types'

// 缓存在 sessionStorage,同一会话内秒开
const CACHE_KEY = 'ldb:students:v1'
const CACHE_MS = 5 * 60 * 1000 // 5 分钟

type Cached = { at: number; list: LDBUser[] }

function readCache(): Cached | null {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const c = JSON.parse(raw) as Cached
    if (Date.now() - c.at > CACHE_MS) return null
    return c
  } catch { return null }
}

function writeCache(list: LDBUser[]) {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), list }))
  } catch {}
}

export function StudentWall() {
  const [students, setStudents] = useState<LDBUser[] | null>(() => {
    // 首次挂载时若缓存命中,直接使用,不等 useEffect
    if (typeof window === 'undefined') return null
    const c = readCache()
    return c ? c.list : null
  })

  useEffect(() => {
    let mounted = true
    ;(async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from('users')
        .select('id, handle, name, avatar_url, tagline, department, team_number, role')
        .eq('role', 'student')
        .order('team_number', { ascending: true })
        .order('name', { ascending: true })
      if (!mounted || !data) return
      setStudents(data as LDBUser[])
      writeCache(data as LDBUser[])
    })()
    return () => { mounted = false }
  }, [])

  return (
    <section>
      <div className="flex items-baseline justify-between mb-6">
        <h2 className="text-sm tracking-[0.2em] text-ink-400 uppercase">
          学员墙{students ? ` · ${students.length} 人` : ''}
        </h2>
        <span className="text-xs text-ink-400">点击进入个人页</span>
      </div>

      {students === null ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-card border border-ink-200 bg-white p-5 h-24 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {students.map((u) => <StudentCard key={u.id} user={u} />)}
        </div>
      )}
    </section>
  )
}
