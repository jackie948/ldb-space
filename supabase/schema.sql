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
