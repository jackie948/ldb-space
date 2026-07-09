// 开营呈现页：2026.7.9 现场大屏使用
// 完全静态、不依赖数据库，保证仪式当天不受 Supabase / 网络波动影响
// 结构对齐【呈现版】文档：项目概念 → 项目回顾（漏斗）→ 训练营安排 → 结营目标

export const metadata = {
  title: 'LDB 开营 · 2026.7.9',
  description: 'Lab 1327 × 同济设创 首届暑期训练营 · Design builds',
}

// —— 四阶段漏斗 ——
const FUNNEL = [
  {
    stage: '第一阶段',
    name: '赛事吸引',
    filter: 'AI 热情 × 自驱力 × 审美',
    from: '近 300 位同济学生报名',
    to: '128 人入选「AI Builder 创造营」',
    scale: 128,
  },
  {
    stage: '第二阶段',
    name: 'Demo 作品展示',
    filter: '创意 × 动手 × 学习迭代',
    from: '30 组作品',
    to: '50 人决赛 · 5 组获奖',
    scale: 50,
  },
  {
    stage: '第三阶段',
    name: '能力面试',
    filter: '产品设计思维 × AI 工具',
    from: '',
    to: '20 位候选人通过 L1 面试',
    scale: 20,
  },
  {
    stage: '第四阶段',
    name: '暑期训练营',
    filter: '培养 & 选拔：项目实战能力 × 潜力',
    from: '20 名入营',
    to: 'aim 产出 N 张 offer（正式 + 长期实习）',
    scale: 10,
    current: true,
  },
]

// —— 训练营 8 周安排 ——
const SCHEDULE = [
  {
    week: '第 1 周',
    type: '开营',
    topic: 'Opening',
    actions: ['破冰、跨职能学习小组组队', '项目整体安排 & 运转机制介绍'],
    highlight: true,
  },
  {
    week: '第 2 周',
    type: '专业技能',
    topic: 'AI 实践分享',
    actions: [
      'AI 工具的使用策略分享 — 加林',
      '1–2 位在职同学代表分享',
    ],
  },
  {
    week: '第 4 周',
    type: '专业技能',
    topic: '格尔 · 审美',
    actions: [
      '审美判断的底层逻辑、Reference 体系搭建',
      '如何在 AI 时代保持「品味的稀缺性」',
      '1–2 位在职同学代表分享',
      '小组 / 个人作业',
    ],
  },
  {
    week: '第 6 周',
    type: '专业技能',
    topic: '空空 · 产品',
    actions: [
      '从访谈到洞察',
      '如何把洞察翻译成可执行的产品原则',
      '1–2 位在职同学代表分享',
      '小组 / 个人作业',
    ],
  },
  {
    week: '第 8 周',
    type: '结营',
    topic: '结营分享会',
    actions: [
      '结业展示（个人为单位）：一个新产品 —— 好的作品有机会未来孵化为真正的产品；或一份自我总结',
      '结合专业讲师作业打分 + L1 输入 + 现场分享 → 现场定 offer',
    ],
    highlight: true,
  },
]

