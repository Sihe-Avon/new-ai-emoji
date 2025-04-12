import { Response } from "@/server/utils"
import { SignJWT } from "jose"
import { nanoid } from "nanoid"
import { type NextRequest, NextResponse } from "next/server"

// 移除Edge运行时配置
// export const runtime = "edge"
export const revalidate = 0

export async function GET(request: NextRequest) {
  const ip = request.ip ?? "127.0.0.1"
  const userAgent = request.headers.get("user-agent") || "unknown"
  const isIOS = /iPhone|iPad|iPod/.test(userAgent)

  try {
    const token = await new SignJWT({ ip, isIOS })
      .setProtectedHeader({ alg: "HS256" })
      .setJti(nanoid())
      .setIssuedAt()
      .setExpirationTime("1d")
      .sign(new TextEncoder().encode(process.env.API_SECRET ?? ""))

    // 创建响应
    const response = NextResponse.json(
      { token },
      { 
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      }
    );

    return response;
  } catch (error) {
    console.error("Token generation error:", error);
    
    // 返回错误响应
    return NextResponse.json(
      { error: "Failed to generate token" },
      { 
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      }
    );
  }
}

// 处理OPTIONS请求（预检请求）
export async function OPTIONS() {
  return NextResponse.json({}, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
