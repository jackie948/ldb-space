// 关掉 middleware —— 之前每次请求都会跑 supabase.auth.getUser() 一次 (200-400ms)
// 认证放到客户端和 server actions 里处理，页面本身不再阻塞
export function middleware() { return }

export const config = {
  // 只匹配 /auth 相关路由（如果需要 session 刷新）
  matcher: [],
}
