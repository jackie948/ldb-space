# 交接给加林 · 15 分钟上线一个可访问 URL

Jackie 用 Claude 搭了 LDB 学习空间的第一版。整个 repo 在这里；帮忙跑一下、发个链接给她看看效果就行。

**技术栈：** Next.js 14 · TypeScript · Tailwind · Supabase (Postgres + Auth + Storage)

---

## 最快 30 秒：本地看 mock 版（不接 Supabase）

```bash
cd ldb-space
npm install
npm run dev
```

打开 <http://localhost:3000> 就能看到首页 + 学员墙 + 个人页。**这一步不需要 Supabase，走 mock 数据。**

如果只是让 Jackie 快速看一眼视觉方向，到这里就够了 —— 你截图 / 录屏发给她就行。

---

## 15 分钟：部署一个真正可访问的 URL

### Step 1 · Supabase（5 分钟）

1. <https://supabase.com/dashboard> → 新建项目（选东京 / 新加坡区）。
2. 项目建好后，**SQL Editor** 里**按顺序**跑这 4 个文件（在 `supabase/` 目录下）：
   1. `schema.sql`
   2. `onboarding.sql`
   3. `storage.sql`
   4. `seed.sql`（可选，灌 17 位同学占位数据）
3. **Authentication → Providers → Email**：确保 "Enable email provider" + "Enable Email OTP" 都开着（Magic Link 用的就是 OTP）。
4. **Settings → API** 复制两个东西：
   - `Project URL`
   - `anon` `public` key
5. **Settings → Auth → URL Configuration**：`Site URL` 先填 `http://localhost:3000`，等 Vercel 部署好了再改。

### Step 2 · Vercel（5 分钟）

1. `cd ldb-space && git init && git add . && git commit -m 'init'`
2. GitHub 建一个 private repo，`git remote add origin ...` + `git push`。
3. <https://vercel.com/new> → Import 那个 repo → 一路 Next。
4. **Environment Variables** 填：
   - `NEXT_PUBLIC_SUPABASE_URL` = 第 4 步的 Project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = 第 4 步的 anon key
5. Deploy 完拿到一个 `xxx.vercel.app` 域名 —— 这就是给 Jackie 的链接。
6. 回 Supabase 把 `Site URL` 改成这个 vercel 域名，Redirect URLs 里也把 `https://xxx.vercel.app/auth/callback` 加进去。

### Step 3 · Admin 账号（3 分钟）

Jackie 是 admin，需要她能登录。两种做法：

**A. 让 Jackie 自己登录一次，然后把她挂到 admin 行上：**

1. 让她在 vercel 域名点"登录"→ 输邮箱 → 点邮件里的链接。
2. 首次登录会跳到 `/welcome`，让她点"我没有邀请码 → 建一个新档案"，随便填个 handle。
3. 你到 Supabase SQL Editor 跑：
   ```sql
   update public.users set role = 'admin' where handle = '<她填的 handle>';
   ```
4. 让她刷新页面，就能看到导航栏里出现"观测台"。

**B. 或者直接绑到 seed 里的 `加林` admin 行：**

1. 你自己登录（走 `/welcome` → 填 handle 建档案 → SQL 里 update role = admin），你就是 admin。
2. 之后在 `/admin/invites` 里给 Jackie 生成一个邀请码（选目标同学 = 加林 seed 行），把 code 发她；她登录后填 code 就 claim 到 admin。

**推荐 A**，更直白。

### Step 4 · 把链接发给 Jackie

vercel 域名 + Jackie 的登录邮箱 → 她就能看到全部功能。

---

## 关键设计（帮你快速理解）

- `app/` 路由都是 App Router；带 `actions.ts` 的目录里是 server actions
- `middleware.ts` 刷新 Supabase session
- 首次登录未 claim 用户会被 callback route 自动送到 `/welcome`
- seed 里 15 位同学是**占位 uuid**，`claim_invite` RPC 会把 id 换成真实 `auth.uid()`（`on update cascade` 让 posts / comments 引用跟着走）
- RLS 全部开了，普通用户改不了自己的 role（触发器守着）
- Avatar 无图时用首字 + 稳定色（`components/Avatar.tsx`）

## 需要注意

- Composer 里 attachments 上传走 **client component**（`'use client'`），走 Supabase Storage，需要用户登录后 RLS 才通过
- `.env.example` 是模板，实际填到 Vercel 环境变量里；本地想跑真数据的话拷贝一份成 `.env.local`

## 有问题时的排查

- 登录点了 magic link 但跳回 `/login?error=...` → 大概率是 Supabase 里 Redirect URLs 没加 vercel 域名
- 首页学员墙是空的 → seed.sql 没跑，或者 users 表被 RLS 挡了（但登录后 users 表所有登录用户都能读）
- 观测台看不见 → 当前登录用户 role 不是 l1/l2/admin
- 上传头像 403 → 检查 `storage.sql` 有没有跑；bucket 是不是 public

---

任何一步卡住直接问 Jackie，她那边有跟 Claude 完整的对话上下文。
