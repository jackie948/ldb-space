# LDB · Lab 1327 Design builds

Lab 1327 × 同济设创 2026 暑期训练营的学习空间原型。

- 极简、克制的视觉底子（呼应"品味"这一维度）
- 每位同学一个 `/u/[handle]` 主页，可编辑 bio、链接、自由区块
- Feed 汇聚所有人的作业 / 日常 / 提问
- L1/L2 可在 admin 观测学员轨迹（下一步）

技术栈：**Next.js 14 (App Router) · Supabase · Tailwind · TypeScript**

## 本地起服务

无 Supabase 环境变量时会自动 fallback 到 mock 数据 —— 可以先看首页 + 个人页原型。

```bash
npm install     # 或者 pnpm i / bun i
npm run dev     # http://localhost:3000
```

看到默认页面就说明架子起来了。首页会显示 17 位同学（seed 里给的名单）。

## 接 Supabase（真数据）

1. 到 [supabase.com](https://supabase.com) 创建项目。
2. `Settings → API` 里拷贝 `Project URL` 和 `anon` key，写入 `.env.local`：

   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
   ```

3. 打开 SQL Editor，**按顺序**跑这四个 SQL：
   1. `supabase/schema.sql` —— 建表 + RLS + 触发器
   2. `supabase/onboarding.sql` —— 邀请码、`claim_invite` / `create_profile` 函数
   3. `supabase/storage.sql` —— 建 avatars / uploads bucket + policy
   4. `supabase/seed.sql` —— 灌 17 位同学 + 项目组占位数据（可选，用于原型演示）
4. `Authentication → Providers → Email` 打开 Magic Link；`URL Configuration` 里把 site URL 设成本地 / vercel 域名。
5. Admin 首次登录：先在 Dashboard `Authentication → Users` 手动创建自己的邮箱账号，然后到 SQL Editor 跑
   ```sql
   -- 用你 auth.users 的 id 替换掉 seed 里 '加林' 那行的占位 id
   update public.users set id = '<your-auth-uid>' where handle = 'jialin';
   ```
   或者不用 seed，直接 `insert into users (id, handle, name, role) values ('<your-auth-uid>', 'jialin', '加林', 'admin');`
6. 之后就走 `/admin/invites` 给其他同学发码，他们登录后填码 claim 名单里的位置。

## 目录

```
app/
  page.tsx              # 首页（学员墙 + 时间线 + 四类能力）
  u/[handle]/page.tsx   # 个人页
  feed/page.tsx         # 全站动态流
  curriculum/page.tsx   # 8 周课程
  login/page.tsx        # 邮箱魔法链接登录
components/
  StudentCard.tsx
  Markdown.tsx
lib/
  supabase/{server,browser}.ts
  types.ts
  mock.ts               # 无 Supabase 时的假数据
supabase/
  schema.sql            # 建表 + RLS + 触发器
  seed.sql              # 17 位同学 + L1 占位数据
```

## RLS 策略速记

- **users**：所有登录者可读；本人只能改自己的行；`role` 字段本人改不了；admin 全权限。
- **posts**：所有登录者可读；作者可 insert / update / delete 自己的帖子；admin 全权限。
- **comments**：同上。

## 已实现

- ✅ 首页学员墙 / 四类能力 / 8 周时间线
- ✅ 个人页 `/u/[handle]` + in-place 编辑（tagline / bio / links / free_blocks）
- ✅ Feed `/feed` + Composer（作业 / 日常 / 提问 / 通知）
- ✅ 帖子详情 `/p/[id]` + 评论
- ✅ 课程页 `/curriculum`
- ✅ Magic-link 登录 / 登出 / middleware session 刷新
- ✅ 观测台 `/admin`（每位同学的作业 / 日常 / 提问 / 评论 / 最近活跃）
- ✅ 邀请码 `/admin/invites` + `/welcome` 首次登录（claim 名单里的位置 or 建全新档案）
- ✅ Storage 上传：头像（`avatars` bucket）+ 帖子附件（`uploads` bucket，图片自动预览、其他文件挂链接）
- ✅ 自动 Avatar（无头像时用首字 + 稳定色号占位）
- ✅ RLS + 触发器防止普通用户提权改 role

## 下一步 TODO

- [ ] `@提到导师` 通知（新增 notifications 表 + realtime）
- [ ] 周报邮件（每周日自动发给 L1/L2）
- [ ] 结营年鉴一键导出 PDF
- [ ] 附件上传进度条 / 大文件切片

## 部署到 Vercel

Push 到 GitHub，在 Vercel 里 Import，配上三个环境变量即可。绑域名建议 `ldb.lab1327.xyz` 之类子域。
