'use client'

import { useRef } from 'react'
import { createPost } from '@/app/feed/actions'
import { AttachmentUpload } from './AttachmentUpload'

export function Composer() {
  const formRef = useRef<HTMLFormElement>(null)

  async function submit(formData: FormData) {
    await createPost(formData)
    formRef.current?.reset()
  }

  return (
    <form ref={formRef} action={submit} className="rounded-card border border-ink-200 bg-white p-5 space-y-3">
      <div className="flex gap-2 flex-wrap items-center">
        <select name="type" defaultValue="daily" className={selectCls}>
          <option value="daily">日常</option>
          <option value="homework">作业</option>
          <option value="question">提问</option>
          <option value="announcement">通知</option>
        </select>
        <input
          name="week"
          type="number"
          min={0}
          max={12}
          placeholder="第 x 周"
          className={`${selectCls} w-24`}
        />
        <input
          name="tags"
          placeholder="标签（空格 / 逗号分隔）"
          className={`${selectCls} flex-1 min-w-[140px]`}
        />
      </div>
      <input name="title" placeholder="标题（可选）" className={inputCls} />
      <textarea
        name="content"
        required
        rows={4}
        placeholder="内容 · 支持 Markdown"
        className={`${inputCls} font-mono text-sm`}
      />
      <div className="flex items-center justify-between">
        <AttachmentUpload />
        <button type="submit" className="px-4 py-2 rounded-card bg-ink-900 text-ink-50 text-sm font-medium">
          发布
        </button>
      </div>
    </form>
  )
}

const inputCls  = 'w-full px-3 py-2 rounded-card border border-ink-200 focus:border-ink-900 outline-none'
const selectCls = 'px-3 py-2 rounded-card border border-ink-200 focus:border-ink-900 outline-none bg-white text-sm'
