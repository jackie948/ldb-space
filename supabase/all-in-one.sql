-- ============================================================
-- LDB · Lab 1327 Design builds — Supabase schema
-- Run this in Supabase SQL editor. Idempotent.
-- ============================================================

create extension if not exists "pgcrypto";

-- ------------------------------------------------------------
-- Enums
-- ------------------------------------------------------------
do $$ begin
  create type user_role as enum ('student', 'l1', 'l2', 'admin');
exception when duplicate_object then null; end $$;

do $$ begin
  create type post_type as enum ('profile', 'homework', 'daily', 'question', 'announcement');
exception when duplicate_object then null; end $$;

-- ------------------------------------------------------------
-- users  (linked 1:1 to auth.users via id)
-- ------------------------------------------------------------
create table if not exists public.users (
  -- 注意：这里不设 auth.users 外键 —— seed 数据的占位 uuid 会在 onboarding claim 时被替换成真实 auth.uid()。
  -- 权限只靠 RLS 里的 auth.uid() = id 校验，等价于外键的安全性但支持"预建行 + 事后 claim"。
  id            uuid primary key,
  handle        text unique not null,
  name          text not null,
  email         text unique,
  avatar_url    text,
  tagline       text,                      -- 一句话自我介绍
  bio           text,                      -- markdown 长自述
  links         jsonb default '{}'::jsonb, -- {website, portfolio, github, xhs, wechat}
  free_blocks   jsonb default '[]'::jsonb, -- 自由区块 [{type, title, body}]
  role          user_role not null default 'student',
  cohort        text default 'LDB-2026',
  school        text,
  grad_year     text,
  team_group    text,                      -- e.g. "第 27 组"
  team_project  text,                      -- e.g. "装杯 Poursona"
  l1_mentor     text,                      -- 花名
  last_seen_at  timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists idx_users_role on public.users(role);
create index if not exists idx_users_cohort on public.users(cohort);

-- ------------------------------------------------------------
-- posts
-- ------------------------------------------------------------
create table if not exists public.posts (
  id           uuid primary key default gen_random_uuid(),
  -- on update cascade：onboarding claim 时 users.id 会换成 auth.uid()，让引用跟着走
  -- 显式命名 fk 便于 PostgREST 走 `users!posts_author_id_fkey` 语法
  author_id    uuid not null,
  constraint posts_author_id_fkey foreign key (author_id) references public.users(id) on delete cascade on update cascade,
  type         post_type not null default 'daily',
  title        text,
  content      text not null,             -- markdown
  attachments  jsonb default '[]'::jsonb, -- [{name, url, mime}]
  week         int,                       -- 关联周次：0..8
  tags         text[] default '{}',
  pinned       boolean default false,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists idx_posts_author on public.posts(author_id);
create index if not exists idx_posts_type on public.posts(type);
create index if not exists idx_posts_week on public.posts(week);
create index if not exists idx_posts_created on public.posts(created_at desc);

-- ------------------------------------------------------------
-- comments
-- ------------------------------------------------------------
create table if not exists public.comments (
  id          uuid primary key default gen_random_uuid(),
  post_id     uuid not null,
  author_id   uuid not null,
  content     text not null,
  created_at  timestamptz not null default now(),
  constraint comments_post_id_fkey foreign key (post_id) references public.posts(id) on delete cascade,
  constraint comments_author_id_fkey foreign key (author_id) references public.users(id) on delete cascade on update cascade
);

create index if not exists idx_comments_post on public.comments(post_id);

-- ------------------------------------------------------------
-- updated_at trigger
-- ------------------------------------------------------------
create or replace function public.touch_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_users_updated on public.users;
create trigger trg_users_updated before update on public.users
  for each row execute procedure public.touch_updated_at();

drop trigger if exists trg_posts_updated on public.posts;
create trigger trg_posts_updated before update on public.posts
  for each row execute procedure public.touch_updated_at();

-- ------------------------------------------------------------
-- helpers for RLS
-- ------------------------------------------------------------
create or replace function public.is_admin() returns boolean
language sql stable security definer as $$
  select exists(
    select 1 from public.users u where u.id = auth.uid() and u.role = 'admin'
  );
$$;

create or replace function public.is_staff() returns boolean
language sql stable security definer as $$
  select exists(
    select 1 from public.users u where u.id = auth.uid()
      and u.role in ('l1', 'l2', 'admin')
  );
$$;

-- ------------------------------------------------------------
-- Row Level Security
-- ------------------------------------------------------------
alter table public.users    enable row level security;
alter table public.posts    enable row level security;
alter table public.comments enable row level security;

-- users: everyone signed in can read; each user can update own row; admin can write all
drop policy if exists users_read on public.users;
create policy users_read on public.users
  for select using (auth.uid() is not null);

drop policy if exists users_self_update on public.users;
create policy users_self_update on public.users
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- 用触发器防止普通用户把自己的 role 改成 admin/l1/l2（policy 里 subquery 会走 RLS，容易递归）
create or replace function public.users_protect_role() returns trigger
language plpgsql security definer as $$
begin
  if new.role is distinct from old.role and not public.is_admin() then
    raise exception 'role can only be changed by admin';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_users_protect_role on public.users;
create trigger trg_users_protect_role before update on public.users
  for each row execute procedure public.users_protect_role();

drop policy if exists users_admin_all on public.users;
create policy users_admin_all on public.users
  for all using (public.is_admin()) with check (public.is_admin());

-- posts: everyone signed in can read; students can CRUD own posts; staff read-only extra; admin all
drop policy if exists posts_read on public.posts;
create policy posts_read on public.posts
  for select using (auth.uid() is not null);

drop policy if exists posts_own_insert on public.posts;
create policy posts_own_insert on public.posts
  for insert with check (auth.uid() = author_id);

drop policy if exists posts_own_update on public.posts;
create policy posts_own_update on public.posts
  for update using (auth.uid() = author_id) with check (auth.uid() = author_id);

drop policy if exists posts_own_delete on public.posts;
create policy posts_own_delete on public.posts
  for delete using (auth.uid() = author_id);

drop policy if exists posts_admin_all on public.posts;
create policy posts_admin_all on public.posts
  for all using (public.is_admin()) with check (public.is_admin());

-- comments: everyone signed in can read; write own; admin all
drop policy if exists comments_read on public.comments;
create policy comments_read on public.comments
  for select using (auth.uid() is not null);

drop policy if exists comments_own_write on public.comments;
create policy comments_own_write on public.comments
  for insert with check (auth.uid() = author_id);

drop policy if exists comments_own_delete on public.comments;
create policy comments_own_delete on public.comments
  for delete using (auth.uid() = author_id);

drop policy if exists comments_admin_all on public.comments;
create policy comments_admin_all on public.comments
  for all using (public.is_admin()) with check (public.is_admin());

-- ------------------------------------------------------------
-- Storage bucket for avatars & attachments (create in Dashboard UI:
--   bucket "avatars"  — public
--   bucket "uploads"  — public
-- Or run:
-- ------------------------------------------------------------
-- insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true) on conflict do nothing;
-- insert into storage.buckets (id, name, public) values ('uploads', 'uploads', true) on conflict do nothing;
-- ============================================================
-- LDB · Onboarding (auth.users ↔ public.users 关联)
-- 在 schema.sql 之后运行。
--
-- 三条路径：
--   1. Admin 事先给种子学员生成邀请码；同学登录后填码 → claim。
--   2. 全新用户（种子里没有）→ /welcome 填 handle+name → 新建行。
--   3. Admin 自己首次登录 → 用邮箱匹配已有 admin 行（可选）。
--
-- 关键：claim 会把 users.id 从"占位 uuid"改成 auth.uid()。
-- 该操作必须在 security definer 函数里做，因为改主键别的用户没权限。
-- ============================================================

-- ------------------------------------------------------------
-- invites: 一次性邀请码
-- ------------------------------------------------------------
create table if not exists public.invites (
  code         text primary key,             -- 例如 "LDB-2026-A3F9"
  target_user  uuid references public.users(id) on delete cascade on update cascade,
  -- target_user 为 null = 允许创建全新用户；不为 null = claim 指定行
  -- on update cascade：claim 时 users.id 从占位 uuid 换成 auth.uid()，invites 跟着更新
  role_hint    user_role not null default 'student',
  used_by      uuid,                          -- auth.uid()
  used_at      timestamptz,
  created_at   timestamptz not null default now(),
  expires_at   timestamptz
);

alter table public.invites enable row level security;
drop policy if exists invites_admin_all on public.invites;
create policy invites_admin_all on public.invites
  for all using (public.is_admin()) with check (public.is_admin());

-- 允许登录用户按 code 查自己那条（select 只按 code 过滤）
drop policy if exists invites_self_read on public.invites;
create policy invites_self_read on public.invites
  for select using (auth.uid() is not null);

-- ------------------------------------------------------------
-- claim_invite(code): 把 auth.uid 绑到目标行
-- ------------------------------------------------------------
create or replace function public.claim_invite(p_code text)
returns public.users
language plpgsql security definer set search_path = public as $$
declare
  v_invite public.invites%rowtype;
  v_result public.users%rowtype;
  v_uid    uuid := auth.uid();
  v_email  text;
begin
  if v_uid is null then
    raise exception 'not authenticated';
  end if;

  -- 已经有 profile 的用户不允许再 claim
  if exists (select 1 from public.users where id = v_uid) then
    raise exception 'you already have a profile — cannot claim again';
  end if;

  select * into v_invite from public.invites
    where code = upper(p_code)
      and used_at is null
      and (expires_at is null or expires_at > now());

  if not found then
    raise exception 'invalid or expired invite code';
  end if;

  -- 拿邮箱（如果 auth.users 有）
  select email into v_email from auth.users where id = v_uid;

  if v_invite.target_user is not null then
    -- claim 已有种子行：把 id 迁到 auth.uid()
    update public.users
       set id           = v_uid,
           email        = coalesce(email, v_email),
           last_seen_at = now()
     where id = v_invite.target_user
     returning * into v_result;
  else
    -- 全新用户，稍后走 /welcome 建行；此处只标记邀请码已用
    v_result := null;
  end if;

  update public.invites
     set used_by = v_uid, used_at = now()
   where code = v_invite.code;

  return v_result;
end;
$$;

revoke all on function public.claim_invite(text) from public;
grant execute on function public.claim_invite(text) to authenticated;

-- ------------------------------------------------------------
-- create_profile(handle, name): 全新用户建行
-- ------------------------------------------------------------
create or replace function public.create_profile(p_handle text, p_name text)
returns public.users
language plpgsql security definer set search_path = public as $$
declare
  v_result public.users%rowtype;
  v_uid    uuid := auth.uid();
  v_email  text;
begin
  if v_uid is null then
    raise exception 'not authenticated';
  end if;

  -- 不允许已存在行的用户重复建
  if exists (select 1 from public.users where id = v_uid) then
    raise exception 'profile already exists';
  end if;

  if p_handle !~ '^[a-z0-9_-]{2,32}$' then
    raise exception 'handle must be 2-32 chars, [a-z0-9_-] only';
  end if;

  select email into v_email from auth.users where id = v_uid;

  insert into public.users (id, handle, name, email, role, cohort, last_seen_at)
  values (v_uid, p_handle, p_name, v_email, 'student', 'LDB-2026', now())
  returning * into v_result;

  return v_result;
end;
$$;

revoke all on function public.create_profile(text, text) from public;
grant execute on function public.create_profile(text, text) to authenticated;
-- ============================================================
-- LDB · Storage buckets + policies
-- 在 schema.sql / onboarding.sql 之后运行。
--
-- Buckets:
--   avatars  — 每个用户放一张头像，路径 = <uid>/avatar.<ext>
--   uploads  — 帖子附件，路径 = <uid>/<yyyymm>/<random>.<ext>
--
-- 两者都 public read（省 CDN 麻烦），写权限走 RLS。
-- ============================================================

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do update set public = true;

insert into storage.buckets (id, name, public)
values ('uploads', 'uploads', true)
on conflict (id) do update set public = true;

-- ------------------------------------------------------------
-- storage.objects RLS
-- ------------------------------------------------------------

-- 头像：所有人可读；本人可写自己路径下的对象
drop policy if exists avatars_public_read on storage.objects;
create policy avatars_public_read on storage.objects
  for select using (bucket_id = 'avatars');

drop policy if exists avatars_owner_write on storage.objects;
create policy avatars_owner_write on storage.objects
  for insert with check (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists avatars_owner_update on storage.objects;
create policy avatars_owner_update on storage.objects
  for update using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists avatars_owner_delete on storage.objects;
create policy avatars_owner_delete on storage.objects
  for delete using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- 附件：所有人可读；本人可写自己路径下的对象
drop policy if exists uploads_public_read on storage.objects;
create policy uploads_public_read on storage.objects
  for select using (bucket_id = 'uploads');

drop policy if exists uploads_owner_write on storage.objects;
create policy uploads_owner_write on storage.objects
  for insert with check (
    bucket_id = 'uploads'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists uploads_owner_update on storage.objects;
create policy uploads_owner_update on storage.objects
  for update using (
    bucket_id = 'uploads'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists uploads_owner_delete on storage.objects;
create policy uploads_owner_delete on storage.objects
  for delete using (
    bucket_id = 'uploads'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
-- ============================================================
-- LDB seed data (for local dev / preview)
-- 注意：这里的 id 是"占位 uuid"，不与 auth.users 联动。
-- 用于让首页 Wall / 个人页原型有数据可展示。
-- 真上线时改为通过 auth.signUp 创建，再回填 users 行。
-- ============================================================

-- 项目组 & 部分 L1（花名）
insert into public.users (id, handle, name, role, cohort, tagline)
values
  ('00000000-0000-0000-0000-000000000001'::uuid, 'jialin',   '加林',   'admin', 'LDB-2026', '项目组 · 技术'),
  ('00000000-0000-0000-0000-000000000002'::uuid, 'geer',     '格尔',   'admin', 'LDB-2026', '项目组 · 审美 workshop'),
  ('00000000-0000-0000-0000-000000000003'::uuid, 'fanghuai', '方淮',   'admin', 'LDB-2026', '项目组 · 运营'),
  ('00000000-0000-0000-0000-000000000010'::uuid, 'youer',    '悠二',   'l1', 'LDB-2026', 'L1 · 产品'),
  ('00000000-0000-0000-0000-000000000011'::uuid, 'kongkong', '空空',   'l1', 'LDB-2026', 'L1 · 《产品》workshop'),
  ('00000000-0000-0000-0000-000000000012'::uuid, 'laishengtong','来生瞳','l1', 'LDB-2026', 'L1'),
  ('00000000-0000-0000-0000-000000000013'::uuid, 'modi',     '墨翟',   'l1', 'LDB-2026', 'L1'),
  ('00000000-0000-0000-0000-000000000014'::uuid, 'renhai',   '仁海',   'l1', 'LDB-2026', 'L1'),
  ('00000000-0000-0000-0000-000000000016'::uuid, 'benchen',  '本尘',   'l1', 'LDB-2026', 'L1'),
  ('00000000-0000-0000-0000-000000000017'::uuid, 'mogen',    '摩根',   'l1', 'LDB-2026', 'L1'),
  ('00000000-0000-0000-0000-000000000018'::uuid, 'snape',    '斯内普', 'l1', 'LDB-2026', 'L1')
on conflict (handle) do nothing;

-- 15 位已确认同学
insert into public.users (id, handle, name, role, cohort, school, grad_year, team_group, team_project, l1_mentor, tagline)
values
  ('10000000-0000-0000-0000-000000000001'::uuid, 'caiyuanxi', '蔡沅希', 'student', 'LDB-2026', '电子与信息工程学院',       '2027', '第3组',  'AirJam 手势交互乐器',       '悠二',   '直通 offer · AirJam'),
  ('10000000-0000-0000-0000-000000000002'::uuid, 'xuzhaoqi',  '徐兆琪', 'student', 'LDB-2026', '上海国际设计创新学院',     '2028', '第27组', '装杯 Poursona',              '来生瞳', '装杯 Poursona'),
  ('10000000-0000-0000-0000-000000000003'::uuid, 'huqinxuan', '胡沁萱', 'student', 'LDB-2026', '上海国际设计创新学院',     '2028', '第27组', '装杯 Poursona',              '悠二',   '装杯 Poursona'),
  ('10000000-0000-0000-0000-000000000004'::uuid, 'tuhuaer',   '涂桦儿', 'student', 'LDB-2026', '上海国际设计创新学院',     '2028', '第2组',  'Momentune (NFC 音乐分享)',   '悠二',   'Momentune'),
  ('10000000-0000-0000-0000-000000000005'::uuid, 'liuhuier',  '刘蕙尔', 'student', 'LDB-2026', '上海国际设计创新学院',     '2028', '第2组',  'Momentune (NFC 音乐分享)',   '空空',   'Momentune'),
  ('10000000-0000-0000-0000-000000000006'::uuid, 'gongwenze', '龚玟泽', 'student', 'LDB-2026', '电子与信息工程学院',       '2027', '第3组',  'AirJam 手势交互乐器',        '墨翟',   'AirJam'),
  ('10000000-0000-0000-0000-000000000007'::uuid, 'liuxinran', '刘昕然', 'student', 'LDB-2026', '设计创意学院',             '2028', '第5组',  'RhythmRide（骑行）',         '格尔',   'RhythmRide'),
  ('10000000-0000-0000-0000-000000000008'::uuid, 'panshu',    '潘姝',   'student', 'LDB-2026', '设计创意学院',             '2028', '第8组',  'SoftMood 智能正念捏捏乐',    '悠二',   'SoftMood'),
  ('10000000-0000-0000-0000-000000000009'::uuid, 'chenleqi',  '陈乐其', 'student', 'LDB-2026', '设计创意学院',             '2028', '第9组',  'PeekDock (AI 桌宠硬件)',     '仁海',   'PeekDock'),
  ('10000000-0000-0000-0000-000000000010'::uuid, 'zhouzherui','周哲睿', 'student', 'LDB-2026', '设计创意学院',             '2028', '第25组', 'Oops! We Met~（社交随身智能体）', '加林', 'Oops! We Met~'),
  ('10000000-0000-0000-0000-000000000011'::uuid, 'yangqianer','杨芊尔', 'student', 'LDB-2026', '设计创意学院',             '2028', '第31组', '出走小芽 City Sprout',       '本尘',   'City Sprout'),
  ('10000000-0000-0000-0000-000000000012'::uuid, 'sunyibo',   '孙一博', 'student', 'LDB-2026', '设计创意学院',             '2028', '第17组', '植播',                       '摩根',   '植播'),
  ('10000000-0000-0000-0000-000000000013'::uuid, 'wenhuanru', '温焕茹', 'student', 'LDB-2026', '设计创意学院',             '2028', '第22组', '开个小差：平行宇宙观测器',   '来生瞳', '平行宇宙观测器'),
  ('10000000-0000-0000-0000-000000000014'::uuid, 'huoxinyi',  '霍馨熠', 'student', 'LDB-2026', '设计创意学院',             '2028', '第29组', 'PeTV 桌面 AI 实时动态相框',  '格尔',   'PeTV'),
  ('10000000-0000-0000-0000-000000000015'::uuid, 'libingjie', '李冰婕', 'student', 'LDB-2026', '设计创意学院',             '2028', '第30组', 'REECHO',                     '仁海',   'REECHO'),
  ('10000000-0000-0000-0000-000000000016'::uuid, 'zengxiang', '曾翔',   'student', 'LDB-2026', '未参赛',                   null,   null,     null,                         '加林', ''),
  ('10000000-0000-0000-0000-000000000017'::uuid, 'yezixin',   '叶子欣', 'student', 'LDB-2026', '设计创意学院',             '2028', '第20组', '朕不错·Well Done',           '斯内普', 'Well Done')
on conflict (handle) do nothing;

-- 两条示例帖，让 feed 不至于空空如也
insert into public.posts (author_id, type, title, content, week, tags)
values
  ('00000000-0000-0000-0000-000000000001'::uuid, 'announcement',
   '欢迎来到 LDB 学习空间',
   '这里是我们两个月的家。个人页 = 你的门牌；发帖 = 敲敲邻居家的门。\n\n> Design builds — 不止会想，还会做。',
   0, '{welcome,opening}'),
  ('10000000-0000-0000-0000-000000000004'::uuid, 'homework',
   '开营前作业：我的个人网站 v0',
   '第一版还很粗糙 —— 参考了 [Bruno Simon](https://bruno-simon.com/) 的 3D 交互，但先做了 2D 版本。下周迭代。',
   0, '{"作业0","个人网站"}')
on conflict do nothing;
