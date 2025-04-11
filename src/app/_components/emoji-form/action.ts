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

// 创建一个简单的适配器，实现@upstash/ratelimit需要的Redis接口
class RedisAdapter {
  private client: ReturnType<typeof createClient>;
  private connected = false;

  constructor() {
    this.client = createClient({
      url: process.env.REDIS_URL
    });
  }

  async connect() {
    if (!this.connected) {
      await this.client.connect();
      this.connected = true;
    }
  }

  // 实现@upstash/ratelimit需要的方法
  async get(key: string) {
    await this.connect();
    const value = await this.client.get(key);
    return value ? JSON.parse(value) : null;
  }

  async set(key: string, value: any, opts?: { ex?: number }) {
    await this.connect();
    await this.client.set(key, JSON.stringify(value), opts?.ex ? { EX: opts.ex } : undefined);
    return 'OK';
  }

  async del(key: string) {
    await this.connect();
    return await this.client.del(key);
  }

  async hget(key: string, field: string) {
    await this.connect();
    return await this.client.hGet(key, field);
  }

  async hset(key: string, field: string, value: string) {
    await this.connect();
    await this.client.hSet(key, field, value);
    return 1;
  }

  async incr(key: string) {
    await this.connect();
    return await this.client.incr(key);
  }

  async expire(key: string, seconds: number) {
    await this.connect();
    return await this.client.expire(key, seconds);
  }
}

const redisAdapter = new RedisAdapter();

const ratelimit = {
  free: new Ratelimit({
    redis: redisAdapter as any,
    limiter: Ratelimit.slidingWindow(500, "1 d"),
  }),
  ios: new Ratelimit({
    redis: redisAdapter as any,
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
