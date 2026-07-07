'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/browser'

export default function SettingsPage() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [status, setStatus] = useState<'idle' | 'saving' | 'ok' | 'error'>('idle')
  const [msg, setMsg] = useState('')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('saving')
    setMsg('')
    try {
      if (password.length < 6) throw new Error('密码至少 6 位')
      if (password !== confirm) throw new Error('两次输入不一致')
      const supabase = createClient()
      const { error } = await supabase.auth.updateUser({ password })
      if (error) throw error
      setStatus('ok')
      setPassword('')
      setConfirm('')
    } catch (err: any) {
      setStatus('error')
      setMsg(err?.message ?? '未知错误')
    }
  }

  return (
    <div className="max-w-md mx-auto pt-10">
      <h1 className="text-2xl font-semibold">修改密码</h1>
      <p className="mt-2 text-sm text-ink-600">
        首次登录后建议改成你自己的密码。至少 6 位。
      </p>

      <form onSubmit={submit} className="mt-8 space-y-4">
        <input
          type="password"
          required
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="新密码"
          className="w-full px-4 py-3 rounded-card border border-ink-200 focus:border-ink-900 outline-none"
        />
        <input
          type="password"
          required
          autoComplete="new-password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="再输一次"
          className="w-full px-4 py-3 rounded-card border border-ink-200 focus:border-ink-900 outline-none"
        />
        <button
          type="submit"
          disabled={status === 'saving'}
          className="w-full py-3 rounded-card bg-ink-900 text-ink-50 font-medium disabled:opacity-50"
        >
          {status === 'saving' ? '保存中…' : '保存新密码'}
        </button>
      </form>

      {status === 'ok'    && <p className="mt-4 text-sm text-ink-600">已保存 ✅</p>}
      {status === 'error' && <p className="mt-4 text-sm text-accent">出错了：{msg}</p>}
    </div>
  )
}
