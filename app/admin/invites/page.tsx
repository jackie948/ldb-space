import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { isSupabaseConfigured } from '@/lib/mock'
import { getCurrentUser, isAdmin } from '@/lib/currentUser'
import { issueInvite, revokeInvite } from './actions'

export default async function InvitesPage() {
  if (!isSupabaseConfigured()) return <div>需要 Supabase。</div>
  const me = await getCurrentUser()
  if (!isAdmin(me)) redirect('/')

  const supabase = createClient()
  const [{ data: invites }, { data: unclaimed }] = await Promise.all([
    supabase.from('invites').select('*').order('created_at', { ascending: false }),
    supabase.from('users').select('id, handle, name').eq('role', 'student').order('name'),
  ])

  // 已 claim 过（id 变了）的种子行现在其实找不到原 target_user；简化处理
  const targetOptions = unclaimed ?? []

  return (
    <div>
      <div className="flex items-center gap-3">
        <Link href="/admin" className="text-xs text-ink-400 hover:text-ink-900">← 观测台</Link>
      </div>
      <h1 className="mt-2 text-2xl font-semibold">邀请码</h1>
      <p className="mt-1 text-sm text-ink-400">发给同学，他们登录后填码即可 claim 名单里的位置</p>

      <form action={issueInvite} className="mt-8 rounded-card border border-ink-200 bg-white p-5 space-y-3">
        <div className="flex flex-wrap gap-3 items-end">
          <label className="flex-1 min-w-[220px]">
            <div className="text-xs tracking-[0.2em] text-ink-400 uppercase mb-1.5">绑定同学</div>
            <select name="target_user" className="w-full px-3 py-2 rounded-card border border-ink-200 bg-white text-sm">
              <option value="">— 不绑定（用于全新用户建档）—</option>
              {targetOptions.map((u) => (
                <option key={u.id} value={u.id}>{u.name} / {u.handle}</option>
              ))}
            </select>
          </label>
          <label>
            <div className="text-xs tracking-[0.2em] text-ink-400 uppercase mb-1.5">角色</div>
            <select name="role_hint" defaultValue="student" className="px-3 py-2 rounded-card border border-ink-200 bg-white text-sm">
              <option value="student">student</option>
              <option value="l1">l1</option>
              <option value="l2">l2</option>
              <option value="admin">admin</option>
            </select>
          </label>
          <button type="submit" className="px-4 py-2 rounded-card bg-ink-900 text-ink-50 text-sm font-medium">
            生成邀请码
          </button>
        </div>
      </form>

      <div className="mt-10 overflow-x-auto rounded-card border border-ink-200 bg-white">
        <table className="w-full text-sm">
          <thead className="text-xs tracking-wider text-ink-400 uppercase bg-ink-50">
            <tr>
              <th className="text-left px-4 py-3">Code</th>
              <th className="text-left px-4 py-3">绑定同学</th>
              <th className="text-left px-4 py-3">角色</th>
              <th className="text-left px-4 py-3">状态</th>
              <th className="text-right px-4 py-3">生成时间</th>
              <th className="text-right px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-200">
            {(invites ?? []).map((iv: any) => {
              const target = targetOptions.find((u) => u.id === iv.target_user)
              return (
                <tr key={iv.code}>
                  <td className="px-4 py-3 font-mono">{iv.code}</td>
                  <td className="px-4 py-3">{target ? `${target.name} / ${target.handle}` : '（全新用户）'}</td>
                  <td className="px-4 py-3 text-ink-600">{iv.role_hint}</td>
                  <td className={`px-4 py-3 ${iv.used_at ? 'text-ink-400' : 'text-ink-900'}`}>
                    {iv.used_at ? `已使用 · ${new Date(iv.used_at).toLocaleDateString('zh-CN')}` : '未使用'}
                  </td>
                  <td className="px-4 py-3 text-right text-ink-400 text-xs">
                    {new Date(iv.created_at).toLocaleDateString('zh-CN')}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {!iv.used_at && (
                      <form action={revokeInvite.bind(null, iv.code)}>
                        <button type="submit" className="text-xs text-accent hover:underline">撤回</button>
                      </form>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
