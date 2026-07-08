// 完全静态,所有逻辑走客户端 —— 保存直连 Supabase,跳过 Netlify 中转
import { ProfileEditor } from '@/components/ProfileEditor'

export default function EditProfilePage({ params }: { params: { handle: string } }) {
  return <ProfileEditor handle={params.handle} />
}
