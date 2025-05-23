"use client"

import { useEffect, useRef, useState } from "react"
import { createEmoji } from "./action"
import { SubmitButton } from "./submit-button"
// @ts-ignore
import { useFormState } from "react-dom"
import toast from "react-hot-toast"
import useSWR from "swr"

interface EmojiFormProps {
  initialPrompt?: string
}

export function EmojiForm({ initialPrompt }: EmojiFormProps) {
  const [formState, formAction] = useFormState(createEmoji)
  const submitRef = useRef<React.ElementRef<"button">>(null)
  const [token, setToken] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)

  useEffect(() => {
    if (!formState) return
    toast.error(formState.message)
  }, [formState])

  // Form submission handler
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsGenerating(true)
    try {
      await formAction(new FormData(e.currentTarget))
    } finally {
      setIsGenerating(false)
    }
  }

  useSWR(
    "/api/token",
    async (url: string) => {
      try {
        const res = await fetch(url)
        if (!res.ok) {
          throw new Error(`Failed to fetch token: ${res.status}`)
        }
        const json = await res.json()
        return json?.token ?? ""
      } catch (error) {
        console.error("Token fetch error:", error)
        toast.error("Failed to get authentication token. Please refresh the page.")
        return ""
      }
    },
    {
      onSuccess: (token: string) => setToken(token),
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      errorRetryCount: 3,
    }
  )

  return (
    <form 
      action={formAction} 
      onSubmit={handleSubmit}
      className="bg-black rounded-xl shadow-lg h-fit flex flex-row px-1 items-center w-full"
    >
      <input
        defaultValue={initialPrompt}
        type="text"
        name="prompt"
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault()
            submitRef.current?.click()
          }
        }}
        placeholder="cat"
        className="bg-transparent text-white placeholder:text-gray-400 ring-0 outline-none resize-none py-2.5 px-2 font-mono text-sm h-10 w-full transition-all duration-300"
      />
      <input aria-hidden type="text" name="token" value={token} className="hidden" readOnly />
      <SubmitButton ref={submitRef} isGenerating={isGenerating} />
    </form>
  )
}