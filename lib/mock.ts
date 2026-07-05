// 无 Supabase 环境变量时用的假数据，便于原型演示。
// 生产环境走真实数据库。

import type { LDBUser } from './types'

export const MOCK_STUDENTS: LDBUser[] = [
  { id: 's1',  handle: 'caiyuanxi',  name: '蔡沅希', role: 'student', cohort: 'LDB-2026', school: '电子与信息工程学院', grad_year: '2027', team_group: '第3组',  team_project: 'AirJam 手势交互乐器',            l1_mentor: '悠二',   tagline: '直通 offer · AirJam',   created_at: '', updated_at: '' },
  { id: 's2',  handle: 'xuzhaoqi',   name: '徐兆琪', role: 'student', cohort: 'LDB-2026', school: '上海国际设计创新学院', grad_year: '2028', team_group: '第27组', team_project: '装杯 Poursona',                 l1_mentor: '来生瞳', tagline: '装杯 Poursona',        created_at: '', updated_at: '' },
  { id: 's3',  handle: 'huqinxuan',  name: '胡沁萱', role: 'student', cohort: 'LDB-2026', school: '上海国际设计创新学院', grad_year: '2028', team_group: '第27组', team_project: '装杯 Poursona',                 l1_mentor: '悠二',   tagline: '装杯 Poursona',        created_at: '', updated_at: '' },
  { id: 's4',  handle: 'tuhuaer',    name: '涂桦儿', role: 'student', cohort: 'LDB-2026', school: '上海国际设计创新学院', grad_year: '2028', team_group: '第2组',  team_project: 'Momentune (NFC 音乐分享)',      l1_mentor: '悠二',   tagline: 'Momentune',            created_at: '', updated_at: '' },
  { id: 's5',  handle: 'liuhuier',   name: '刘蕙尔', role: 'student', cohort: 'LDB-2026', school: '上海国际设计创新学院', grad_year: '2028', team_group: '第2组',  team_project: 'Momentune (NFC 音乐分享)',      l1_mentor: '空空',   tagline: 'Momentune',            created_at: '', updated_at: '' },
  { id: 's6',  handle: 'gongwenze',  name: '龚玟泽', role: 'student', cohort: 'LDB-2026', school: '电子与信息工程学院',    grad_year: '2027', team_group: '第3组',  team_project: 'AirJam 手势交互乐器',            l1_mentor: '墨翟',   tagline: 'AirJam',               created_at: '', updated_at: '' },
  { id: 's7',  handle: 'liuxinran',  name: '刘昕然', role: 'student', cohort: 'LDB-2026', school: '设计创意学院',          grad_year: '2028', team_group: '第5组',  team_project: 'RhythmRide（骑行）',            l1_mentor: '格尔',   tagline: 'RhythmRide',           created_at: '', updated_at: '' },
  { id: 's8',  handle: 'panshu',     name: '潘姝',   role: 'student', cohort: 'LDB-2026', school: '设计创意学院',          grad_year: '2028', team_group: '第8组',  team_project: 'SoftMood 智能正念捏捏乐',        l1_mentor: '悠二',   tagline: 'SoftMood',             created_at: '', updated_at: '' },
  { id: 's9',  handle: 'chenleqi',   name: '陈乐其', role: 'student', cohort: 'LDB-2026', school: '设计创意学院',          grad_year: '2028', team_group: '第9组',  team_project: 'PeekDock (AI 桌宠硬件)',        l1_mentor: '仁海',   tagline: 'PeekDock',             created_at: '', updated_at: '' },
  { id: 's10', handle: 'zhouzherui', name: '周哲睿', role: 'student', cohort: 'LDB-2026', school: '设计创意学院',          grad_year: '2028', team_group: '第25组', team_project: 'Oops! We Met~',                 l1_mentor: '加林',   tagline: 'Oops! We Met~',        created_at: '', updated_at: '' },
  { id: 's11', handle: 'yangqianer', name: '杨芊尔', role: 'student', cohort: 'LDB-2026', school: '设计创意学院',          grad_year: '2028', team_group: '第31组', team_project: '出走小芽 City Sprout',           l1_mentor: '本尘',   tagline: 'City Sprout',          created_at: '', updated_at: '' },
  { id: 's12', handle: 'sunyibo',    name: '孙一博', role: 'student', cohort: 'LDB-2026', school: '设计创意学院',          grad_year: '2028', team_group: '第17组', team_project: '植播',                          l1_mentor: '摩根',   tagline: '植播',                 created_at: '', updated_at: '' },
  { id: 's13', handle: 'wenhuanru',  name: '温焕茹', role: 'student', cohort: 'LDB-2026', school: '设计创意学院',          grad_year: '2028', team_group: '第22组', team_project: '开个小差：平行宇宙观测器',        l1_mentor: '来生瞳', tagline: '平行宇宙观测器',       created_at: '', updated_at: '' },
  { id: 's14', handle: 'huoxinyi',   name: '霍馨熠', role: 'student', cohort: 'LDB-2026', school: '设计创意学院',          grad_year: '2028', team_group: '第29组', team_project: 'PeTV 桌面 AI 实时动态相框',      l1_mentor: '格尔',   tagline: 'PeTV',                 created_at: '', updated_at: '' },
  { id: 's15', handle: 'libingjie',  name: '李冰婕', role: 'student', cohort: 'LDB-2026', school: '设计创意学院',          grad_year: '2028', team_group: '第30组', team_project: 'REECHO',                        l1_mentor: '仁海',   tagline: 'REECHO',               created_at: '', updated_at: '' },
  { id: 's16', handle: 'zengxiang',  name: '曾翔',   role: 'student', cohort: 'LDB-2026', school: null,                    grad_year: null,    team_group: null,      team_project: null,                            l1_mentor: '加林',   tagline: '未参赛，特招入营',      created_at: '', updated_at: '' },
  { id: 's17', handle: 'yezixin',    name: '叶子欣', role: 'student', cohort: 'LDB-2026', school: '设计创意学院',          grad_year: '2028', team_group: '第20组', team_project: '朕不错·Well Done',              l1_mentor: '斯内普', tagline: 'Well Done',            created_at: '', updated_at: '' },
]

export function isSupabaseConfigured() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
}
