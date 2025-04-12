import { Suspense } from "react"

interface CountDisplayProps {
  count?: number
}

function CountDisplay({ count }: CountDisplayProps) {
  return (
    <p className="text-gray-500 mb-12 text-base animate-in fade-in slide-in-from-bottom-4 duration-1200 ease-in-out">
      {count || "–––"} emojis generated and counting!
    </p>
  )
}

// 将获取数据的逻辑移到服务端组件
async function getCount() {
  'use server'
  const { prisma } = await import("@/server/db")
  return prisma.emoji.count()
}

async function AsyncEmojiCount() {
  const count = await getCount()
  return <CountDisplay count={count} />
}

export function EmojiCount() {
  return (
    <Suspense fallback={<CountDisplay />}>
      <AsyncEmojiCount />
    </Suspense>
  )
}
