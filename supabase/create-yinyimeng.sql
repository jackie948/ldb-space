-- ============================================================
-- 为尹艺萌创建测试账号
-- ============================================================

-- 1. 先在 public.users 里建 seed 行（先用占位 uuid，函数会替换）
insert into public.users (id, handle, name, role, cohort, department, team_number, tagline) values
  ('20000000-0000-0000-0000-000000000001'::uuid, 'yinyimeng', '尹艺萌', 'student', 'LDB-2026', '测试', 'T', '测试账号')
on conflict (handle) do update set
  name        = excluded.name,
  department  = excluded.department,
  team_number = excluded.team_number,
  role        = excluded.role;

-- 2. 用之前建好的函数创建 auth 账号 + 关联
select
  '尹艺萌'                              as "姓名",
  'yinyimeng@xiaohongshu.com'          as "邮箱",
  'LDB2026'                             as "初始密码",
  public.admin_create_student_login('yinyimeng', 'yinyimeng@xiaohongshu.com', 'LDB2026') as "状态";
