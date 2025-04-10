"use server"

import { nanoid } from "@/lib/utils"
import { prisma } from "@/server/db"
import { replicate } from "@/server/replicate"
import { Ratelimit } from "@upstash/ratelimit"
import { createClient } from "redis"
import { jwtVerify } from "jose"
import { redirect } from "next/navigation"
import { z } from "zod"

const jwtSchema = z.object({
  ip: z.string(),
  isIOS: z.boolean(),
})

// 创建Redis客户端
const redis = createClient({
  url: process.env.REDIS_URL
})

// 直接使用Redis客户端而不是函数
// 确保Redis连接初始化
const connectRedis = async () => {
  if (!redis.isOpen) {
    await redis.connect();
  }
  return redis;
}

// 初始化Redis连接
connectRedis().catch(console.error);

const ratelimit = {
  free: new Ratelimit({
    redis: redis,
    limiter: Ratelimit.slidingWindow(500, "1 d"),
  }),
  ios: new Ratelimit({
    redis: redis,
    limiter: Ratelimit.slidingWindow(3, "7 d"),
    prefix: "ratelimit:ios",
  }),
}

interface FormState {
  message: string
}

export async function createEmoji(prevFormState: FormState | undefined, formData: FormData): Promise<FormState | void> {
  const prompt = (formData.get("prompt") as string | null)?.trim().replaceAll(":", "")
  const token = formData.get("token") as string | null

  if (!prompt) return // no need to display an error message for blank prompts
  const id = nanoid()

  try {
    const verified = await jwtVerify(token ?? "", new TextEncoder().encode(process.env.API_SECRET ?? ""))
    const { ip, isIOS } = jwtSchema.parse(verified.payload)

    const { remaining } = await (isIOS ? ratelimit.ios.limit(ip) : ratelimit.free.limit(ip))
    if (remaining <= 0) return { message: "Free limit reached, download mobile app for unlimited access." }

    const safetyRating = await replicate.classifyPrompt({ prompt })
    const data = { id, prompt, safetyRating }

    if (safetyRating >= 9) {
      await prisma.emoji.create({ data: { ...data, isFlagged: true } })
      return { message: "Nice try! Your prompt is inappropriate, let's keep it PG." }
    }

    await Promise.all([prisma.emoji.create({ data }), replicate.createEmoji(data)])
  } catch (error) {
    console.error(error)
    return { message: "Connection error, please refresh the page." }
  }

  redirect(`/p/${id}`)
}
