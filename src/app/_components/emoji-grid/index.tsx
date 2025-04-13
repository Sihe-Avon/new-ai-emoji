"use client"

import { type FC } from "react"
import { EmojiCard } from "../emoji-card"
import { fetchEmojis } from "@/server/actions"
import { Prisma } from "@prisma/client"

interface Emoji {
  id: string
  prompt: string
  originalUrl: string | null
  noBackgroundUrl: string | null
  createdAt: Date
}

interface EmojiGridProps {
  prompt?: string
}

interface FetchEmojisOptions {
  take?: number
  skip?: number
  where?: {
    prompt?: {
      contains: string
    }
  }
}

export const EmojiGrid: FC<EmojiGridProps> = async ({ prompt }) => {
  const emojis = await fetchEmojis({
    take: 100,
    where: prompt
      ? {
          prompt: {
            contains: prompt,
          },
        }
      : undefined,
  } as FetchEmojisOptions)

  if (!emojis?.length) {
    return (
      <div className="text-center text-gray-500 py-10">
        暂无表情包
      </div>
    )
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-1200 ease-in-out">
      <h2 className="font-semibold text-md text-left w-full mb-3">
        {!!prompt ? "Related Emojis" : "Recent Emojis"}
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {emojis.map((emoji: Emoji) => (
          <EmojiCard
            key={emoji.id}
            id={emoji.id}
            prompt={emoji.prompt}
            originalUrl={emoji.originalUrl}
            noBackgroundUrl={emoji.noBackgroundUrl}
            createdAt={emoji.createdAt}
          />
        ))}
      </div>
    </div>
  )
}
