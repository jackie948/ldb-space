const WEEKS = [
  { week: 0, title: '入职 · 开营前作业', bullets: ['最晚 7.7 全员入职、拉群、保密协议', '每人 coding 个人网站（经历 / 总结 / 作品集 / 互动游戏）'] },
  { week: 1, title: '开营 · Opening',    bullets: ['破冰、跨职能学习小组组队', '项目整体安排 & 运转机制', '樱木 or 斯内普 分享'] },
  { week: 2, title: 'AI 实践分享',        bullets: ['加林技术分享', '草菇 / 阿图 / 埃隆 1-2 人分享（待定）'] },
  { week: 3, title: '格尔《审美》',       bullets: ['审美判断的底层逻辑', 'Reference 体系搭建', 'AI 时代的品味稀缺性', '小组 / 个人作业'] },
  { week: 5, title: '空空《产品》',       bullets: ['从访谈到洞察', '洞察 → 可执行的设计原则', '杨锦陆 or 其他 0-1 产品分享', '小组 / 个人作业'] },
  { week: 8, title: '结营',              bullets: ['小组结业展示：一个新产品公司可以投资 / 回同济讲一门 xhs 产品设计课', '专业讲师作业打分 + L1 输入 → 现场定 offer', '发放 27 届校招 offer + Hipo offer'] },
]

export default function CurriculumPage() {
  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-semibold">课程 · 8 周</h1>
      <p className="mt-1 text-sm text-ink-400">2026 年 7 月 – 8 月</p>

      <ol className="mt-10 space-y-8">
        {WEEKS.map((w) => (
          <li key={w.week} className="rounded-card border border-ink-200 bg-white p-6">
            <div className="flex items-baseline gap-3">
              <span className="text-xs tracking-[0.2em] text-ink-400 uppercase">第 {w.week} 周</span>
              <h2 className="text-lg font-semibold">{w.title}</h2>
            </div>
            <ul className="mt-3 space-y-1.5 text-sm text-ink-600 list-disc ml-5">
              {w.bullets.map((b, i) => <li key={i}>{b}</li>)}
            </ul>
          </li>
        ))}
      </ol>
    </div>
  )
}
