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
