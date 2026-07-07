'use client'

import { useEffect, useState } from 'react'

export function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark' | null>(null)

  // 初次挂载：从 localStorage 或系统偏好读初始值
  useEffect(() => {
    const saved = (typeof window !== 'undefined' && localStorage.getItem('ldb-theme')) as 'light' | 'dark' | null
    const initial: 'light' | 'dark' = saved ?? 'light'
    setTheme(initial)
    document.documentElement.classList.toggle('dark', initial === 'dark')
  }, [])

  function toggle() {
    const next: 'light' | 'dark' = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    document.documentElement.classList.toggle('dark', next === 'dark')
    try { localStorage.setItem('ldb-theme', next) } catch {}
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="切换主题"
      className="text-ink-400 hover:text-ink-900 text-lg leading-none"
      title={theme === 'dark' ? '切换到浅色' : '切换到深色'}
    >
      {theme === 'dark' ? '☀' : '☾'}
    </button>
  )
}
