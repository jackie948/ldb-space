export const dynamic = 'force-dynamic'

import { StudentCard } from '@/components/StudentCard'
import { MOCK_STUDENTS, isSupabaseConfigured } from '@/lib/mock'
import { createClient } from '@/lib/supabase/server'
import type { LDBUser } from '@/lib/types'

const CAPABILITIES = [
  { key: 'Taste',    zh: '品味',    body: '对产品、视觉、交互有清晰的审美判断力' },
  { key: 'Native',   zh: 'AI 素养', body: 'AI native 的思考与工作方式；把 AI 嵌入日常工作流' },
  { key: 'Thinking', zh: '产品思维', body: '从真实场景抽象问题：洞察 → 设计原则 → 产品决策' },
  { key: 'Growth',   zh: '成长力', body: '快速变化的环境里能持续学习、自我迭代，有"成事儿"心态' },
]

const TIMELINE = [
  { week: '第 0 周', title: '入职 · 开营前作业', detail: '最晚 7.7 全员入职；每人 coding 个人网站' },
  { week: '第 1 周', title: '开营', detail: '破冰 · 跨职能组队 · 项目机制介绍' },
  { week: '第 2 周', title: 'AI 实践分享', detail: '加林技术分享 + 草菇 / 阿图 / 埃隆' },
  { week: '第 3 周', title: '格尔《审美》', detail: '审美判断底层逻辑 · Reference 体系 · AI 时代的品味稀缺性' },
  { week: '第 5 周', title: '空空《产品》', detail: '从访谈到洞察 · 洞察 → 可执行的设计原则' },
  { week: '第 8 周', title: '结营', detail: 'Demo Day 8.24–27 · 结营 8.28 · 现场定 offer' },
]

async function getStudents(): Promise<LDBUser[]> {
  if (!isSupabaseConfigured()) return MOCK_STUDENTS
  const supabase = createClient()
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('role', 'student')
    .order('name', { ascending: true })
  if (error || !data) return MOCK_STUDENTS
  return data as LDBUser[]
}

export default async function Home() {
  const students = await getStudents()

  return (
    <div className="space-y-16">
      {/* Hero */}
      <section className="pt-6">
        <p className="text-xs tracking-[0.2em] text-ink-400 uppercase">Lab 1327 × 同济设创 · 2026 Summer</p>
        <h1 className="mt-4 text-4xl md:text-5xl font-semibold tracking-tight leading-tight">
          Design <span className="italic text-accent">builds</span>.
          <br />
          <span className="text-ink-600">不止会想，还会做。</span>
        </h1>
        <p className="mt-6 max-w-2xl text-ink-600 leading-relaxed">
          LDB 是 Lab 1327 与同济设计与创意学院的首届暑期训练营。
          我们相信 AI 时代，产品设计与工程建造的边界正在消失 ——
          一个人可以用 AI 把想法 ship 出来。
          这两个月，我们想和 20 位同学一起验证这件事。
        </p>
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

      {/* Timeline */}
      <section>
        <h2 className="text-sm tracking-[0.2em] text-ink-400 uppercase mb-6">8 周节奏</h2>
        <ol className="border-l border-ink-200 space-y-6 pl-6">
          {TIMELINE.map((t) => (
            <li key={t.week} className="relative">
              <span className="absolute -left-[31px] top-1.5 w-2 h-2 rounded-full bg-ink-900" />
              <div className="text-xs text-ink-400">{t.week}</div>
              <div className="font-medium text-ink-900">{t.title}</div>
              <div className="text-sm text-ink-600">{t.detail}</div>
            </li>
          ))}
        </ol>
      </section>

      {/* Wall */}
      <section>
        <div className="flex items-baseline justify-between mb-6">
          <h2 className="text-sm tracking-[0.2em] text-ink-400 uppercase">学员墙 · {students.length} 人</h2>
          <span className="text-xs text-ink-400">点击进入个人页</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {students.map((u) => <StudentCard key={u.id} user={u} />)}
        </div>
      </section>
    </div>
  )
}
