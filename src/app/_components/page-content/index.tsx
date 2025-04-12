"use client"

import { EmojiForm } from "../emoji-form"
import { EmojiGrid } from "../emoji-grid"
import { EmojiCount } from "../emoji-count"

export function PageContent() {
  return (
    <div className="w-full max-w-3xl mx-auto space-y-12 py-12">
      <div className="space-y-4 text-center animate-in fade-in slide-in-from-bottom-4 duration-1200 ease-in-out fill-mode-both">
        <h1 className="text-4xl font-bold tracking-tight">AI表情包生成器</h1>
        <p className="text-lg text-gray-600 max-w-lg mx-auto">
          输入简单描述，通过人工智能生成专属表情包。无需设计技能，只需几秒钟！
        </p>
      </div>

      <div className="animate-in fade-in slide-in-from-bottom-4 duration-1200 delay-200 ease-in-out fill-mode-both">
        <EmojiForm />
      </div>

      <div className="animate-in fade-in slide-in-from-bottom-4 duration-1200 delay-300 ease-in-out fill-mode-both">
        <h2 className="text-2xl font-semibold mb-4">最近生成的表情</h2>
        <EmojiGrid />
      </div>

      <div className="text-center text-sm text-gray-500 animate-in fade-in slide-in-from-bottom-4 duration-1200 delay-400 ease-in-out fill-mode-both">
        <EmojiCount />
        <p className="mt-2">
          使用Hugging Face AI技术提供支持。尝试输入各种有趣的提示词！
        </p>
      </div>
    </div>
  )
}