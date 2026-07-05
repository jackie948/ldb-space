import type { Metadata } from 'next'
import { Header } from '@/components/Header'
import './globals.css'

export const metadata: Metadata = {
  title: 'LDB · Lab 1327 Design builds',
  description: 'Lab 1327 × 同济设创 2026 暑期训练营学习空间',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh">
      <body className="min-h-screen">
        <Header />
        <main className="mx-auto max-w-6xl px-6 py-10">{children}</main>
        <footer className="mx-auto max-w-6xl px-6 py-10 text-xs text-ink-400">
          Lab 1327 · Design builds · 2026 Summer Camp
        </footer>
      </body>
    </html>
  )
}
