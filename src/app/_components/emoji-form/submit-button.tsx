"use client"

import { forwardRef } from "react"
// @ts-ignore
import { useFormStatus } from "react-dom"
import { Loader2 } from "lucide-react"

interface SubmitButtonProps {
  isGenerating?: boolean
}

export const SubmitButton = forwardRef<HTMLButtonElement, SubmitButtonProps>(({ isGenerating }, ref) => {
  const { pending } = useFormStatus()

  return (
    <button
      ref={ref}
      type="submit"
      disabled={pending || isGenerating}
      className="bg-white text-black rounded-lg px-3 py-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
    >
      {pending || isGenerating ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>生成中...</span>
        </>
      ) : (
        "生成"
      )}
    </button>
  )
})