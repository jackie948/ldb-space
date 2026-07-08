-- ============================================================
-- 批量重建 15 位同学的 auth 账号（除已成功的 zhangzhehan）
-- 参考 Dashboard "Add user" 的完整字段结构
-- ============================================================

-- 1. 先删掉旧的 auth 账号（保留 public.users 里的 seed 行）
delete from auth.identities where user_id in (
  select id from auth.users where email in (
    'liuhuier@xiaohongshu.com',
    'zhouzherui@xiaohongshu.com',
    'libingjie@xiaohongshu.com',
    'panshu2@xiaohongshu.com',
    'xuzhaoqi@xiaohongshu.com',
    'lipeijin1@xiaohongshu.com',
    'yangqianer@xiaohongshu.com',
    'tuhuaer@xiaohongshu.com',
    'wenhuanru@xiaohongshu.com',
    'huoxinyi@xiaohongshu.com',
    'huqinxuan@xiaohongshu.com',
    'zengxiang@xiaohongshu.com',
    'yezixin1@xiaohongshu.com',
    'sunyibo@xiaohongshu.com',
    'zhangyue116@xiaohongshu.com',
    'yinyimeng@xiaohongshu.com'
  )
);
delete from auth.users where email in (
  'liuhuier@xiaohongshu.com',
  'zhouzherui@xiaohongshu.com',
  'libingjie@xiaohongshu.com',
  'panshu2@xiaohongshu.com',
  'xuzhaoqi@xiaohongshu.com',
  'lipeijin1@xiaohongshu.com',
  'yangqianer@xiaohongshu.com',
  'tuhuaer@xiaohongshu.com',
  'wenhuanru@xiaohongshu.com',
  'huoxinyi@xiaohongshu.com',
  'huqinxuan@xiaohongshu.com',
  'zengxiang@xiaohongshu.com',
  'yezixin1@xiaohongshu.com',
  'sunyibo@xiaohongshu.com',
  'zhangyue116@xiaohongshu.com',
  'yinyimeng@xiaohongshu.com'
);

-- 2. 还原 public.users 里的占位 UID（因为 auth.users 删了，这里的 id 引用失效了）
-- 我们把它们改回占位 uuid，方便后续 Dashboard 建号后再 update
-- （其实这一步可选，因为 update public.users set id 时会重新指向新 UID）
