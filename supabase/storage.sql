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
