"use server"

import { prisma } from "./db"
import { VALID_EMOJI_FILTER } from "./utils"
import { Prisma } from "@prisma/client"

export async function getCount() {
  return prisma.emoji.count()
}

export async function fetchEmojis(opts: {
  take?: number
  skip?: number
  orderBy?: Prisma.EmojiOrderByWithRelationInput | Prisma.EmojiOrderByWithRelationInput[]
}) {
  const take = opts.take ?? 100
  const skip = opts.skip ?? undefined
  const orderBy = opts.orderBy ?? { createdAt: Prisma.SortOrder.desc }

  return prisma.emoji.findMany({
    select: { 
      id: true, 
      prompt: true,
      originalUrl: true,
      noBackgroundUrl: true,
      createdAt: true 
    },
    orderBy,
    where: VALID_EMOJI_FILTER,
    take,
    skip,
  })
}