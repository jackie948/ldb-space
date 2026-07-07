// 缓存 60 秒 —— 学员墙不是实时业务，60 秒延迟能接受，页面速度从 2-3s 降到 300ms
export const revalidate = 60

import { StudentCard } from '@/components/StudentCard'
import { MOCK_STUDENTS, isSupabaseConfigured } from '@/lib/mock'
import { createClient } from '@/lib/supabase/server'
import type { LDBUser } from '@/lib/types'

const CAPABILITIES = [
  { key: 'Taste',    zh: '品味',    body: '对产品、视觉、交互有清晰的审美判断力' },
  { key: 'Native',   zh: 'AI 素养', body: 'AI native 的思考与工作方式；把 AI 嵌入日常工作流' },
  { key: 'Thinking', zh: '产品力', body: '从真实场景抽象问题：洞察 → 设计原则 → 产品决策' },
  { key: 'Growth',   zh: '成长力', body: '快速变化的环境里能持续学习、自我迭代，有"成事儿"心态' },
]

async function getStudents(): Promise<LDBUser[]> {
  if (!isSupabaseConfigured()) return MOCK_STUDENTS
  const supabase = createClient()
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('role', 'student')
    .order('team_number', { ascending: true })
    .order('name',        { ascending: true })
  if (error || !data) return MOCK_STUDENTS
  return data as LDBUser[]
}

export default async function Home() {
  const students = await getStudents()

  return (
    <div className="space-y-16">
      {/* Hero */}
      <section className="pt-6">
        <h1 className="text-4xl md:text-5xl font-semibold tracking-tight leading-tight">
          Design <span className="italic text-accent">builds</span>.
        </h1>
        <div className="mt-8 max-w-2xl space-y-4 text-ink-600 leading-relaxed">
          <p className="font-medium text-ink-900">为什么是 Design builds？</p>
          <p>
            过去，"产品设计" 和 "工程建造" 是两件事 ——
            产品设计负责想清楚，工程负责做出来。
          </p>
          <p>
            AI 时代，这条边界正在消失。一个人可以用 AI 把想法 ship 出来。
            产品设计不再只是需求方，而且就"会"建造。
          </p>
          <p>
            这就是 <span className="italic">Design builds</span>，
            Lab 1327 想找的是什么样的人 —— 不止会想，还会做。
          </p>
        </div>
      </section>

      {/* Four capabilities */}
      <section>
        <h2 className="text-sm tracking-[0.2em] text-ink-400 uppercase mb-6">Full-stack Builder — 四类能力</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {CAPABILITIES.map((c) => (
            <div key={c.key} className="rounded-card border border-ink-200 bg-white p-5">
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-semibold">{c.zh}</span>
                <span className="text-xs text-ink-400">{c.key}</span>
              </div>
              <p className="mt-2 text-sm text-ink-600 leading-relaxed">{c.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Wall */}
      <section>
        <div className="flex items-baseline justify-between mb-6">
          <h2 className="text-sm tracking-[0.2em] text-ink-400 uppercase">学员墙 · {students.length} 人</h2>
          <span className="text-xs text-ink-400">点击进入个人页</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {students.map((u) => <StudentCard key={u.id} user={u} />)}
        </div>
      </section>
    </div>
  )
}
