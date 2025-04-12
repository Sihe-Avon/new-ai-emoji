import { NextRequest, NextResponse } from 'next/server';

// 这个API路由将代理对Upstash的请求
export async function GET(request: NextRequest) {
  try {
    // 获取请求参数
    const url = new URL(request.url);
    const path = url.searchParams.get('path') || '';
    
    // 构建Upstash API URL
    const upstashUrl = `https://app.upstash.com/api/${path}`;
    
    // 转发请求到Upstash
    const response = await fetch(upstashUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // 如果需要，添加授权头
        // 'Authorization': `Bearer ${process.env.UPSTASH_API_TOKEN}`,
      },
    });
    
    // 获取响应数据
    const data = await response.json();
    
    // 返回响应，添加CORS头
    return NextResponse.json(data, {
      status: response.status,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to proxy request to Upstash' },
      { 
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
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
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

// 处理POST请求
export async function POST(request: NextRequest) {
  try {
    // 获取请求参数和正文
    const url = new URL(request.url);
    const path = url.searchParams.get('path') || '';
    const body = await request.json();
    
    // 构建Upstash API URL
    const upstashUrl = `https://app.upstash.com/api/${path}`;
    
    // 转发请求到Upstash
    const response = await fetch(upstashUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // 如果需要，添加授权头
        // 'Authorization': `Bearer ${process.env.UPSTASH_API_TOKEN}`,
      },
      body: JSON.stringify(body),
    });
    
    // 获取响应数据
    const data = await response.json();
    
    // 返回响应，添加CORS头
    return NextResponse.json(data, {
      status: response.status,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to proxy request to Upstash' },
      { 
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      }
    );
  }
}
