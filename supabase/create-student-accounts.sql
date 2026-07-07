-- ============================================================
-- 批量为 16 位同学创建 auth 账号 + 随机密码
-- 关联到 public.users 中对应 handle 的 seed 行
-- ============================================================

-- 先把有邮箱后缀数字的 handle 更新一下（例如 panshu → panshu2）
update public.users set handle = 'panshu2'    where handle = 'panshu';
update public.users set handle = 'lipeijin1'  where handle = 'lipeijin';
update public.users set handle = 'yezixin1'   where handle = 'yezixin';
update public.users set handle = 'zhangyue116' where handle = 'zhangyue';

-- ============================================================
-- 核心函数：给指定 handle 创建 auth 账号并把 public.users 的 id 迁移过去
-- ============================================================
create or replace function public.admin_create_student_login(
  p_handle text,
  p_email  text,
  p_password text
) returns text
language plpgsql security definer as $$
declare
  v_new_uid uuid;
  v_old_uid uuid;
begin
  -- 从 public.users 找到当前占位 uuid
  select id into v_old_uid from public.users where handle = p_handle;
  if v_old_uid is null then
    return 'SKIP: handle ' || p_handle || ' not found';
  end if;

  -- 检查邮箱是否已经存在
  if exists (select 1 from auth.users where email = p_email) then
    return 'SKIP: email ' || p_email || ' already exists';
  end if;

  -- 生成新 UID
  v_new_uid := gen_random_uuid();

  -- 直接向 auth.users 插入（绕过 signup 流程）
  insert into auth.users (
    id, instance_id, email, encrypted_password,
    email_confirmed_at, aud, role,
    raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at
  ) values (
    v_new_uid, '00000000-0000-0000-0000-000000000000',
    p_email, crypt(p_password, gen_salt('bf')),
    now(), 'authenticated', 'authenticated',
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{}'::jsonb,
    now(), now()
  );

  insert into auth.identities (
    id, user_id, provider, provider_id, identity_data,
    created_at, updated_at, last_sign_in_at
  ) values (
    gen_random_uuid(), v_new_uid, 'email', v_new_uid::text,
    jsonb_build_object('sub', v_new_uid::text, 'email', p_email, 'email_verified', true),
    now(), now(), now()
  );

  -- 把 public.users 里的占位 id 换成新 auth uid
  update public.users set id = v_new_uid, email = p_email where id = v_old_uid;

  return 'OK';
end;
$$;

-- ============================================================
-- 批量创建：为每位同学生成一个随机 8 位密码，返回对照表
-- ============================================================
with rand_pwd as (
  select
    handle,
    email,
    -- 随机 8 位密码：4 组 [大小写+数字] 拼起来，去掉容易混淆的字符
    substring(
      translate(
        encode(gen_random_bytes(12), 'base64'),
        'IlO0/+=', 'abcdxyz'
      ),
      1, 8
    ) as password
  from (values
    ('liuhuier',     'liuhuier@xiaohongshu.com'),
    ('zhouzherui',   'zhouzherui@xiaohongshu.com'),
    ('libingjie',    'libingjie@xiaohongshu.com'),
    ('panshu2',      'panshu2@xiaohongshu.com'),
    ('xuzhaoqi',     'xuzhaoqi@xiaohongshu.com'),
    ('lipeijin1',    'lipeijin1@xiaohongshu.com'),
    ('yangqianer',   'yangqianer@xiaohongshu.com'),
    ('tuhuaer',      'tuhuaer@xiaohongshu.com'),
    ('wenhuanru',    'wenhuanru@xiaohongshu.com'),
    ('huoxinyi',     'huoxinyi@xiaohongshu.com'),
    ('huqinxuan',    'huqinxuan@xiaohongshu.com'),
    ('zengxiang',    'zengxiang@xiaohongshu.com'),
    ('yezixin1',     'yezixin1@xiaohongshu.com'),
    ('sunyibo',      'sunyibo@xiaohongshu.com'),
    ('zhangyue116',  'zhangyue116@xiaohongshu.com'),
    ('zhangzhehan',  'zhangzhehan@xiaohongshu.com')
  ) as t(handle, email)
)
select
  u.name          as "姓名",
  rp.email        as "邮箱",
  rp.password     as "初始密码",
  public.admin_create_student_login(rp.handle, rp.email, rp.password) as "状态"
from rand_pwd rp
left join public.users u on u.handle = rp.handle
order by u.team_number, u.name;
