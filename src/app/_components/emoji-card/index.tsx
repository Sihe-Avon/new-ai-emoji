"use client"

import { useState } from "react"
import Image from "next/image"
import toast from "react-hot-toast"

interface EmojiCardProps {
  id: string
  prompt: string
  originalUrl: string
  noBackgroundUrl?: string
  createdAt: Date
}

export function EmojiCard({ id, prompt, originalUrl, noBackgroundUrl, createdAt }: EmojiCardProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [selectedUrl, setSelectedUrl] = useState(originalUrl)
  
  const handleImageLoad = () => {
    setIsLoading(false)
  }

  const handleDownload = async () => {
    try {
      const response = await fetch(selectedUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `emoji-${id}.png`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      toast.success('表情包已下载')
    } catch (error) {
      console.error("Download error:", error)
      toast.error('下载失败，请重试')
    }
  }

  return (
    <div className="relative bg-white rounded-xl p-3 shadow-sm hover:shadow-md transition-all duration-300">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-xl">
          <div className="animate-pulse text-gray-400">加载中...</div>
        </div>
      )}
      
      <div className="relative aspect-square">
        <Image
          src={selectedUrl}
          alt={prompt}
          fill
          className="object-contain rounded-lg"
          onLoad={handleImageLoad}
          priority
        />
      </div>
      
      <div className="mt-2 flex justify-between items-center">
        <p className="text-sm text-gray-700 truncate max-w-[70%]" title={prompt}>
          {prompt}
        </p>
        
        <button 
          onClick={handleDownload}
          className="text-xs bg-black text-white px-2 py-1 rounded-md hover:bg-gray-800"
        >
          下载
        </button>
      </div>
      
      {noBackgroundUrl && (
        <div className="mt-2 flex gap-2">
          <button 
            onClick={() => setSelectedUrl(originalUrl)} 
            className={`text-xs px-2 py-1 rounded-md ${selectedUrl === originalUrl ? 'bg-black text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            原始
          </button>
          <button 
            onClick={() => setSelectedUrl(noBackgroundUrl)}
            className={`text-xs px-2 py-1 rounded-md ${selectedUrl === noBackgroundUrl ? 'bg-black text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            无背景
          </button>
        </div>
      )}
      
      <p className="text-xs text-gray-400 mt-2">
        {new Date(createdAt).toLocaleDateString()}
      </p>
    </div>
  )
}
