export type UserRole = 'student' | 'l1' | 'l2' | 'admin'

export type LDBUser = {
  id: string
  handle: string
  name: string
  email?: string | null
  avatar_url?: string | null
  tagline?: string | null
  bio?: string | null
  links?: Record<string, string> | null
  free_blocks?: Array<{ type: string; title: string; body: string }> | null
  role: UserRole
  cohort?: string | null
  department?: string | null
  team_number?: string | null
  // 以下字段保留以便老数据兼容，但前台不再显示
  school?: string | null
  grad_year?: string | null
  team_group?: string | null
  team_project?: string | null
  l1_mentor?: string | null
  last_seen_at?: string | null
  created_at: string
  updated_at: string
}

export type PostType = 'profile' | 'homework' | 'daily' | 'question' | 'announcement'

export type LDBPost = {
  id: string
  author_id: string
  type: PostType
  title?: string | null
  content: string
  attachments?: Array<{ name: string; url: string; mime?: string }> | null
  week?: number | null
  tags?: string[] | null
  pinned?: boolean
  created_at: string
  updated_at: string
}
