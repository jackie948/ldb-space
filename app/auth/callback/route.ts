import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (!code) return NextResponse.redirect(`${origin}/login?error=missing_code`)

  const supabase = createClient()
  const { error, data } = await supabase.auth.exchangeCodeForSession(code)
  if (error) return NextResponse.redirect(`${origin}/login?error=auth_failed`)

  // 检查是否已经有 profile；没有的话去 /welcome 认领邀请码 / 建档
  const uid = data.user?.id
  if (uid) {
    const { data: profile } = await supabase.from('users').select('handle').eq('id', uid).maybeSingle()
    if (!profile) return NextResponse.redirect(`${origin}/welcome`)
  }

  return NextResponse.redirect(`${origin}${next}`)
}
