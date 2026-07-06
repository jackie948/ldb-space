'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/browser'

type Mode = 'password' | 'magic'
type Status = 'idle' | 'sending' | 'sent' | 'error'

export default function LoginPage() {
  const router = useRouter()
  const [mode, setMode] = useState<Mode>('password')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [msg, setMsg] = useState('')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('sending')
    setMsg('')
    try {
      const supabase = createClient()
      if (mode === 'password') {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        setStatus('idle')
        router.push('/')
        router.refresh()
      } else {
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
        })
        if (error) throw error
        setStatus('sent')
      }
    } catch (err: any) {
      setStatus('error')
      setMsg(err?.message ?? 'unknown error')
    }
  }

  return (
    <div className="max-w-md mx-auto pt-10">
      <h1 className="text-2xl font-semibold">登录</h1>
      <p className="mt-2 text-sm text-ink-600">
        {mode === 'password' ? '用邮箱和密码登录。' : '输入邮箱，我们会给你发一封魔法链接。'}
      </p>

      {/* Mode switcher */}
      <div className="mt-6 inline-flex text-xs rounded-card border border-ink-200 overflow-hidden">
        <button
          type="button"
          onClick={() => setMode('password')}
          className={`px-3 py-1.5 ${mode === 'password' ? 'bg-ink-900 text-ink-50' : 'text-ink-600 hover:text-ink-900'}`}
        >
          密码登录
        </button>
        <button
          type="button"
          onClick={() => setMode('magic')}
          className={`px-3 py-1.5 ${mode === 'magic' ? 'bg-ink-900 text-ink-50' : 'text-ink-600 hover:text-ink-900'}`}
        >
          魔法链接
        </button>
      </div>

      <form onSubmit={submit} className="mt-6 space-y-4">
        <input
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="name@tongji.edu.cn"
          className="w-full px-4 py-3 rounded-card border border-ink-200 focus:border-ink-900 outline-none"
        />
        {mode === 'password' && (
          <input
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="密码"
            className="w-full px-4 py-3 rounded-card border border-ink-200 focus:border-ink-900 outline-none"
          />
        )}
        <button
          type="submit"
          disabled={status === 'sending'}
          className="w-full py-3 rounded-card bg-ink-900 text-ink-50 font-medium disabled:opacity-50"
        >
          {status === 'sending'
            ? (mode === 'password' ? '登录中…' : '发送中…')
            : (mode === 'password' ? '登录' : '发送魔法链接')}
        </button>
      </form>

      {status === 'sent'  && <p className="mt-4 text-sm text-ink-600">已发送 —— 去邮箱看看。</p>}
      {status === 'error' && <p className="mt-4 text-sm text-accent">出错了：{msg}</p>}

      {mode === 'password' && (
        <p className="mt-6 text-xs text-ink-400">
          没有密码？先用魔法链接登录一次，或联系项目组。
        </p>
      )}
    </div>
  )
}
