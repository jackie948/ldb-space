-- ============================================================
-- 重置学员数据到 Excel 分组名单的 20 人
-- 只保留 姓名 / 组织(department) / 组别(team_number) 三个信息
-- 说明：清空 role='student' 的记录，重新插入
-- ============================================================

-- 加两个字段（如果没有）
alter table public.users add column if not exists department  text;
alter table public.users add column if not exists team_number text;

-- 先删掉旧学员（不影响 admin/l1 账号）
-- 注意：如果某位学员账号已经 claim 了（id 变成真实 auth uid），删掉后要重建
delete from public.users where role = 'student';

-- 灌新的 20 位（占位 uuid，等同学登录 claim 后替换）
insert into public.users (id, handle, name, role, cohort, department, team_number, tagline) values
  ('10000000-0000-0000-0000-000000000001'::uuid, 'liuhuier',   '刘蕙尔', 'student', 'LDB-2026', 'Lab1组',              '1', ''),
  ('10000000-0000-0000-0000-000000000002'::uuid, 'caiyuanxi',  '蔡沅希', 'student', 'LDB-2026', 'Lab2组',              '1', ''),
  ('10000000-0000-0000-0000-000000000003'::uuid, 'zhouzherui', '周哲睿', 'student', 'LDB-2026', '视觉设计三组',        '1', ''),
  ('10000000-0000-0000-0000-000000000004'::uuid, 'libingjie',  '李冰婕', 'student', 'LDB-2026', '设计运营组',          '1', ''),
  ('10000000-0000-0000-0000-000000000005'::uuid, 'panshu',     '潘姝',   'student', 'LDB-2026', 'Lab2组',              '2', ''),
  ('10000000-0000-0000-0000-000000000006'::uuid, 'xuzhaoqi',   '徐兆琪', 'student', 'LDB-2026', '视觉设计三组',        '2', ''),
  ('10000000-0000-0000-0000-000000000007'::uuid, 'lipeijin',   '李佩锦', 'student', 'LDB-2026', '创新体验设计组',      '2', ''),
  ('10000000-0000-0000-0000-000000000008'::uuid, 'yangqianer', '杨芊尔', 'student', 'LDB-2026', '多媒体设计组',        '2', ''),
  ('10000000-0000-0000-0000-000000000009'::uuid, 'tuhuaer',    '涂桦儿', 'student', 'LDB-2026', 'Lab2组',              '3', ''),
  ('10000000-0000-0000-0000-000000000010'::uuid, 'wenhuanru',  '温焕茹', 'student', 'LDB-2026', '视觉设计三组',        '3', ''),
  ('10000000-0000-0000-0000-000000000011'::uuid, 'huoxinyi',   '霍馨熠', 'student', 'LDB-2026', '创新体验设计组',      '3', ''),
  ('10000000-0000-0000-0000-000000000012'::uuid, 'gongwenze',  '龚玟泽', 'student', 'LDB-2026', 'Lab研发中台组',       '3', ''),
  ('10000000-0000-0000-0000-000000000013'::uuid, 'huqinxuan',  '胡沁萱', 'student', 'LDB-2026', 'Lab2组',              '4', ''),
  ('10000000-0000-0000-0000-000000000014'::uuid, 'zengxiang',  '曾翔',   'student', 'LDB-2026', 'Lab3组',              '4', ''),
  ('10000000-0000-0000-0000-000000000015'::uuid, 'chenleqi',   '陈乐其', 'student', 'LDB-2026', '设计运营组',          '4', ''),
  ('10000000-0000-0000-0000-000000000016'::uuid, 'yezixin',    '叶子欣', 'student', 'LDB-2026', 'Lab2组',              '4', ''),
  ('10000000-0000-0000-0000-000000000017'::uuid, 'sunyibo',    '孙一博', 'student', 'LDB-2026', '品牌运营组',          '5', ''),
  ('10000000-0000-0000-0000-000000000018'::uuid, 'zhangyue',   '张越',   'student', 'LDB-2026', 'Lab7组',              '5', ''),
  ('10000000-0000-0000-0000-000000000019'::uuid, 'zhangzhehan','张哲晗', 'student', 'LDB-2026', 'Lab7组',              '5', ''),
  ('10000000-0000-0000-0000-000000000020'::uuid, 'hejiayun',   '何佳韵', 'student', 'LDB-2026', '交易商业体验设计组', '5', '')
on conflict (handle) do update set
  name        = excluded.name,
  department  = excluded.department,
  team_number = excluded.team_number,
  role        = excluded.role,
  cohort      = excluded.cohort;
