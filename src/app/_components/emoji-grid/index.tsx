import { EmojiCard } from "../emoji-card"
import { Prisma } from "@prisma/client"

interface EmojiGridProps {
  prompt?: string
}

// 将获取数据的逻辑移到服务端
async function fetchEmojis(opts: {
  take?: number
  skip?: number
  orderBy?: Prisma.EmojiOrderByWithRelationInput | Prisma.EmojiOrderByWithRelationInput[]
}) {
  'use server'
  const { prisma } = await import("@/server/db")
  const { VALID_EMOJI_FILTER } = await import("@/server/utils")
  
  const take = opts.take ?? 100
  const skip = opts.skip ?? undefined
  const orderBy = opts.orderBy ?? { createdAt: Prisma.SortOrder.desc }

  return prisma.emoji.findMany({
    select: { id: true, updatedAt: true },
    orderBy,
    where: VALID_EMOJI_FILTER,
    take,
    skip,
  })
}

export async function EmojiGrid({ prompt }: EmojiGridProps) {
  const emojis = await fetchEmojis({
    take: 100,
    orderBy: prompt
      ? {
          createdAt: "desc", // 使用创建时间排序代替全文搜索排序
        }
      : undefined,
  })

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-1200 ease-in-out">
      <h2 className="font-semibold text-md text-left w-full mb-3">{!!prompt ? "Related Emojis" : "Recent Emojis"}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 justify-items-stretch w-full">
        {emojis.map((emoji) => (
          <EmojiCard key={emoji.id} id={emoji.id} />
        ))}
      </div>
    </div>
  )
}
