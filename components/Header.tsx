import Link from 'next/link'
import { ThemeToggle } from './ThemeToggle'
import { HeaderUser } from './HeaderUser'

// Header 现在是纯静态渲染 —— 不再阻塞页面加载去查 auth
// 用户信息由 <HeaderUser> 客户端组件异步加载并原地渲染
export function Header() {
  return (
    <header className="border-b border-ink-200 bg-ink-50/80 backdrop-blur sticky top-0 z-10">
      <div className="mx-auto max-w-6xl px-6 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="inline-block w-2 h-2 rounded-full bg-accent" />
          LDB｜Lab 1327 · Design builds
        </Link>
        <nav className="flex items-center gap-6 text-sm text-ink-600">
          <ThemeToggle />
          <HeaderUser />
        </nav>
      </div>
    </header>
  )
}
