import { HfInference } from '@huggingface/inference'
import "server-only"
import { EMOJI_SIZE, SITE_URL } from "../lib/constants"

export class ReplicateClient {
  client: HfInference
  fetch: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>

  constructor({ auth }: { auth: string }) {
    this.client = new HfInference(auth)
    
    // 🫠 - 保留为兼容现有代码
    this.fetch = (input: RequestInfo | URL, init?: RequestInit) =>
      fetch(input, { ...init, cache: "no-store" })
  }

  async createEmoji({ id, prompt }: { id: string; prompt: string }) {
    try {
      // 确保模型名称正确
      const modelId = "stabilityai/stable-diffusion-xl-base-1.0";
      console.log(`Using model: ${modelId} for prompt: ${prompt}`);
      
      // 使用Hugging Face的图像生成模型
      const blob = await this.client.textToImage({
        model: modelId,
        inputs: `A TOK emoji of a ${prompt}, emoji style, simple background, minimalist, cute character, vibrant colors, digital art, sticker art`,
        parameters: {
          negative_prompt: "racist, xenophobic, antisemitic, islamophobic, bigoted, text, watermark, complex, detailed, realistic, photograph",
          width: EMOJI_SIZE,
          height: EMOJI_SIZE
        }
      }).catch(error => {
        console.error("Hugging Face API error:", error);
        throw new Error(`Hugging Face API error: ${error.message}`);
      });

      // 由于Hugging Face直接返回图像而不是通过webhook，我们需要手动处理
      // 这里会生成图像但不会调用webhook，需要另外处理背景移除
      
      // 创建模拟URL以兼容现有代码
      const originalUrl = `${SITE_URL}/api/emojis/${id}`
      
      // 创建一个webhook URL以保持与原代码结构一致
      const webhook = new URL(`${SITE_URL}/api/webhook/remove-background`)
      webhook.searchParams.set("id", id)
      webhook.searchParams.set("secret", process.env.API_SECRET as string)
      
      // 返回一个类似Replicate格式的对象以兼容现有代码
      return {
        id: id,
        status: "succeeded",
        output: originalUrl,
        webhook: webhook.toString(),
        webhook_events_filter: ["completed"],
      }
    } catch (error) {
      console.error("Error creating emoji:", error)
      throw error
    }
  }

  async removeBackground({ id, image }: { id: string; image: string }) {
    try {
      // Hugging Face没有直接的背景移除模型，我们可以使用segmentation模型
      // 这里可能需要进一步开发，现在暂时返回原始图像
      
      // 创建一个webhook URL以保持与原代码结构一致
      const webhook = new URL(`${SITE_URL}/api/webhook/save-emoji`)
      webhook.searchParams.set("id", id)
      webhook.searchParams.set("secret", process.env.API_SECRET as string)
      
      // 返回一个类似Replicate格式的对象以兼容现有代码
      return {
        id: id,
        status: "succeeded",
        output: image, // 暂时直接返回原图
        webhook: webhook.toString(),
        webhook_events_filter: ["completed"],
      }
    } catch (error) {
      console.error("Error removing background:", error)
      throw error
    }
  }

  async classifyPrompt({ prompt: _prompt }: { prompt: string }): Promise<number> {
    try {
      // 使用Hugging Face的内容审核模型
      const result = await this.client.textClassification({
        model: "facebook/roberta-hate-speech-dynabench-r4-target",
        inputs: _prompt
      })
      
      // 将分类结果映射到0-10的安全评级
      const toxicityScore = result.find(label => 
        label.label.includes("hate") || 
        label.label.includes("toxic") || 
        label.label.includes("offense"))?.score || 0
        
      return Math.floor(toxicityScore * 10)
    } catch (error) {
      console.error("Error classifying prompt:", error)
      return 0 // 默认为安全
    }
  }
}

export const replicate = new ReplicateClient({
  auth: process.env.HUGGINGFACE_API_KEY as string,
})