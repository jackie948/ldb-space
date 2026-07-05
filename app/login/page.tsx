'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/browser'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [msg, setMsg] = useState<string>('')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('sending')
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${window.location.origin}/` },
      })
      if (error) throw error
      setStatus('sent')
    } catch (err: any) {
      setStatus('error')
      setMsg(err?.message ?? 'unknown error')
    }
  }

  return (
    <div className="max-w-md mx-auto pt-10">
      <h1 className="text-2xl font-semibold">登录</h1>
      <p className="mt-2 text-sm text-ink-600">
        输入邮箱，我们会给你发一封魔法链接。点击即登录，无需密码。
      </p>

      <form onSubmit={submit} className="mt-8 space-y-4">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="name@tongji.edu.cn"
          className="w-full px-4 py-3 rounded-card border border-ink-200 focus:border-ink-900 outline-none"
        />
        <button
          type="submit"
          disabled={status === 'sending'}
          className="w-full py-3 rounded-card bg-ink-900 text-ink-50 font-medium disabled:opacity-50"
        >
          {status === 'sending' ? '发送中…' : '发送魔法链接'}
        </button>
      </form>

      {status === 'sent'  && <p className="mt-4 text-sm text-ink-600">已发送 —— 去邮箱看看。</p>}
      {status === 'error' && <p className="mt-4 text-sm text-accent">出错了：{msg}</p>}
    </div>
  )
}
