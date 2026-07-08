// 个人页现在完全静态,所有数据在客户端异步加载 + 内存缓存
import { ProfileView } from '@/components/ProfileView'

export default function UserPage({ params }: { params: { handle: string } }) {
  return <ProfileView handle={params.handle} />
}