export default function OpeningPage() {
  return (
    <div className="space-y-32 pb-16">

      {/* ============ 第 00 页 · 封面 ============ */}
      <section className="min-h-[80vh] flex flex-col justify-center pt-4">
        <div className="text-xs tracking-[0.3em] text-ink-400 uppercase mb-8">
          Lab 1327 × 同济设计与创意学院
        </div>
        <h1 className="text-5xl md:text-7xl font-semibold tracking-tight leading-[1.05]">
          Design <span className="italic text-accent">builds</span>.
        </h1>
        <p className="mt-6 text-xl md:text-2xl text-ink-600 leading-relaxed max-w-3xl">
          Lab 1327 · 首届暑期训练营
        </p>
        <div className="mt-4 flex items-baseline gap-4 text-sm text-ink-400 tracking-widest">
          <span>LDB · Summer Camp 2026</span>
          <span className="text-ink-200">/</span>
          <span>7.9 — 8.28</span>
        </div>

        <div className="mt-20 flex items-center gap-3 text-sm">
          <span className="inline-block w-2 h-2 rounded-full bg-accent animate-pulse" />
          <span className="text-ink-900 font-medium">今天开营</span>
          <span className="text-ink-400">2026.7.9 · 301 / 215</span>
        </div>
      </section>

      {/* ============ 第 01 页 · 项目概念 ============ */}
      <section>
        <div className="flex items-baseline gap-4 mb-10">
          <span className="text-xs tracking-[0.3em] text-ink-400 uppercase">01</span>
          <h2 className="text-2xl md:text-3xl font-semibold">项目概念</h2>
        </div>

        <div className="rounded-card border border-ink-200 bg-white p-8 md:p-10 mb-10">
          <div className="flex flex-col md:flex-row md:items-baseline md:gap-6">
            <div className="text-4xl md:text-5xl font-semibold tracking-tight">
              Lab 1327 <span className="italic text-accent">Design builds</span>
            </div>
            <div className="mt-3 md:mt-0 text-ink-400">
              <span className="font-mono text-lg text-ink-900">LDB</span>
              <span className="ml-2 text-sm">· 2026 暑期首届</span>
            </div>
          </div>
        </div>

        <div className="text-sm tracking-[0.2em] text-ink-400 uppercase mb-6">
          为什么是 Design builds？
        </div>

        <div className="max-w-3xl space-y-6 text-lg text-ink-600 leading-relaxed">
          <p>
            过去，<span className="text-ink-900 font-medium">"产品设计"和"工程建造"</span>是两件事 ——
            产品设计负责想清楚，工程负责做出来。
          </p>
          <p>
            AI 时代，这条边界正在消失。一个人可以用 AI 把想法 ship 出来。
            产品设计不再只是需求方，而且就"会"建造。
          </p>
          <p className="text-ink-900 font-medium">
            这就是 <span className="italic">Design builds</span> ——
            Lab 1327 想找的是什么样的人：不止会想，还会做。
          </p>
        </div>
      </section>

      {/* ============ 第 02 页 · 项目回顾（漏斗） ============ */}
      <section>
        <div className="flex items-baseline gap-4 mb-10">
          <span className="text-xs tracking-[0.3em] text-ink-400 uppercase">02</span>
          <h2 className="text-2xl md:text-3xl font-semibold">项目回顾</h2>
          <span className="text-sm text-ink-400 hidden md:inline">从 300 到 20 的四阶段漏斗</span>
        </div>

        <ol className="space-y-4">
          {FUNNEL.map((f, i) => {
            // 漏斗宽度：按每阶段规模递减，视觉上收窄
            const widths = ['w-full', 'w-[78%]', 'w-[56%]', 'w-[38%]']
            const w = widths[i] ?? 'w-full'
            return (
              <li key={f.stage} className="flex justify-center">
                <div
                  className={`${w} rounded-card border p-6 md:p-7 transition-colors ${
                    f.current
                      ? 'bg-accent-soft border-accent'
                      : 'bg-white border-ink-200'
                  }`}
                >
                  <div className="flex items-baseline justify-between gap-4">
                    <div className="flex items-baseline gap-3 min-w-0">
                      <span className={`text-xs tracking-[0.2em] uppercase ${
                        f.current ? 'text-accent' : 'text-ink-400'
                      }`}>
                        {f.stage}
                      </span>
                      <h3 className="text-lg md:text-xl font-semibold truncate">
                        【{f.name}】
                      </h3>
                    </div>
                    {f.current && (
                      <span className="text-xs tracking-[0.2em] uppercase text-accent shrink-0">
                        Now
                      </span>
                    )}
                  </div>

                  <div className="mt-3 text-xs tracking-wide text-ink-400">
                    筛选：<span className="text-ink-600">{f.filter}</span>
                  </div>

                  <div className="mt-4 flex items-baseline gap-3 text-sm">
                    {f.from && (
                      <>
                        <span className="text-ink-600">{f.from}</span>
                        <span className="text-ink-400">→</span>
                      </>
                    )}
                    <span className="text-ink-900 font-medium">{f.to}</span>
                  </div>
                </div>
              </li>
            )
          })}
        </ol>
      </section>

      {/* ============ 第 03 页 · 训练营整体安排 ============ */}
      <section>
        <div className="flex items-baseline gap-4 mb-4">
          <span className="text-xs tracking-[0.3em] text-ink-400 uppercase">03</span>
          <h2 className="text-2xl md:text-3xl font-semibold">暑期训练营整体安排</h2>
        </div>
        <p className="text-sm text-ink-400 mb-10">
          时间周期：2026 年 7 月 – 8 月月底
        </p>

        {/* 桌面端表格 */}
        <div className="hidden md:block rounded-card border border-ink-200 bg-white overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="text-xs tracking-[0.2em] text-ink-400 uppercase bg-ink-50 border-b border-ink-200">
                <th className="text-left px-6 py-4 w-24">周次</th>
                <th className="text-left px-6 py-4 w-24">类型</th>
                <th className="text-left px-6 py-4 w-48">主题</th>
                <th className="text-left px-6 py-4">关键动作</th>
              </tr>
            </thead>
            <tbody>
              {SCHEDULE.map((s) => (
                <tr
                  key={s.week}
                  className={`border-b border-ink-200 last:border-b-0 align-top ${
                    s.highlight ? 'bg-accent-soft/50' : ''
                  }`}
                >
                  <td className="px-6 py-5 text-sm font-medium text-ink-900 whitespace-nowrap">
                    {s.week}
                  </td>
                  <td className={`px-6 py-5 text-xs tracking-wide uppercase ${
                    s.highlight ? 'text-accent font-medium' : 'text-ink-400'
                  }`}>
                    {s.type}
                  </td>
                  <td className="px-6 py-5 font-medium text-ink-900">
                    {s.topic}
                  </td>
                  <td className="px-6 py-5">
                    <ol className="space-y-1.5 text-sm text-ink-600 list-decimal ml-4">
                      {s.actions.map((a, i) => <li key={i}>{a}</li>)}
                    </ol>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 移动端卡片 */}
        <div className="md:hidden space-y-3">
          {SCHEDULE.map((s) => (
            <div
              key={s.week}
              className={`rounded-card border p-5 ${
                s.highlight
                  ? 'bg-accent-soft border-accent/40'
                  : 'bg-white border-ink-200'
              }`}
            >
              <div className="flex items-baseline justify-between mb-2">
                <span className="text-sm font-medium text-ink-900">{s.week}</span>
                <span className={`text-xs tracking-wide uppercase ${
                  s.highlight ? 'text-accent' : 'text-ink-400'
                }`}>
                  {s.type}
                </span>
              </div>
              <div className="text-base font-medium mb-3">{s.topic}</div>
              <ol className="space-y-1.5 text-sm text-ink-600 list-decimal ml-4">
                {s.actions.map((a, i) => <li key={i}>{a}</li>)}
              </ol>
            </div>
          ))}
        </div>
      </section>

      {/* ============ 结营产出 · 关键信息 ============ */}
      <section>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-card border border-ink-200 bg-white p-6">
            <div className="text-xs tracking-[0.2em] text-ink-400 uppercase mb-3">
              结营产出 · 01
            </div>
            <div className="text-lg font-semibold text-ink-900 mb-2">
              27 届校招 offer
            </div>
            <p className="text-sm text-ink-600 leading-relaxed">
              N 张 · 面向 27 届毕业生
            </p>
          </div>
          <div className="rounded-card border border-ink-200 bg-white p-6">
            <div className="text-xs tracking-[0.2em] text-ink-400 uppercase mb-3">
              结营产出 · 02
            </div>
            <div className="text-lg font-semibold text-ink-900 mb-2">
              Hipo offer
            </div>
            <p className="text-sm text-ink-600 leading-relaxed">
              N 张 · 面向 28 / 29 届及更小年纪的优秀同学，未来实习期参考特殊薪资
            </p>
          </div>
          <div className="rounded-card border border-ink-200 bg-white p-6">
            <div className="text-xs tracking-[0.2em] text-ink-400 uppercase mb-3">
              结营产出 · 03
            </div>
            <div className="text-lg font-semibold text-ink-900 mb-2">
              结营证书
            </div>
            <p className="text-sm text-ink-600 leading-relaxed">
              颁发给全部完成的同学
            </p>
          </div>
        </div>
      </section>

      {/* ============ AI 账号说明 ============ */}
      <section>
        <div className="rounded-card border border-ink-200 bg-ink-50 p-6 md:p-8 flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex-1">
            <div className="text-xs tracking-[0.2em] text-ink-400 uppercase mb-2">
              保障 · AI 账号
            </div>
            <div className="text-ink-900">
              同学自行购置报销 ·
              <span className="ml-2 font-semibold text-accent">每月 100 美金额度</span>
            </div>
          </div>
          <a
            href="https://docs.xiaohongshu.com/doc/2f24893c698dbf8d47894217bab04e76"
            target="_blank"
            rel="noreferrer"
            className="text-sm text-ink-600 hover:text-ink-900 underline underline-offset-4"
          >
            报销流程文档 →
          </a>
        </div>
      </section>

      {/* ============ Ending · 目标 ============ */}
      <section className="pt-8">
        <div className="rounded-card border border-ink-900 bg-ink-900 text-ink-50 p-10 md:p-16">
          <div className="text-xs tracking-[0.3em] uppercase opacity-60 mb-6">
            两个月后
          </div>
          <p className="text-2xl md:text-4xl font-medium leading-relaxed">
            我们希望从这 20 位同学里，<br />
            看到 Lab 1327 的下一批 <span className="text-accent">full-stack builder</span>。
          </p>
          <p className="mt-10 text-sm opacity-60 leading-relaxed max-w-2xl">
            这是首届 LDB。SOP、课程、导师体系都会在这两个月里被真的打磨出来 ——
            我们邀请你和我们一起，把它建成。
          </p>
        </div>
      </section>

    </div>
  )
}
