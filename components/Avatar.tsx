import { cn } from '@/lib/cn'

// 8 个精心挑选的柔和底色 —— 呼应"品味"，不刺眼
const PALETTE = [
  { bg: '#F5E6D3', fg: '#5C3A1E' }, // 沙米
  { bg: '#E8D5F2', fg: '#3B1F52' }, // 淡紫
  { bg: '#D6EBE0', fg: '#1E4B32' }, // 抹茶
  { bg: '#FDE0DC', fg: '#8B1A2B' }, // 樱粉
  { bg: '#DDE7F5', fg: '#1E3A5F' }, // 雾蓝
  { bg: '#F5EAB8', fg: '#5C4A0E' }, // 米黄
  { bg: '#E5DACF', fg: '#3B2A1E' }, // 米咖
  { bg: '#C9DDD0', fg: '#22403A' }, // 松绿
]

// 让同一个名字每次拿到同一个颜色
function hashCode(str: string): number {
  let h = 0
  for (let i = 0; i < str.length; i++) h = ((h << 5) - h + str.charCodeAt(i)) | 0
  return Math.abs(h)
}

function pickColor(seed: string) {
  return PALETTE[hashCode(seed) % PALETTE.length]
}

function initial(name: string): string {
  const trimmed = name.trim()
  if (!trimmed) return '·'
  // 中文取第一个字，英文取首字母大写
  const first = trimmed[0]
  return /[a-zA-Z]/.test(first) ? first.toUpperCase() : first
}

type Size = 'sm' | 'md' | 'lg' | 'xl'
const SIZE_CLASS: Record<Size, string> = {
  sm: 'w-7 h-7 text-xs',
  md: 'w-12 h-12 text-base',
  lg: 'w-16 h-16 text-xl',
  xl: 'w-20 h-20 text-2xl',
}

export function Avatar({
  name,
  src,
  size = 'md',
  seed,
  className,
}: {
  name: string
  src?: string | null
  size?: Size
  /** 决定颜色的种子；默认用 name。用 handle 更稳定（改名不换色）。 */
  seed?: string
  className?: string
}) {
  const color = pickColor(seed ?? name)
  const cls = cn(
    'rounded-full flex items-center justify-center overflow-hidden font-semibold shrink-0 border border-ink-200',
    SIZE_CLASS[size],
    className,
  )

  if (src) {
    return (
      <span className={cls}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={name} className="w-full h-full object-cover" />
      </span>
    )
  }

  return (
    <span
      className={cls}
      style={{ backgroundColor: color.bg, color: color.fg }}
      aria-label={name}
    >
      {initial(name)}
    </span>
  )
}
