import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="text-center py-24">
      <p className="text-xs tracking-[0.2em] text-ink-400 uppercase">404</p>
      <h1 className="mt-4 text-2xl font-semibold">这里没有内容</h1>
      <Link href="/" className="mt-6 inline-block text-accent underline underline-offset-2 text-sm">
        回到学员墙
      </Link>
    </div>
  )
}
